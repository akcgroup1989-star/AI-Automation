# CẨM NANG HƯỚNG DẪN ĐỒNG BỘ 2 CHIỀU TỰ ĐỘNG (WINDOWS <==> GITHUB)
**Dự án:** AI Automation — AKC Fitness  
**Kho lưu trữ:** [https://github.com/akcgroup1989-star/AI-Automation](https://github.com/akcgroup1989-star/AI-Automation)  
**File thực thi chính:** `D:\AI Automation\DONG_BO_AI_AUTOMATION.bat`

---

## 1. CƠ CHẾ HOẠT ĐỘNG 2 CHIỀU (BIDIRECTIONAL SYNC)
Hệ thống đồng bộ được thiết kế thông minh với thuật toán so sánh Git Blob Hash (SHA-1) và mtime:
- **Chiều PULL (GitHub → Máy trạm Windows):** Khi có bất kỳ ai chỉnh sửa, tạo file hoặc cập nhật trên GitHub (qua web hoặc máy khác), hệ thống sẽ tự động phát hiện và tải về cập nhật vào thư mục `D:\AI Automation\`.
- **Chiều PUSH (Máy trạm Windows → GitHub):** Khi sếp Ricky hoặc các AI Agent tạo video, sửa file, thêm kịch bản tại máy tính này, hệ thống sẽ tự động phát hiện, gom lại và đẩy lên nhánh `main` của GitHub.
- **Bảo mật tuyệt đối:** Token cá nhân trong file `.env` được bảo vệ 100% tại máy tính, không bao giờ bị đẩy lên GitHub.

---

## 2. CÁCH SỬ DỤNG FILE `DONG_BO_AI_AUTOMATION.bat`

Sếp Ricky chỉ cần **nhấp đúp chuột (Double click)** vào file:
👉 **`D:\AI Automation\DONG_BO_AI_AUTOMATION.bat`**

Giao diện trực quan sẽ hiện ra với 4 lựa chọn:

### 🔹 Lựa chọn 1: Đồng bộ 2 chiều NGAY BÂY GIỜ
- Dùng khi sếp vừa sửa xong tài liệu hoặc muốn kéo ngay dữ liệu mới nhất từ GitHub về máy.
- Hệ thống sẽ quét, đồng bộ trong 3 - 5 giây rồi hoàn tất.

### 🔹 Lựa chọn 2: Bật chế độ TỰ ĐỘNG ĐỒNG BỘ LIÊN TỤC
- Hệ thống sẽ tự động kiểm tra mỗi **60 giây một lần**.
- Cứ có file mới ở máy trạm hoặc trên GitHub là tự động đồng bộ ngay mà không cần làm gì thêm.
- Sếp có thể thu nhỏ (Minimize) cửa sổ xuống thanh Taskbar để làm việc khác.

### 🔹 Lựa chọn 3: TỰ ĐỘNG CHẠY NGẦM KHI BẬT MÁY TÍNH (Khuyến nghị)
- Bấm số **`3`**, hệ thống sẽ tự động đăng ký vào thư mục khởi động của Windows (`Windows Startup`).
- Kể từ lần khởi động máy tiếp theo, tiến trình đồng bộ sẽ **hoàn toàn tự động chạy ngầm trong nền** (không hiện cửa sổ đen che mắt) thông qua file `scripts/run_sync_daemon.vbs`.

---

## 3. DANH SÁCH FILE ĐỒNG BỘ HỆ THỐNG
1. **`DONG_BO_AI_AUTOMATION.bat`**: File giao diện điều khiển 1 chạm cho sếp Ricky.
2. **`sync_engine.mjs`**: Trái tim động cơ đồng bộ 2 chiều (sử dụng Node.js v24).
3. **`scripts/run_sync_daemon.vbs`**: Trình chạy ngầm tàng hình trong Windows.
4. **`.env`**: Nơi lưu giữ Token GitHub an toàn.
