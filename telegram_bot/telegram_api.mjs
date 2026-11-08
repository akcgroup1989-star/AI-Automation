import { CONFIG } from './config.mjs';

const BASE_URL = `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}`;

export async function callApi(method, data = {}) {
  try {
    const res = await fetch(`${BASE_URL}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.ok) {
      console.error(`❌ Telegram API Error [${method}]:`, json.description);
    }
    return json;
  } catch (err) {
    console.error(`❌ Network Error [${method}]:`, err.message);
    return { ok: false, error: err.message };
  }
}

export async function getUpdates(offset = 0, timeout = 30) {
  try {
    const res = await fetch(`${BASE_URL}/getUpdates?offset=${offset}&timeout=${timeout}`);
    return await res.json();
  } catch (err) {
    console.error('❌ Error fetching updates:', err.message);
    return { ok: false, result: [] };
  }
}

export async function sendMessage(chatId, text, extra = {}) {
  return await callApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    ...extra
  });
}

export async function editMessageText(chatId, messageId, text, extra = {}) {
  return await callApi('editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: 'HTML',
    ...extra
  });
}

export async function answerCallbackQuery(callbackQueryId, text = '') {
  return await callApi('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
    show_alert: false
  });
}
