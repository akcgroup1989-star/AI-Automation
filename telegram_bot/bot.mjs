import { CONFIG } from './config.mjs';
import { getUpdates, sendMessage, editMessageText, answerCallbackQuery } from './telegram_api.mjs';
import { classifyIntent, parseTaskRequest } from './nlp_parser.mjs';
import { createTask, getAllTasks, updateTaskStatus } from './task_manager.mjs';

console.log('====================================================');
console.log('🤖 AKC FITNESS — AI AUTOMATION TELEGRAM BOT');
console.log('🎯 Chức năng: Trò chuyện & Giao việc thông minh');
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

Em là <b>AI Automation (Tổng chỉ huy)</b>, đồng hành cùng Sếp điều hành hệ thống.

💬 <b>Em có thể:</b>
1. <b>Trò chuyện & Giải đáp thắc mắc</b> trực tiếp với Sếp.
2. <b>Giao việc tự động:</b> Bóc tách yêu cầu sếp giao thành Phiếu giao việc chuẩn (Mã AKC-xxx) cho 7 Agent hoặc Nhân sự.
3. <b>Quản lý tiến độ:</b> Tra cứu danh sách việc, nghiệm thu công việc.

💡 <b>Sếp có thể nhắn tự nhiên:</b>
• <i>"Làm kịch bản video TikTok 45s về Kickfit xả stress cho dân văn phòng, deadline chiều mai"</i>
• <i>"Rà soát điều khoản hoàn phí trong hợp đồng hội viên mới"</i>
• <i>"Giao cho Tuấn kiểm tra cơ sở Cầu Giấy trước 8h sáng mai"</i>

<b>Lệnh nhanh:</b>
/tasks hoặc /ds - Xem danh sách việc
/agents - Xem danh sách 7 Agent
/help - Hướng dẫn chi tiết`;

    return await sendMessage(chatId, welcome);
  }

  if (text === '/help') {
    const help = `📖 <b>HƯỚNG DẪN ĐIỀU HÀNH AI AUTOMATION</b>

1️⃣ <b>Trò chuyện:</b>
Sếp có thể hỏi bất kỳ câu hỏi nào về tình trạng hệ thống, công việc, khả năng kết nối...

2️⃣ <b>Giao việc bằng ngôn ngữ tự nhiên:</b>
Chỉ cần chat trực tiếp nội dung việc cần làm. Ví dụ:
• <code>Làm kịch bản video ngắn...</code> ➔ Giao cho <b>Tạo Video - Clip</b>
• <code>Viết bài truyền thông...</code> ➔ Giao cho <b>Marketing - Media</b>
• <code>Rà soát hợp đồng...</code> ➔ Giao cho <b>Pháp lý - Soạn thảo</b>
• <code>Tuyển dụng PT Kickfit...</code> ➔ Giao cho <b>Tuyển dụng</b>
• <code>Báo cáo chi phí/doanh số...</code> ➔ Giao cho <b>Tài chính - Kế toán</b>
• <code>Nghiên cứu đối thủ...</code> ➔ Giao cho <b>Phân tích thị trường</b>
• <code>Giao cho @Tuan / Nam làm...</code> ➔ Giao cho <b>Nhân sự cụ thể</b>

3️⃣ <b>Các lệnh quản lý:</b>
• <code>/tasks</code> hoặc <code>/ds</code>: Xem danh sách việc
• <code>/done &lt;MÃ_VIỆC&gt;</code>: Nghiệm thu hoàn thành
• <code>/agents</code>: Xem 7 Agent chuyên trách`;

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

  // 2. PHÂN TÍCH Ý ĐỊNH TIN NHẮN (NLP Intent Classification)
  const intent = classifyIntent(text);

  // A. Chào hỏi / Thăm dò
  if (intent.type === 'GREETING') {
    return await sendMessage(chatId, `🥊 <b>Dạ em nghe đây Sếp Ricky!</b>\n\nAI Automation (Tổng chỉ huy) sẵn sàng nhận chỉ đạo hoặc giải đáp thắc mắc cho Sếp rồi ạ. Sếp cần kiểm tra công việc hay giao nhiệm vụ mới gì không ạ?`);
  }

  // B. Hỏi về Mail / Google Drive
  if (intent.type === 'ASK_MAIL_DRIVE') {
    const mailDriveMsg = `📧 <b>Báo cáo Sếp Ricky:</b>

Hiện tại bot <b>chưa kết nối trực tiếp</b> với tài khoản Gmail hay Google Drive của Sếp / AKC Fitness.

Hệ thống hiện đang kết nối trực tiếp với:
✅ Kho mã nguồn & Dữ liệu GitHub: <code>akcgroup1989-star/AI-Automation</code>
✅ Máy tính điều hành của Sếp (Local Workspace)
✅ Hệ thống 7 Agent chuyên trách & Sổ nhật ký công việc (Audit Log)

💡 <b>Nếu Sếp muốn kết nối Mail & Drive:</b>
Em có thể tích hợp thêm kết nối <b>Google Workspace (Docs, Sheets, Drive, Gmail)</b>. Khi đó em có thể:
• Tự động đọc tài liệu, giáo trình, bảng tính giá thẻ trên Google Drive.
• Tự động gửi email báo cáo, hợp đồng hoặc thông báo.

Sếp có muốn em thiết lập kết nối Google Drive và Mail ngay không ạ?`;
    return await sendMessage(chatId, mailDriveMsg);
  }

  // C. Hỏi về năng lực
  if (intent.type === 'ASK_CAPABILITY') {
    const capMsg = `🥊 <b>NĂNG LỰC CỦA EM (AI AUTOMATION - TỔNG CHỈ HUY):</b>

1️⃣ <b>Trò chuyện & Tư vấn:</b> Giải đáp các câu hỏi về vận hành, quy trình, hệ thống.
2️⃣ <b>Giao việc tự động:</b> Bóc tách lệnh nói tự nhiên của Sếp thành Phiếu giao việc chuẩn cho 7 Agent chuyên trách (Video, MKT, Pháp lý, Tuyển dụng, Tài chính, Thị trường, Chiến lược) hoặc Nhân sự.
3️⃣ <b>Kiểm soát & Đánh giá:</b> Chấm điểm độc lập thang 100 theo Hiến chương AKC, lọc dữ liệu còn thiếu cần Sếp phê duyệt.
4️⃣ <b>Ghi chép Audit Log:</b> Tự động cập nhật tiến độ vào Sổ Nhật ký công việc.

Sếp thử giao một việc cụ thể xem em điều phối nhé!`;
    return await sendMessage(chatId, capMsg);
  }

  // D. Câu hỏi hoặc trò chuyện thông thường
  if (intent.type === 'GENERAL_CHAT' || intent.type === 'GENERAL_QUESTION') {
    const replyText = `Dạ Sếp Ricky, em đã nhận được tin nhắn: <i>"${text}"</i>.\n\nNếu đây là một câu hỏi cần giải đáp hoặc Sếp muốn giao việc này cho Agent / Nhân sự xử lý, Sếp có thể bấm nút bên dưới để em lập <b>Phiếu giao việc chuẩn</b> nhé!`;
    return await sendMessage(chatId, replyText, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📋 Lập Phiếu giao việc cho nội dung này', callback_data: `create_task_from_text` }
          ]
        ]
      }
    });
  }

  // E. CHỈ ĐẠO GIAO VIỆC RÕ RÀNG -> TỰ ĐỘNG TẠO PHIẾU GIAO VIỆC
  try {
    const parsed = parseTaskRequest(text);
    const newTask = createTask(parsed, senderName);

    const cardHtml = formatTaskCardHtml(newTask);
    const keyboard = {
      inline_keyboard: [
        [
          { text: '✅ Duyệt thực thi', callback_data: `approve_${newTask.ma_viec}` },
          { text: '❌ Hủy việc', callback_data: `cancel_${newTask.ma_viec}` }
        ]
      ]
    };

    await sendMessage(chatId, cardHtml, {
      reply_markup: keyboard
    });
  } catch (err) {
    console.error('❌ Lỗi xử lý giao việc:', err);
    await sendMessage(chatId, `⚠️ Đã có lỗi xảy ra khi tạo phiếu giao việc: ${err.message}`);
  }
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
  const senderName = cb.from ? (cb.from.first_name + (cb.from.last_name ? ' ' + cb.from.last_name : '')) : 'Sếp Ricky';

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
  } else if (data === 'create_task_from_text') {
    await answerCallbackQuery(callbackId, 'Đang tạo phiếu giao việc...');
    // Lấy nội dung từ message gốc
    const originalText = message.text || '';
    const match = originalText.match(/"([^"]+)"/);
    const taskContent = match ? match[1] : originalText;

    const parsed = parseTaskRequest(taskContent);
    const newTask = createTask(parsed, senderName);
    const cardHtml = formatTaskCardHtml(newTask);

    await editMessageText(chatId, messageId, cardHtml, {
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
