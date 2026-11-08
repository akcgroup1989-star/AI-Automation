import { CONFIG } from './config.mjs';

/**
 * Phân tích câu lệnh tiếng Việt tự nhiên của Sếp để bóc tách thành phiếu giao việc chuẩn
 */
export function parseTaskRequest(text) {
  const lower = text.toLowerCase();

  // 1. Kiểm tra đối tượng nhận việc: Nhân sự (người cụ thể) hay Agent AI
  let assigneeType = 'AGENT';
  let matchedAgentKey = null;
  let targetPerson = null;

  // Kiểm tra tên người cụ thể (ví dụ: @tuan, giao cho Nam, nhờ Mai...)
  const personMatch = text.match(/(?:@([a-zA-Z0-9_]+)|giao cho\s+([A-ZÀ-Ỹa-zà-ỹ]+)|nhờ\s+([A-ZÀ-Ỹa-zà-ỹ]+))/i);
  if (personMatch) {
    targetPerson = personMatch[1] || personMatch[2] || personMatch[3];
  }

  // Phân tích từ khóa để chọn Agent chuyên trách
  if (/(video|clip|tiktok|reels|quay|kịch bản|dựng|short|youtube)/i.test(lower)) {
    matchedAgentKey = 'VIDEO';
  } else if (/(marketing|mkt|bài viết|content|bài đăng|fanpage|quảng cáo|ads|pr|chiến dịch)/i.test(lower)) {
    matchedAgentKey = 'MKT';
  } else if (/(hợp đồng|pháp lý|điều khoản|biên bản|công văn|thỏa thuận|nội quy|quy chế|văn bản|luật)/i.test(lower)) {
    matchedAgentKey = 'VANBAN';
  } else if (/(tuyển|tuyển dụng|huấn luyện viên|pt|phỏng vấn|jd|mô tả công việc|ứng viên|cv)/i.test(lower)) {
    matchedAgentKey = 'TUYENDUNG';
  } else if (/(tài chính|kế toán|doanh thu|dòng tiền|chi phí|bảng giá|giá thẻ|ngân sách|lợi nhuận|báo cáo tài chính)/i.test(lower)) {
    matchedAgentKey = 'TAICHINH';
  } else if (/(thị trường|đối thủ|khảo sát|phòng tập khác|giá thị trường|xu hướng|competitor)/i.test(lower)) {
    matchedAgentKey = 'THITRUONG';
  } else if (/(chiến lược|định hướng|kế hoạch quý|kế hoạch năm|mở rộng cơ sở|tái cấu trúc|mục tiêu)/i.test(lower)) {
    matchedAgentKey = 'CHIENLUOC';
  }

  // Xác định người/agent phụ trách
  let agentInfo = null;
  let codePrefix = 'AKC-TASK';

  if (targetPerson && !matchedAgentKey) {
    assigneeType = 'PERSON';
    agentInfo = {
      code: 'AKC-NS',
      name: `Nhân sự: ${targetPerson}`,
      desc: `Giao trực tiếp cho nhân sự ${targetPerson}`
    };
    codePrefix = 'AKC-NS';
  } else if (matchedAgentKey) {
    agentInfo = CONFIG.AGENTS[matchedAgentKey];
    codePrefix = agentInfo.code;
  } else {
    // Mặc định giao cho Tổng chỉ huy AI Automation điều phối
    agentInfo = {
      code: 'AKC-GENERAL',
      name: 'AI Automation (Tổng chỉ huy)',
      desc: 'Tiếp nhận, phân tích và điều phối chuyên môn'
    };
    codePrefix = 'AKC-GEN';
  }

  // 2. Bóc tách thời hạn (Deadline)
  let deadline = 'Trong ngày làm việc';
  const deadlineMatch = text.match(/(?:deadline|hạn|xong trước|trước|hoàn thành trước)\s+([^,.\n]+)/i);
  if (deadlineMatch) {
    deadline = deadlineMatch[1].trim();
  } else if (/chiều mai/i.test(lower)) {
    deadline = 'Trước 17:00 chiều mai';
  } else if (/sáng mai/i.test(lower)) {
    deadline = 'Trước 09:00 sáng mai';
  } else if (/ngày mai|hôm sau/i.test(lower)) {
    deadline = 'Trong ngày mai';
  } else if (/hôm nay/i.test(lower)) {
    deadline = 'Trong ngày hôm nay';
  } else if (/24h|trong ngày/i.test(lower)) {
    deadline = 'Trong 24 giờ';
  }

  // 3. Dự đoán Sản phẩm bàn giao (Đầu ra)
  let dauRa = 'Báo cáo chi tiết và tài liệu theo chuẩn AKC';
  if (matchedAgentKey === 'VIDEO') {
    dauRa = 'File kịch bản chi tiết (Phân cảnh hình ảnh + Lời thoại + SFX âm thanh + Hook 3s đầu)';
  } else if (matchedAgentKey === 'MKT') {
    dauRa = 'Bản nội dung hoàn chỉnh (Tiêu đề, bài viết, gợi ý hình ảnh/video, Call-to-action)';
  } else if (matchedAgentKey === 'VANBAN') {
    dauRa = 'Bản rà soát điều khoản rủi ro + Dự thảo văn bản chỉnh sửa chi tiết';
  } else if (matchedAgentKey === 'TUYENDUNG') {
    dauRa = 'Bản mô tả công việc (JD) chuẩn + Kế hoạch kênh tuyển & Câu hỏi phỏng vấn';
  } else if (matchedAgentKey === 'TAICHINH') {
    dauRa = 'Bảng số liệu phân tích tài chính + Dự toán thu chi & Đề xuất tối ưu';
  } else if (matchedAgentKey === 'THITRUONG') {
    dauRa = 'Báo cáo phân tích đối thủ & thị trường Private Kickfit (kèm nguồn kiểm chứng)';
  } else if (matchedAgentKey === 'CHIENLUOC') {
    dauRa = 'Bản đề xuất chiến lược kèm 2 phương án đối sánh A/B và phân tích rủi ro';
  }

  // 4. Phát hiện dữ liệu còn thiếu cần hỏi lại Sếp (Tuân thủ Điều 3.2 Hiến chương AKC)
  const missingPoints = [];
  if (matchedAgentKey === 'VIDEO') {
    if (!/cơ sở|quận|chi nhánh/i.test(lower)) missingPoints.push('Địa điểm quay cụ thể (Cơ sở nào)');
    if (!/pt|huấn luyện viên|diễn viên/i.test(lower)) missingPoints.push('Huấn luyện viên (PT) đóng chính');
  } else if (matchedAgentKey === 'MKT') {
    if (!/kênh|facebook|fanpage|tiktok|zalo/i.test(lower)) missingPoints.push('Kênh truyền thông ưu tiên phát hành');
    if (!/ngân sách|budget/i.test(lower)) missingPoints.push('Ngân sách chạy quảng cáo (nếu có)');
  } else if (matchedAgentKey === 'TUYENDUNG') {
    if (!/lương|thu nhập/i.test(lower)) missingPoints.push('Khung lương / chế độ đãi ngộ');
    if (!/số lượng/i.test(lower)) missingPoints.push('Số lượng cần tuyển');
  }

  return {
    rawText: text,
    assigneeType,
    agent: agentInfo.name,
    codePrefix,
    yeu_cau: text.trim(),
    dau_vao: `Chỉ đạo trực tiếp từ Sếp Ricky qua Telegram: "${text.trim()}"`,
    dau_ra: dauRa,
    tieu_chi: 'Đạt ≥90 điểm theo thang thẩm định 100 của Hiến chương AKC',
    han: deadline,
    quyen: 'ĐỌC | GHI | ĐỀ XUẤT (Chỉ THỰC THI khi sếp Ricky duyệt bằng lời)',
    thieu: missingPoints.length > 0 ? missingPoints.join(', ') : 'Chưa phát hiện điểm thiếu trọng yếu'
  };
}
