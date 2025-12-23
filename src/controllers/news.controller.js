import * as newsService from '../services/news.service.js';

/**
 * GET /api/news
 * 뉴스 목록 조회 (캐시에서)
 */
export const getNews = async (req, res) => {
  try {
    const result = await newsService.getCachedNews();

    res.status(200).json({
      message: '뉴스 조회 성공',
      cached: result.cached,
      lastUpdated: new Date(result.lastUpdated).toISOString(),
      count: {
        news: result.news.length,
        familyInfo: result.familyInfo.length,
      },
      news: result.news,
      familyInfo: result.familyInfo,
    });

  } catch (error) {
    console.error('[뉴스 조회] 오류:', error);
    res.status(500).json({
      message: '뉴스 조회 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

/**
 * POST /api/news/refresh
 * 뉴스 캐시 강제 갱신
 */
export const refreshNews = async (req, res) => {
  try {
    const cache = await newsService.refreshCache();

    res.status(200).json({
      message: '뉴스 캐시 갱신 완료',
      lastUpdated: new Date(cache.lastUpdated).toISOString(),
      expiresAt: new Date(cache.expiresAt).toISOString(),
      count: {
        news: cache.news.length,
        familyInfo: cache.familyInfo.length,
      },
      news: cache.news,
      familyInfo: cache.familyInfo,
    });

  } catch (error) {
    console.error('[뉴스 갱신] 오류:', error);
    res.status(500).json({
      message: '뉴스 캐시 갱신 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

/**
 * GET /api/news/status
 * 캐시 상태 조회 (디버깅용)
 */
export const getCacheStatus = (req, res) => {
  try {
    const status = newsService.getCacheStatus();

    res.status(200).json({
      message: '캐시 상태 조회 성공',
      newsCount: status.newsCount,
      familyInfoCount: status.familyInfoCount,
      totalCount: status.totalCount,
      lastUpdated: status.lastUpdated
        ? new Date(status.lastUpdated).toISOString()
        : null,
      expiresAt: status.expiresAt
        ? new Date(status.expiresAt).toISOString()
        : null,
      isExpired: status.isExpired,
    });

  } catch (error) {
    console.error('[캐시 상태] 오류:', error);
    res.status(500).json({
      message: '캐시 상태 조회 실패',
      error: error.message,
    });
  }
};
