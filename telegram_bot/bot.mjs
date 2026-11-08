import { CONFIG } from './config.mjs';
import { getUpdates, sendMessage, editMessageText, answerCallbackQuery } from './telegram_api.mjs';
import { processWithAI } from './ai_engine.mjs';
import { parseTaskRequest } from './nlp_parser.mjs';
import { createTask, getAllTasks, updateTaskStatus } from './task_manager.mjs';

console.log('====================================================');
console.log('🥊 AKC FITNESS — AI AUTOMATION TELEGRAM BOT');
console.log('🤖 Trợ lý điều hành & Giao việc thông minh cho Sếp Ricky');
console.log('====================================================');

let offset = 0;
let isRunning = true;

/**
 * Định dạng Phiếu giao việc theo chuẩn hiển thị Telegram HTML
 */
function formatTaskCardHtml(task) {
  const statusEmoji = task.trang_thai === 'ĐANG THỰC HIỆN' ? '🟢' :
                      task.trang_thai === 'HOÀN THÀNH' ? '✅' :
                      task.trang_thai === 'HỦY' ? '❌' : '🟡';

  return `📋 <b>PHIẾU GIAO VIỆC CHUẨN — AKC FITNESS</b>
━━━━━━━━━━━━━━━━━━━━━━
🏷 <b>Mã việc:</b> <code>${task.ma_viec}</code>
👤 <b>Agent / Phụ trách:</b> <b>${task.agent}</b>
🎯 <b>Yêu cầu:</b> ${task.yeu_cau}
⏳ <b>Thời hạn bàn giao:</b> <i>${task.han}</i>
📦 <b>Sản phẩm đầu ra:</b> ${task.dau_ra}
🔍 <b>Tiêu chí chất lượng:</b> ${task.tieu_chi}
⚠️ <b>Dữ liệu còn thiếu:</b> <i>${task.thieu}</i>
${statusEmoji} <b>Trạng thái:</b> <code>${task.trang_thai}</code>
━━━━━━━━━━━━━━━━━━━━━━
<i>Ghi chú: Quyền THỰC THI chỉ kích hoạt khi Sếp Ricky bấm Duyệt bên dưới.</i>`;
}

/**
 * Xử lý tin nhắn văn bản
 */
async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = msg.text ? msg.text.trim() : '';
  const senderName = msg.from ? (msg.from.first_name + (msg.from.last_name ? ' ' + msg.from.last_name : '')) : 'Sếp Ricky';

  if (!text) return;

  console.log(`📩 [${senderName}]: ${text}`);

  // 1. LỆNH CỐ ĐỊNH (Slash Commands)
  if (text === '/start') {
    const welcome = `🥊 <b>Kính chào Sếp Ricky – Tổng giám đốc AKC Fitness!</b>

Em là <b>AI Automation (Tổng chỉ huy)</b>, trợ lý điều hành trực tiếp của Sếp.

💬 <b>Em có thể:</b>
1. <b>Trò chuyện & Tham mưu:</b> Trả lời mọi câu hỏi về hệ sinh thái, quy trình, tiến độ và tình trạng kết nối.
2. <b>Bóc tách & Giao việc tự động:</b> Khi Sếp chỉ đạo việc, em tự động lập Phiếu giao việc chuẩn (Mã AKC-xxx) cho 7 Agent chuyên trách hoặc Nhân sự.
3. <b>Quản lý tiến độ:</b> Theo dõi trạng thái, ghi Sổ Nhật ký (Audit Log) minh bạch theo Hiến chương.

💡 <b>Sếp có thể trò chuyện hoặc giao việc tự nhiên:</b>
• <i>"Hãy nói rõ em là ai"</i>
• <i>"Làm kịch bản video TikTok 45s về Kickfit xả stress cho dân văn phòng, deadline chiều mai"</i>
• <i>"Giao cho Tuấn kiểm tra cơ sở Cầu Giấy trước 8h sáng mai"</i>

<b>Lệnh nhanh:</b>
/tasks hoặc /ds - Xem danh sách việc
/agents - Xem danh sách 7 Agent chuyên trách
/help - Hướng dẫn chi tiết`;

    return await sendMessage(chatId, welcome);
  }

  if (text === '/help') {
    const help = `📖 <b>HƯỚNG DẪN ĐIỀU HÀNH AI AUTOMATION</b>

1️⃣ <b>Trò chuyện & Hỏi đáp:</b>
Sếp có thể nhắn tự nhiên bất kỳ câu hỏi nào. Em sẽ phân tích và giải đáp trực tiếp theo tôn chỉ của AKC Fitness.

2️⃣ <b>Chỉ đạo giao việc:</b>
Khi Sếp muốn giao việc, chỉ cần nhắn nội dung (ví dụ: <i>"Làm video...", "Viết bài MKT...", "Rà soát hợp đồng...", "Tuyển HLV..."</i>).
Em sẽ tự động bóc tách thành <b>Phiếu giao việc chuẩn</b> kèm nút bấm để Sếp phê duyệt.

3️⃣ <b>Các lệnh quản lý:</b>
• <code>/tasks</code> hoặc <code>/ds</code>: Xem danh sách công việc gần nhất
• <code>/done &lt;MÃ_VIỆC&gt;</code>: Nghiệm thu hoàn thành nhiệm vụ
• <code>/agents</code>: Thông tin 7 Agent chuyên trách`;

    return await sendMessage(chatId, help);
  }

  if (text === '/agents') {
    let msgAgents = `🤖 <b>HỆ SINH THÁI 7 AGENT CHUYÊN TRÁCH AKC:</b>\n━━━━━━━━━━━━━━━━━━━━━━\n`;
    for (const key of Object.keys(CONFIG.AGENTS)) {
      const a = CONFIG.AGENTS[key];
      msgAgents += `🔹 <b>${a.name}</b> (<code>${a.code}</code>)\n   <i>${a.desc}</i>\n\n`;
    }
    return await sendMessage(chatId, msgAgents);
  }

  if (text === '/tasks' || text === '/ds') {
    const tasks = getAllTasks().slice(0, 10);
    if (tasks.length === 0) {
      return await sendMessage(chatId, '📭 Hiện tại chưa có công việc nào trong danh sách.');
    }

    let listMsg = `📋 <b>DANH SÁCH CÔNG VIỆC GẦN NHẤT:</b>\n━━━━━━━━━━━━━━━━━━━━━━\n`;
    for (const t of tasks) {
      const st = t.trang_thai === 'HOÀN THÀNH' ? '✅' :
                 t.trang_thai === 'ĐANG THỰC HIỆN' ? '🟢' :
                 t.trang_thai === 'HỦY' ? '❌' : '🟡';
      listMsg += `${st} <code>${t.ma_viec}</code> | <b>${t.agent}</b>\n   🎯 ${t.yeu_cau.slice(0, 60)}...\n   ⏳ Hạn: ${t.han} | Trạng thái: <b>${t.trang_thai}</b>\n\n`;
    }
    listMsg += `<i>Dùng lệnh <code>/done &lt;MÃ_VIỆC&gt;</code> để báo hoàn thành.</i>`;
    return await sendMessage(chatId, listMsg);
  }

  if (text.startsWith('/done')) {
    const parts = text.split(/\s+/);
    if (parts.length < 2) {
      return await sendMessage(chatId, '⚠️ Sếp vui lòng nhập mã việc, ví dụ: <code>/done AKC-VIDEO-001</code>');
    }
    const code = parts[1].toUpperCase();
    const updated = updateTaskStatus(code, 'HOÀN THÀNH', 'Sếp Ricky nghiệm thu HÀI LÒNG');
    if (updated) {
      return await sendMessage(chatId, `🎉 <b>Đã nghiệm thu hoàn thành!</b>\nMã việc <code>${updated.ma_viec}</code> đã chuyển trạng thái <b>HOÀN THÀNH</b> và ghi vào Sổ Nhật ký công việc.`);
    } else {
      return await sendMessage(chatId, `❌ Không tìm thấy công việc có mã <code>${code}</code> trong hệ thống.`);
    }
  }

  // 2. XỬ LÝ BẰNG AI ENGINE THÔNG MINH
  try {
    const aiResponse = await processWithAI(chatId, text, senderName);

    if (aiResponse) {
      // Trường hợp 1: Trò chuyện / Hỏi đáp bình thường (Không phải giao việc)
      if (!aiResponse.is_task) {
        return await sendMessage(chatId, aiResponse.reply);
      }

      // Trường hợp 2: Chỉ đạo giao việc
      const taskData = aiResponse.task || parseTaskRequest(text);
      const newTask = createTask(taskData, senderName);
      const cardHtml = formatTaskCardHtml(newTask);

      const introText = aiResponse.reply ? `${aiResponse.reply}\n\n` : '';
      const fullMessage = `${introText}${cardHtml}`;

      return await sendMessage(chatId, fullMessage, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✅ Duyệt thực thi', callback_data: `approve_${newTask.ma_viec}` },
              { text: '❌ Hủy việc', callback_data: `cancel_${newTask.ma_viec}` }
            ]
          ]
        }
      });
    }
  } catch (err) {
    console.error('❌ Lỗi AI processing:', err.message);
  }

  // Fallback: Sử dụng NLP cục bộ nếu AI không phản hồi
  const fallbackTask = parseTaskRequest(text);
  const newTask = createTask(fallbackTask, senderName);
  const cardHtml = formatTaskCardHtml(newTask);

  await sendMessage(chatId, cardHtml, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✅ Duyệt thực thi', callback_data: `approve_${newTask.ma_viec}` },
          { text: '❌ Hủy việc', callback_data: `cancel_${newTask.ma_viec}` }
        ]
      ]
    }
  });
}

/**
 * Xử lý khi Sếp bấm nút Duyệt hoặc Hủy
 */
async function handleCallbackQuery(cb) {
  const callbackId = cb.id;
  const data = cb.data || '';
  const message = cb.message;
  const chatId = message.chat.id;
  const messageId = message.message_id;

  if (data.startsWith('approve_')) {
    const ma_viec = data.replace('approve_', '');
    const updated = updateTaskStatus(ma_viec, 'ĐANG THỰC HIỆN', 'Sếp Ricky duyệt bằng lời qua Telegram');

    await answerCallbackQuery(callbackId, `Đã phê duyệt ${ma_viec}!`);

    if (updated) {
      const newCard = formatTaskCardHtml(updated);
      await editMessageText(chatId, messageId, `${newCard}\n\n⚡ <b>Lệnh thực thi đã kích hoạt:</b> Agent <b>${updated.agent}</b> đang triển khai nhiệm vụ!`, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✅ Đánh dấu hoàn thành', callback_data: `done_${updated.ma_viec}` }
            ]
          ]
        }
      });
    }
  } else if (data.startsWith('cancel_')) {
    const ma_viec = data.replace('cancel_', '');
    const updated = updateTaskStatus(ma_viec, 'HỦY', 'Sếp Ricky hủy qua Telegram');

    await answerCallbackQuery(callbackId, `Đã hủy ${ma_viec}`);

    if (updated) {
      const newCard = formatTaskCardHtml(updated);
      await editMessageText(chatId, messageId, `${newCard}\n\n🛑 <b>Nhiệm vụ đã được hủy bỏ theo chỉ đạo của Sếp.</b>`);
    }
  } else if (data.startsWith('done_')) {
    const ma_viec = data.replace('done_', '');
    const updated = updateTaskStatus(ma_viec, 'HOÀN THÀNH', 'Sếp Ricky nghiệm thu HÀI LÒNG');

    await answerCallbackQuery(callbackId, `Đã hoàn thành ${ma_viec}!`);

    if (updated) {
      const newCard = formatTaskCardHtml(updated);
      await editMessageText(chatId, messageId, `${newCard}\n\n🎉 <b>Chúc mừng! Nhiệm vụ đã nghiệm thu HOÀN THÀNH.</b>`);
    }
  }
}

/**
 * Vòng lặp lắng nghe tin nhắn mới (Long polling)
 */
async function startPolling() {
  console.log('🚀 Telegram Bot đang chạy và sẵn sàng nhận lệnh từ Sếp Ricky...');
  console.log('📱 Tìm kiếm bot trên Telegram: @akc_ricky_bot');

  while (isRunning) {
    try {
      const updates = await getUpdates(offset, 25);
      if (updates.ok && updates.result && updates.result.length > 0) {
        for (const update of updates.result) {
          offset = update.update_id + 1;

          if (update.message) {
            await handleMessage(update.message);
          } else if (update.callback_query) {
            await handleCallbackQuery(update.callback_query);
          }
        }
      }
    } catch (err) {
      console.error('❌ Lỗi vòng lặp Polling:', err.message);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

// Khởi chạy bot
startPolling();
