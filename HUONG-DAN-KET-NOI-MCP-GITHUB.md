# HƯỚNG DẪN KẾT NỐI MCP GITHUB CHI TIẾT & TOÀN DIỆN
**Dự án:** AI Automation — AKC Fitness  
**Repository mục tiêu:** [https://github.com/akcgroup1989-star/AI-Automation](https://github.com/akcgroup1989-star/AI-Automation)  
**Công nghệ:** Model Context Protocol (MCP) + GitHub Official Server (`@modelcontextprotocol/server-github`)

---

## 1. TỔNG QUAN VỀ KẾT NỐI MCP GITHUB
Khi kết nối MCP với GitHub, hệ sinh thái AI Automation của AKC Fitness sẽ được trang bị thêm bộ công cụ quyền năng:
- **Tự động đồng bộ:** Tự động đẩy các tài liệu, kịch bản video, báo cáo tài chính, JD tuyển dụng lên repository.
- **Quản trị công việc (Issue Tracking):** Tự động tạo và cập nhật Issue trên GitHub tương ứng với các Phiếu giao việc (`AKC-VIDEO-xxx`, `AKC-MKT-xxx`).
- **Soạn thảo và Review qua Pull Request:** Mọi thay đổi lớn sẽ được đưa vào nhánh mới và tạo PR chờ Sếp Ricky phê duyệt trước khi merge vào nhánh chính (tuân thủ nghiêm ngặt nguyên tắc Không tự deploy code).

---

## 2. BƯỚC 1: TẠO GITHUB PERSONAL ACCESS TOKEN (PAT)
Vì repository `akcgroup1989-star/AI-Automation` là repository nội bộ của tổ chức, bạn cần cấp một Token xác thực để MCP Server có quyền truy cập:

1. Đăng nhập GitHub và truy cập: **[https://github.com/settings/tokens](https://github.com/settings/tokens)**
2. Chọn **Generate new token** → Chọn **Generate new token (classic)**.
3. Điền các thông tin:
   - **Note:** `AKC_AI_Automation_MCP`
   - **Expiration:** Chọn thời hạn (ví dụ: `90 days` hoặc `No expiration` tùy chính sách bảo mật của AKC).
   - **Select scopes (Tích chọn các quyền bắt buộc):**
     - ☑️ **`repo`** (Bắt buộc: Full control of private repositories - để đọc, tạo file, commit).
     - ☑️ **`workflow`** (Tùy chọn: nếu cần cập nhật GitHub Actions).
     - ☑️ **`read:org`** (Bắt buộc nếu repo nằm trong Organization `akcgroup1989-star`).
4. Bấm **Generate token** ở cuối trang.
5. **Sao chép mã Token** (Bắt đầu bằng `ghp_...`). *Lưu ý: Token chỉ hiển thị 1 lần duy nhất!*

---

## 3. BƯỚC 2: CẤU HÌNH VÀO HỆ THỐNG

### Cách A: Cấu hình cho Antigravity (Môi trường đang chạy)
Hệ thống đã tự động tạo sẵn cấu hình trong Workspace tại:
📁 `D:\AI Automation\.agents\plugins\akc-github\mcp_config.json`

Sếp chỉ cần mở file `.env` hoặc cập nhật biến môi trường:
```bash
# Tạo file D:\AI Automation\.env (file này đã được .gitignore bảo vệ, không sợ lộ)
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_mã_token_vừa_tạo
```
Hoặc dán trực tiếp token vào file `mcp_config.json`:
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_mã_token_của_sếp"
      }
    }
  }
}
```

---

### Cách B: Cấu hình cho Claude Desktop (Nếu dùng kèm)
Mở file cấu hình Claude Desktop tại đường dẫn:
`%APPDATA%\Claude\claude_desktop_config.json`  
*(Đường dẫn đầy đủ: `C:\Users\AD\AppData\Roaming\Claude\claude_desktop_config.json`)*

Thêm cấu hình sau:
```json
{
  "mcpServers": {
    "akc-github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_mã_token_của_sếp"
      }
    }
  }
}
```

---

### Cách C: Cấu hình cho Cursor / Windsurf / VS Code
Mở file cấu hình MCP của Cursor (Settings > Features > MCP) hoặc tạo file `.cursor/mcp.json` tại thư mục gốc:
```json
{
  "mcpServers": {
    "akc-github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_mã_token_của_sếp"
      }
    }
  }
}
```

---

## 4. BƯỚC 3: KIỂM TRA TỰ ĐỘNG (Verification)
Sau khi điền Token vào file `.env`, Sếp Ricky chạy file kiểm tra tự động đã tạo sẵn:

```powershell
powershell -ExecutionPolicy Bypass -File "D:\AI Automation\scripts\test_github_mcp.ps1"
```
Script sẽ tự động:
1. Xác minh Node.js và npx.
2. Kiểm tra token có hợp lệ không.
3. Thử kết nối API vào `https://github.com/akcgroup1989-star/AI-Automation` và kiểm tra quyền Push/Admin.
4. Báo cáo trạng thái trực quan bằng màu xanh lá `[THÀNH CÔNG]`.

---

## 5. DANH MỤC CÔNG CỤ MCP GITHUB SẼ ĐƯỢC CẤP CHO AI AUTOMATION

| Tên công cụ MCP | Chức năng nghiệp vụ tại AKC Fitness |
|---|---|
| `get_file_contents` | Đọc các tài liệu, quy trình, code hiện có trên repo GitHub. |
| `create_or_update_file` | Tự động tạo và cập nhật các kịch bản video, hợp đồng, báo cáo lên repo. |
| `push_files` | Đẩy hàng loạt file tài liệu/báo cáo lên GitHub chỉ trong 1 commit. |
| `create_issue` | Tự động mở Issue giao việc cho từng bộ phận theo mã `AKC-xxx`. |
| `list_issues` | Rà soát các việc đang tồn đọng trên GitHub của dự án. |
| `create_pull_request` | Tạo đề xuất cập nhật quy trình để Sếp Ricky review trước khi merge. |
| `search_code` | Tìm kiếm nhanh các biểu mẫu hoặc quy định cũ trong kho lưu trữ. |

---

## 6. NGUYÊN TẮC AN TOÀN HIẾN CHƯƠNG KHI DÙNG MCP GITHUB
1. **Không tự ý merge vào `main` hoặc `production`:** Mọi thay đổi code hoặc tài liệu quan trọng đều phải thông qua Pull Request để Sếp Ricky phê duyệt bằng lời.
2. **Bảo mật Token:** Tuyệt đối không commit file `.env` hoặc tệp chứa Token lên GitHub. File `.gitignore` đã được cấu hình tự động loại bỏ các tệp nhạy cảm này.
3. **Cơ chế Đóng băng:** Không dùng lệnh xóa repository hay xóa nhánh chính.
