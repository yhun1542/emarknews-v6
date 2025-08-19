module.exports = {
  STOP_WORDS_KO: new Set(['그', '이', '저', '것', '등', '및']),
  STOP_WORDS_EN: new Set(['the', 'a', 'an', 'and', 'or', 'but']),
  SOURCE_QUALITY: {
    'reuters.com': 1.20,
    'bbc.com': 1.15,
    'chosun.com': 1.15,
    'nhk.or.jp': 1.18
  },
  RSS_FEEDS: {
    world: ['https://feeds.reuters.com/reuters/topNews'],
    korea: ['https://rss.donga.com/total.xml'],
    japan: ['https://www3.nhk.or.jp/rss/news/cat0.xml']
  },
  CACHE_CONFIG: {
    DEFAULT_TTL: 600,
    PRELOAD_INTERVAL: 590
  },
  RATING_WEIGHTS: {
    SOURCE_QUALITY: 0.25,
    FRESHNESS: 0.20,
    ENGAGEMENT: 0.20,
    CONTENT_LENGTH: 0.15,
    CLUSTER_SIZE: 0.10,
    KEYWORD_RELEVANCE: 0.10
  },
  LABEL_RULES: {
    긴급: [/breaking|urgent|속보|긴급/i],
    중요: [/important|major|중요|주요/i],
    HOT: [/viral|trending|hot|화제/i]
  }
};
