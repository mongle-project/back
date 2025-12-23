import puppeteer from 'puppeteer';

// 메모리 캐시 (간단한 객체)
let newsCache = {
  news: [],           // 일반 뉴스
  familyInfo: [],     // 입양 뉴스 ("가족이 되어주세요")
  lastUpdated: null,
  expiresAt: null,
};

const CACHE_DURATION = 60 * 60 * 1000; // 1시간 (밀리초)
const TARGET_URL = 'https://news.daum.net/animal';
const GENERAL_NEWS_SELECTOR = '.list_newsheadline2';
// NOTE: 입양 뉴스 DIV ID는 다음 CMS에서 자동 생성될 수 있습니다.
// 선택자가 변경되면 페이지 소스에서 업데이트된 ID를 확인하세요.
const ADOPTION_DIV_ID = '7f98a608-823f-4d8c-afed-2ced023b7caf';

/**
 * 일반 뉴스 크롤링 (기존 로직)
 */
const scrapeGeneralNews = async (page) => {
  const newsItems = await page.evaluate(() => {
    const items = [];
    const newsList = document.querySelector('.list_newsheadline2');

    if (!newsList) {
      console.warn('[일반뉴스] .list_newsheadline2를 찾을 수 없음');
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
  });

  return newsItems;
};

/**
 * 입양 뉴스 크롤링 ("가족이 되어주세요" 섹션)
 */
const scrapeAdoptionNews = async (page, divId) => {
  const adoptionItems = await page.evaluate((targetDivId) => {
    const items = [];
    // querySelector 대신 getElementById 사용 (숫자로 시작하는 ID 처리)
    const adoptionDiv = document.getElementById(targetDivId);

    if (!adoptionDiv) {
      console.warn('[입양뉴스] DIV를 찾을 수 없음:', targetDivId);
      return items;
    }

    const newsList = adoptionDiv.querySelector('ul.list_newsbasic');
    if (!newsList) {
      console.warn('[입양뉴스] ul.list_newsbasic을 찾을 수 없음');
      return items;
    }

    const newsElements = newsList.querySelectorAll('li');

    newsElements.forEach((li, index) => {
      try {
        // a 링크
        const link = li.querySelector('a.item_newsbasic');
        if (!link || !link.href) return;

        // 제목
        const titleElem = li.querySelector('strong.tit_txt');
        if (!titleElem) return;

        // 이미지 (source srcset 우선)
        let imageUrl = null;
        const sourceElem = li.querySelector('source[srcset]');
        if (sourceElem) {
          const srcset = sourceElem.getAttribute('srcset');
          imageUrl = srcset ? srcset.split(/[\s,]+/)[0] : null;
        }
        if (!imageUrl) {
          const imgElem = li.querySelector('img');
          if (imgElem) {
            imageUrl = imgElem.src || imgElem.getAttribute('data-src');
          }
        }

        // 요약
        const summaryElem = li.querySelector('p.desc_txt');
        const summary = summaryElem ? summaryElem.textContent.trim() : null;

        // 언론사명 및 시간
        const infoElems = li.querySelectorAll('span.txt_info');
        let cpName = null;
        let timeInfo = null;

        if (infoElems.length >= 1) {
          cpName = infoElems[0].textContent.trim();
        }
        if (infoElems.length >= 2) {
          timeInfo = infoElems[1].textContent.trim();
        }

        // ID 생성
        const id = link.href.split('/').pop() || `adoption_${index}`;

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
  }, divId);

  return adoptionItems;
};

/**
 * 다음 뉴스 크롤링 - 일반 뉴스 + 입양 뉴스
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

    // 4. 일반 뉴스와 입양 뉴스 병렬 크롤링 (부분 성공 허용)
    const [generalResult, adoptionResult] = await Promise.allSettled([
      scrapeGeneralNews(page),
      scrapeAdoptionNews(page, ADOPTION_DIV_ID),
    ]);

    await browser.close();
    browser = null;

    // 결과 추출
    const news = generalResult.status === 'fulfilled' ? generalResult.value : [];
    const familyInfo = adoptionResult.status === 'fulfilled' ? adoptionResult.value : [];

    // 부분 실패 로깅
    if (generalResult.status === 'rejected') {
      console.error('[일반뉴스 크롤링 실패]:', generalResult.reason);
    }
    if (adoptionResult.status === 'rejected') {
      console.error('[입양뉴스 크롤링 실패]:', adoptionResult.reason);
    }

    // 완전 실패 - 두 섹션 모두 비어있을 때만 에러
    if (news.length === 0 && familyInfo.length === 0) {
      throw new Error('모든 뉴스 섹션 크롤링 실패');
    }

    console.log(`[뉴스 크롤링] 완료: 일반 ${news.length}개, 입양 ${familyInfo.length}개`);

    return { news, familyInfo };

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

  // 캐시가 유효한 경우 (news 또는 familyInfo 중 하나라도 있으면 유효)
  const hasValidCache =
    (newsCache.news.length > 0 || newsCache.familyInfo.length > 0) &&
    newsCache.expiresAt &&
    now < newsCache.expiresAt;

  if (hasValidCache) {
    console.log('[뉴스 조회] 캐시 반환');
    return {
      news: newsCache.news,
      familyInfo: newsCache.familyInfo,
      cached: true,
      lastUpdated: newsCache.lastUpdated,
    };
  }

  // 캐시가 없거나 만료된 경우 - 크롤링 실행
  console.log('[뉴스 조회] 캐시 만료 - 크롤링 시작');

  try {
    const { news, familyInfo } = await scrapeNews();

    // 캐시 업데이트
    newsCache = {
      news,
      familyInfo,
      lastUpdated: now,
      expiresAt: now + CACHE_DURATION,
    };

    return {
      news,
      familyInfo,
      cached: false,
      lastUpdated: now,
    };
  } catch (error) {
    // 크롤링 실패 시 stale cache가 있으면 반환
    if (newsCache.news.length > 0 || newsCache.familyInfo.length > 0) {
      console.warn('[뉴스 조회] 크롤링 실패 - 만료된 캐시 반환:', error.message);
      return {
        news: newsCache.news,
        familyInfo: newsCache.familyInfo,
        cached: true,
        stale: true,
        lastUpdated: newsCache.lastUpdated,
      };
    }

    // 캐시도 없으면 에러 발생
    throw error;
  }
};

/**
 * 캐시 강제 갱신
 */
export const refreshCache = async () => {
  console.log('[뉴스 캐시] 수동 갱신 요청');
  const { news, familyInfo } = await scrapeNews();

  const now = Date.now();
  newsCache = {
    news,
    familyInfo,
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
    newsCount: newsCache.news.length,
    familyInfoCount: newsCache.familyInfo.length,
    totalCount: newsCache.news.length + newsCache.familyInfo.length,
    lastUpdated: newsCache.lastUpdated,
    expiresAt: newsCache.expiresAt,
    isExpired: newsCache.expiresAt ? Date.now() >= newsCache.expiresAt : true,
  };
};
