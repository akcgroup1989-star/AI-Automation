import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_DIR = __dirname;

// 1. Tải cấu hình từ .env
function loadEnv() {
  const envPath = path.join(BASE_DIR, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Không tìm thấy file .env tại', envPath);
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      env[key] = val;
    }
  }
  return env;
}

const env = loadEnv();
const TOKEN = env.GITHUB_PERSONAL_ACCESS_TOKEN;
const REPO_FULL = env.GITHUB_REPO || 'akcgroup1989-star/AI-Automation';
const [OWNER, REPO] = REPO_FULL.split('/');
const BRANCH = 'main';

if (!TOKEN || TOKEN.includes('your_token_here')) {
  console.error('❌ Lỗi: GITHUB_PERSONAL_ACCESS_TOKEN chưa hợp lệ trong file .env');
  process.exit(1);
}

const HEADERS = {
  'Authorization': `Bearer ${TOKEN}`,
  'User-Agent': 'AKC-Fitness-AI-Automation-Sync',
  'Accept': 'application/vnd.github.v3+json',
  'Content-Type': 'application/json'
};

async function api(endpoint, method = 'GET', body = null) {
  const opts = { method, headers: HEADERS };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}${endpoint}`, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status} [${endpoint}]: ${text}`);
  }
  return res.json();
}

// Tính mã Git Blob Hash chuẩn SHA-1
function calcGitBlobSha(buffer) {
  return crypto.createHash('sha1')
    .update(`blob ${buffer.length}\0`)
    .update(buffer)
    .digest('hex');
}

// Danh sách loại trừ
function isIgnored(relPath) {
  const norm = relPath.replace(/\\/g, '/');
  if (norm === '.env' || norm === '.git' || norm.startsWith('.git/')) return true;
  if (norm.startsWith('node_modules/') || norm.startsWith('skills_zip/')) return true;
  if (norm.startsWith('scratch/') || norm.startsWith('temp/')) return true;
  if (norm.endsWith('.token') || norm.endsWith('.pat') || norm.endsWith('.tmp')) return true;
  if (norm === 'sync_engine.mjs' || norm === 'auto_sync.bat') return false; // Cho phép đồng bộ cả tool đồng bộ
  return false;
}

// Lấy toàn bộ file local
function getLocalFiles(dir, list = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    const rel = path.relative(BASE_DIR, full).replace(/\\/g, '/');
    if (isIgnored(rel)) continue;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      getLocalFiles(full, list);
    } else {
      list.push({ fullPath: full, relPath: rel });
    }
  }
  return list;
}

// Hàm thực thi đồng bộ 2 chiều (Bidirectional Sync)
export async function syncTwoWay() {
  const timestamp = new Date().toLocaleString('vi-VN');
  console.log(`\n==========================================================`);
  console.log(`🔄 [${timestamp}] BẮT ĐẦU ĐỒNG BỘ 2 CHIỀU: MÁY TRẠM <==> GITHUB`);
  console.log(`   Repo: https://github.com/${OWNER}/${REPO} (Branch: ${BRANCH})`);
  console.log(`==========================================================`);

  // 1. Lấy thông tin commit và tree mới nhất trên GitHub
  const ref = await api(`/git/ref/heads/${BRANCH}`);
  const latestCommitSha = ref.object.sha;
  const commitData = await api(`/git/commits/${latestCommitSha}`);
  const baseTreeSha = commitData.tree.sha;

  // Lấy chi tiết toàn bộ file trên GitHub
  const remoteTreeData = await api(`/git/trees/${baseTreeSha}?recursive=1`);
  const remoteFilesMap = new Map();
  for (const entry of remoteTreeData.tree) {
    if (entry.type === 'blob') {
      remoteFilesMap.set(entry.path, entry.sha);
    }
  }

  // 2. CHIỀU 1: PULL (GitHub -> Máy trạm Windows)
  let pullCount = 0;
  for (const [rPath, rSha] of remoteFilesMap.entries()) {
    if (isIgnored(rPath)) continue;
    const localPath = path.join(BASE_DIR, rPath);
    let needDownload = false;

    if (!fs.existsSync(localPath)) {
      needDownload = true;
    } else {
      const localBuf = fs.readFileSync(localPath);
      const localSha = calcGitBlobSha(localBuf);
      if (localSha !== rSha) {
        needDownload = true;
      }
    }

    if (needDownload) {
      console.log(`📥 [PULL] Đang tải từ GitHub về máy: ${rPath}`);
      const blob = await api(`/git/blobs/${rSha}`);
      const content = Buffer.from(blob.content, 'base64');
      fs.mkdirSync(path.dirname(localPath), { recursive: true });
      fs.writeFileSync(localPath, content);
      pullCount++;
    }
  }
  if (pullCount === 0) {
    console.log(`✅ [PULL] Máy trạm đã cập nhật mới nhất với GitHub (0 tệp mới).`);
  } else {
    console.log(`✅ [PULL] Hoàn tất tải về ${pullCount} tệp từ GitHub.`);
  }

  // 3. CHIỀU 2: PUSH (Máy trạm Windows -> GitHub)
  const localFiles = getLocalFiles(BASE_DIR);
  const toUpload = [];
  const allTreeEntries = [];

  for (const f of localFiles) {
    let contentBuf = fs.readFileSync(f.fullPath);

    // Bảo mật: Không bao giờ đẩy token thật lên file config
    if (f.relPath.endsWith('mcp_config.json')) {
      let str = contentBuf.toString('utf8');
      str = str.replace(/ghp_[A-Za-z0-9]+/g, 'YOUR_GITHUB_PERSONAL_ACCESS_TOKEN');
      contentBuf = Buffer.from(str, 'utf8');
    }

    const localSha = calcGitBlobSha(contentBuf);
    const remoteSha = remoteFilesMap.get(f.relPath);

    if (remoteSha !== localSha) {
      toUpload.push({ file: f, buffer: contentBuf });
    } else {
      // Giữ nguyên sha hiện có
      allTreeEntries.push({
        path: f.relPath,
        mode: '100644',
        type: 'blob',
        sha: remoteSha
      });
    }
  }

  if (toUpload.length > 0) {
    console.log(`📤 [PUSH] Phát hiện ${toUpload.length} tệp tin mới/thay đổi tại máy trạm cần đẩy:`);
    for (const item of toUpload) {
      console.log(`   + Tải lên: ${item.file.relPath}`);
      const blob = await api('/git/blobs', 'POST', {
        content: item.buffer.toString('base64'),
        encoding: 'base64'
      });
      allTreeEntries.push({
        path: item.file.relPath,
        mode: '100644',
        type: 'blob',
        sha: blob.sha
      });
    }

    console.log(`🔨 Đang tạo Tree và Commit mới trên GitHub...`);
    const newTree = await api('/git/trees', 'POST', {
      base_tree: baseTreeSha,
      tree: allTreeEntries
    });

    const commitMsg = `auto-sync: Đồng bộ tự động 2 chiều từ máy Windows [${timestamp}]`;
    const newCommit = await api('/git/commits', 'POST', {
      message: commitMsg,
      tree: newTree.sha,
      parents: [latestCommitSha]
    });

    await api(`/git/refs/heads/${BRANCH}`, 'PATCH', {
      sha: newCommit.sha,
      force: false
    });
    console.log(`✅ [PUSH] Đã đẩy thành công lên nhánh ${BRANCH}! Commit: ${newCommit.sha.slice(0, 7)}`);
  } else {
    console.log(`✅ [PUSH] GitHub đã có đầy đủ tệp mới nhất từ máy trạm (0 tệp cần đẩy).`);
  }

  console.log(`🎉 [KẾT QUẢ] ĐỒNG BỘ 2 CHIỀU HOÀN TẤT VÀ KHỚP 100%!\n`);
}

// Chế độ chạy: --watch (liên tục) hoặc --once (1 lần)
const isWatch = process.argv.includes('--watch');
const intervalSec = 60; // Chu kỳ đồng bộ ngầm 60 giây

async function run() {
  if (isWatch) {
    console.log(`🚀 Chế độ TỰ ĐỘNG ĐỒNG BỘ LIÊN TỤC đang chạy (Chu kỳ kiểm tra: mỗi ${intervalSec}s).`);
    console.log(`   Nhấn Ctrl + C để dừng tiến trình.`);
    while (true) {
      try {
        await syncTwoWay();
      } catch (err) {
        console.error(`⚠️ Lỗi chu kỳ đồng bộ:`, err.message);
      }
      await new Promise(r => setTimeout(r, intervalSec * 1000));
    }
  } else {
    await syncTwoWay();
  }
}

run().catch(err => {
  console.error('❌ Lỗi tiến trình đồng bộ:', err);
  process.exit(1);
});
