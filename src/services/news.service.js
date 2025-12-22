import puppeteer from 'puppeteer';

// 메모리 캐시 (간단한 객체)
let newsCache = {
  data: [],
  lastUpdated: null,
  expiresAt: null,
};

const CACHE_DURATION = 60 * 60 * 1000; // 1시간 (밀리초)
const TARGET_URL = 'https://news.daum.net/animal';
const TARGET_DIV_ID = '02ab95b4-c368-4348-bc66-ef63539add3e';

/**
 * 다음 뉴스 크롤링 - Puppeteer 방식
 */
export const scrapeNews = async () => {
  let browser = null;

  try {
    console.log('[뉴스 크롤링] 시작:', new Date().toISOString());

    // 1. 브라우저 실행
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // 2. 페이지 이동 및 대기
    await page.goto(TARGET_URL, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // 3. 페이지 로드 대기 (추가 대기)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 4. 페이지에서 뉴스 데이터 추출
    const newsItems = await page.evaluate((targetId) => {
      const items = [];

      // .list_newsheadline2 ul 안의 li 항목들 추출
      const newsList = document.querySelector('.list_newsheadline2');

      if (!newsList) {
        return items;
      }

      const newsElements = newsList.querySelectorAll('li');

      newsElements.forEach((li, index) => {
        try {
          // a 링크
          const link = li.querySelector('a.item_newsheadline2');
          if (!link || !link.href) return;

          // 제목
          const titleElem = li.querySelector('.tit_txt');
          if (!titleElem) return;

          // 이미지 (source srcset 또는 img src)
          let imageUrl = null;
          const sourceElem = li.querySelector('source[srcset]');
          if (sourceElem) {
            const srcset = sourceElem.getAttribute('srcset');
            // srcset에서 URL 추출 (공백이나 쉼표로 구분된 첫 번째 URL)
            imageUrl = srcset ? srcset.split(/[\s,]+/)[0] : null;
          }
          if (!imageUrl) {
            const imgElem = li.querySelector('img');
            if (imgElem) {
              imageUrl = imgElem.src || imgElem.getAttribute('data-src');
            }
          }

          // 요약 (선택사항)
          const summaryElem = li.querySelector('.desc_txt');
          const summary = summaryElem ? summaryElem.textContent.trim() : null;

          // 언론사명 및 시간
          const infoElems = li.querySelectorAll('.txt_info');
          let cpName = null;
          let timeInfo = null;

          if (infoElems.length >= 1) {
            cpName = infoElems[0].textContent.trim();
          }
          if (infoElems.length >= 2) {
            timeInfo = infoElems[1].textContent.trim();
          }

          // ID 생성 (URL의 마지막 부분)
          const id = link.href.split('/').pop() || `news_${index}`;

          items.push({
            id,
            title: titleElem.textContent.trim(),
            summary,
            pcUrl: link.href,
            imageUrl,
            cpName,
            createdAt: timeInfo || new Date().toISOString(),
            scrapedAt: Date.now(),
          });
        } catch (e) {
          // 개별 항목 파싱 실패는 무시
        }
      });

      return items;
    }, TARGET_DIV_ID);

    await browser.close();
    browser = null;

    if (newsItems.length === 0) {
      throw new Error('뉴스 항목을 찾을 수 없습니다.');
    }

    console.log(`[뉴스 크롤링] 완료: ${newsItems.length}개 수집`);
    return newsItems;

  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('[뉴스 크롤링] 오류:', error.message);
    throw new Error('뉴스 크롤링 실패: ' + error.message);
  }
};

/**
 * 캐시된 뉴스 조회
 */
export const getCachedNews = async () => {
  const now = Date.now();

  // 캐시가 유효한 경우
  if (newsCache.data.length > 0 && newsCache.expiresAt && now < newsCache.expiresAt) {
    console.log('[뉴스 조회] 캐시 반환');
    return {
      data: newsCache.data,
      cached: true,
      lastUpdated: newsCache.lastUpdated,
    };
  }

  // 캐시가 없거나 만료된 경우 - 크롤링 실행
  console.log('[뉴스 조회] 캐시 만료 - 크롤링 시작');
  const newsItems = await scrapeNews();

  // 캐시 업데이트
  newsCache = {
    data: newsItems,
    lastUpdated: now,
    expiresAt: now + CACHE_DURATION,
  };

  return {
    data: newsItems,
    cached: false,
    lastUpdated: now,
  };
};

/**
 * 캐시 강제 갱신
 */
export const refreshCache = async () => {
  console.log('[뉴스 캐시] 수동 갱신 요청');
  const newsItems = await scrapeNews();

  const now = Date.now();
  newsCache = {
    data: newsItems,
    lastUpdated: now,
    expiresAt: now + CACHE_DURATION,
  };

  return newsCache;
};

/**
 * 캐시 상태 조회
 */
export const getCacheStatus = () => {
  return {
    itemCount: newsCache.data.length,
    lastUpdated: newsCache.lastUpdated,
    expiresAt: newsCache.expiresAt,
    isExpired: newsCache.expiresAt ? Date.now() >= newsCache.expiresAt : true,
  };
};
