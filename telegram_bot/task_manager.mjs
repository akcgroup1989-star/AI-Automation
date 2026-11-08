import fs from 'fs';
import path from 'path';
import { CONFIG } from './config.mjs';

// Đảm bảo thư mục data tồn tại
if (!fs.existsSync(CONFIG.DATA_DIR)) {
  fs.mkdirSync(CONFIG.DATA_DIR, { recursive: true });
}

// Khởi tạo file tasks.json nếu chưa có
if (!fs.existsSync(CONFIG.TASKS_FILE)) {
  fs.writeFileSync(CONFIG.TASKS_FILE, JSON.stringify([], null, 2), 'utf8');
}

export function getAllTasks() {
  try {
    const data = fs.readFileSync(CONFIG.TASKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveAllTasks(tasks) {
  fs.writeFileSync(CONFIG.TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8');
}

/**
 * Sinh mã việc kế tiếp theo chuẩn AKC: ví dụ AKC-VIDEO-002
 */
export function generateTaskCode(prefix) {
  const tasks = getAllTasks();
  const pattern = new RegExp(`^${prefix}-(\\d+)$`);
  let maxNum = 0;

  for (const t of tasks) {
    const match = (t.ma_viec || '').match(pattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }

  // Nếu trong tasks.json chưa có, quét thêm trong file NHAT-KY-CONG-VIEC.md
  if (fs.existsSync(CONFIG.AUDIT_LOG_FILE)) {
    const logContent = fs.readFileSync(CONFIG.AUDIT_LOG_FILE, 'utf8');
    const logMatches = logContent.match(new RegExp(`${prefix}-(\\d+)`, 'g'));
    if (logMatches) {
      for (const m of logMatches) {
        const num = parseInt(m.split('-').pop(), 10);
        if (num > maxNum) maxNum = num;
      }
    }
  }

  const nextNum = String(maxNum + 1).padStart(3, '0');
  return `${prefix}-${nextNum}`;
}

/**
 * Tạo một task mới và lưu trữ
 */
export function createTask(taskData, sender = 'Sếp Ricky (Telegram)') {
  const tasks = getAllTasks();
  const ma_viec = generateTaskCode(taskData.codePrefix);
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  const newTask = {
    id: Date.now().toString(),
    ma_viec,
    ngay_tao: dateStr,
    nguoi_giao: sender,
    agent: taskData.agent,
    yeu_cau: taskData.yeu_cau,
    dau_vao: taskData.dau_vao,
    dau_ra: taskData.dau_ra,
    tieu_chi: taskData.tieu_chi,
    han: taskData.han,
    quyen: taskData.quyen,
    thieu: taskData.thieu,
    trang_thai: 'CHỜ DUYỆT',
    diem_tham_dinh: 'Chờ đánh giá',
    phe_duyet: 'Chờ Sếp Ricky phê duyệt'
  };

  tasks.unshift(newTask);
  saveAllTasks(tasks);

  // Ghi vào Nhật ký công việc Audit Log
  appendAuditLog(newTask);

  return newTask;
}

/**
 * Cập nhật trạng thái task
 */
export function updateTaskStatus(ma_viec, status, approvalNote = '') {
  const tasks = getAllTasks();
  const task = tasks.find(t => t.ma_viec.toLowerCase() === ma_viec.toLowerCase());
  if (!task) return null;

  task.trang_thai = status;
  if (approvalNote) {
    task.phe_duyet = approvalNote;
  }
  saveAllTasks(tasks);

  // Cập nhật dòng tương ứng trong NHAT-KY-CONG-VIEC.md
  updateAuditLogFile(task);

  return task;
}

/**
 * Ghi thêm dòng mới vào NHAT-KY-CONG-VIEC.md
 */
function appendAuditLog(task) {
  if (!fs.existsSync(CONFIG.AUDIT_LOG_FILE)) return;
  try {
    let content = fs.readFileSync(CONFIG.AUDIT_LOG_FILE, 'utf8');
    const tableDivider = '|---|---|---|---|---|:---:|---|---|';
    const newRow = `| \`${task.ma_viec}\` | ${task.ngay_tao} | ${task.agent} | ${task.yeu_cau.replace(/\|/g, '-')} | Đã lập phiếu giao việc chuẩn qua Telegram | 90/100 | ${task.trang_thai} | ${task.phe_duyet} |`;

    if (content.includes(tableDivider)) {
      content = content.replace(tableDivider, `${tableDivider}\n${newRow}`);
      fs.writeFileSync(CONFIG.AUDIT_LOG_FILE, content, 'utf8');
    }
  } catch (err) {
    console.error('❌ Lỗi ghi Audit Log:', err.message);
  }
}

/**
 * Cập nhật dòng trạng thái trong NHAT-KY-CONG-VIEC.md
 */
function updateAuditLogFile(task) {
  if (!fs.existsSync(CONFIG.AUDIT_LOG_FILE)) return;
  try {
    let content = fs.readFileSync(CONFIG.AUDIT_LOG_FILE, 'utf8');
    const regex = new RegExp(`(\\|\\s*\`${task.ma_viec}\`\\s*\\|[^\\n]+\\|)([^|]+)(\\|\\s*[^|]+\\|\\s*$)`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `$1 ${task.trang_thai} $3`);
      fs.writeFileSync(CONFIG.AUDIT_LOG_FILE, content, 'utf8');
    }
  } catch (err) {
    console.error('❌ Lỗi cập nhật Audit Log:', err.message);
  }
}
