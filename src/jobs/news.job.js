import cron from 'node-cron';
import * as newsService from '../services/news.service.js';

/**
 * 뉴스 자동 크롤링 스케줄러
 * 매 시간 정각에 실행 (예: 09:00, 10:00, 11:00...)
 */
export const startNewsCronJob = () => {
  // 크론 표현식: '0 * * * *' = 매시간 0분
  cron.schedule('0 * * * *', async () => {
    console.log('[크론잡] 뉴스 자동 크롤링 시작:', new Date().toISOString());

    try {
      await newsService.refreshCache();
      console.log('[크론잡] 뉴스 캐시 갱신 완료');
    } catch (error) {
      console.error('[크론잡] 뉴스 크롤링 실패:', error.message);
    }
  });

  console.log('[크론잡] 뉴스 자동 크롤링 스케줄러 시작됨 (매시간 정각)');
};

/**
 * 서버 시작 시 초기 크롤링
 */
export const initializeNewsCache = async () => {
  console.log('[초기화] 뉴스 캐시 초기화 중...');
  try {
    await newsService.refreshCache();
    console.log('[초기화] 뉴스 캐시 준비 완료');
  } catch (error) {
    console.error('[초기화] 초기 크롤링 실패:', error.message);
  }
};
