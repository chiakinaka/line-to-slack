const axios = require('axios');

// 日本語か中国語かを判定する
function detectLanguage(text) {
  // 中国語の文字範囲
  const chineseRegex = /[\u4e00-\u9fff]/;
  // 日本語のひらがな・カタカナの文字範囲
  const japaneseRegex = /[\u3040-\u30ff]/;

  if (japaneseRegex.test(text)) return 'ja';
  if (chineseRegex.test(text)) return 'zh-TW';
  return null; // 日本語でも中国語でもない場合
}

// Google翻訳APIで翻訳する
async function translate(text, targetLang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  const response = await axios.get(url);
  const translated = response.data[0].map(item => item[0]).join('');
  return translated;
}

// メインの翻訳関数
async function translateMessage(text) {
  const lang = detectLanguage(text);
  if (!lang) return null; // 対象外の言語

  const targetLang = lang === 'ja' ? 'zh-TW' : 'ja';
  const translated = await translate(text, targetLang);
  return translated;
}

module.exports = { translateMessage };