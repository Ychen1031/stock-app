// src/services/newsApi.js
import axios from 'axios';

const BASE_URL = 'https://api.marketaux.com/v1/news/all';

// ⚠️ 把這裡換成你自己的 API Token
const API_TOKEN = 'ltRfPlzhxx3MwlyRNqNp6Bl9ydoF0UG3EQaOA6gs';
// ⚠️ ltRfPlzhxx3MwlyRNqNp6Bl9ydoF0UG3EQaOA6gs
export async function fetchLatestNews() {
  const params = {
    api_token: API_TOKEN,
    language: 'en',            // 先抓英文財經新聞
    must_have_entities: 'true',// 至少有標到相關金融標的
    entity_types: 'index,equity,etf',
    group_similar: 'true',     // 自動幫你合併很相似的新聞
    limit: 20,                 // 一次抓 20 則就好
  };

  const res = await axios.get(BASE_URL, { params });

  // Marketaux 回傳格式：{ meta: {...}, data: [ ...文章... ] }
  return res.data?.data ?? [];
}