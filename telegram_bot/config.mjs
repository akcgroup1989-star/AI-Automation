import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Đọc file .env
export function loadEnv() {
  const envPath = path.join(ROOT_DIR, '.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
      }
    }
  }
  return env;
}

const env = loadEnv();

export const CONFIG = {
  ROOT_DIR,
  BOT_DIR: __dirname,
  DATA_DIR: path.join(__dirname, 'data'),
  TASKS_FILE: path.join(__dirname, 'data', 'tasks.json'),
  AUDIT_LOG_FILE: path.join(ROOT_DIR, 'NHAT-KY-CONG-VIEC.md'),
  TELEGRAM_BOT_TOKEN: env.TELEGRAM_BOT_TOKEN || '9078759673:AAHWLXBF53nz-HBSCmmm9lxTNc9BPNgnOo4',
  
  // 7 Agent chuyên trách của AKC Fitness
  AGENTS: {
    VIDEO: { code: 'AKC-VIDEO', name: 'Tạo Video – Clip', desc: 'Kịch bản TikTok/Reels, phân cảnh, video ngắn xả stress Kickfit' },
    MKT: { code: 'AKC-MKT', name: 'Marketing – Media', desc: 'Content mạng xã hội, thông điệp truyền thông, bài PR, chiến dịch' },
    VANBAN: { code: 'AKC-VANBAN', name: 'Pháp lý – Trợ lý soạn thảo', desc: 'Hợp đồng hội viên, quy chế, công văn, rà soát điều khoản' },
    TUYENDUNG: { code: 'AKC-TUYENDUNG', name: 'Tuyển dụng', desc: 'Tuyển Huấn luyện viên (PT), nhân viên tư vấn, bản mô tả JD, phỏng vấn' },
    TAICHINH: { code: 'AKC-TAICHINH', name: 'Tài chính – Kế toán', desc: 'Báo cáo doanh số, dự toán chi phí, bảng giá thẻ, dòng tiền' },
    THITRUONG: { code: 'AKC-THITRUONG', name: 'Phân tích thị trường', desc: 'Nghiên cứu đối thủ, giá tập Kickfit, xu hướng fitness' },
    CHIENLUOC: { code: 'AKC-CHIENLUOC', name: 'Trợ lý chiến lược', desc: 'Kế hoạch phát triển, tối ưu trải nghiệm phòng tập, mục tiêu kinh doanh' }
  }
};
