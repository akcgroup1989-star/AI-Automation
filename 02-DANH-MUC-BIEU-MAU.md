# DANH MỤC BIỂU MẪU CHUẨN — HỆ THỐNG AI AUTOMATION AKC FITNESS

---

## 1. MẪU PHIẾU GIAO VIỆC CHUẨN (Task Assignment Card)

```yaml
ma_viec:   AKC-[LOAI_VIEC]-[SO_THU_TU]   # Ví dụ: AKC-VIDEO-001, AKC-VANBAN-001
agent:     <Tên Agent chuyên trách được chỉ định>
yeu_cau:   <Mô tả chi tiết và mục tiêu công việc sếp Ricky giao>
dau_vao:   <Dữ liệu, tài liệu, bối cảnh sẵn có đã tiếp nhận>
dau_ra:    <Sản phẩm bàn giao cụ thể: kịch bản, file docx, video mp4, báo cáo pdf>
tieu_chi:  <Tiêu chí chất lượng: Đạt ≥90 điểm thang thẩm định 100>
han:       <Thời hạn hoàn thành bàn giao dự kiến>
quyen:     ĐỌC | GHI | ĐỀ XUẤT   # (Chỉ có quyền THỰC THI khi TGĐ duyệt)
thieu:     <Các thông tin, dữ liệu còn khuyết cần xin chỉ đạo hoặc bổ sung>
```

---

## 2. BIỂU MẪU CHO TỪNG AGENT CHUYÊN TRÁCH

### A. Mẫu Video – Clip (AKC-VIDEO)
```yaml
ma_viec:   AKC-VIDEO-001
agent:     Tạo Video – Clip
yeu_cau:   Xây dựng kịch bản video ngắn (TikTok/Reels) về lợi ích giảm mỡ Kick Fitness cho dân văn phòng
dau_vao:   Thông điệp cốt lõi của AKC: "Khỏe - Đẹp - Tự vệ - Xả Stress", thời lượng 45s - 60s
dau_ra:    File kịch bản chi tiết (Phân cảnh hình ảnh + Lời thoại + Hiệu ứng âm thanh)
tieu_chi:  Kịch bản đạt ≥90 điểm, cuốn hút trong 3s đầu (Hook mạnh), đúng văn hóa AKC
han:       Trong ngày giao việc
quyen:     ĐỌC | GHI | ĐỀ XUẤT | CHỈNH SỬA
thieu:     Cơ sở quay cụ thể, Huấn luyện viên (PT) đóng chính
```

### B. Mẫu Pháp lý – Trợ lý soạn thảo (AKC-VANBAN)
```yaml
ma_viec:   AKC-VANBAN-001
agent:     Pháp lý – Trợ lý soạn thảo
yeu_cau:   Rà soát điều khoản bồi thường và hoàn phí trong Dự thảo Hợp đồng Hội viên Kick Fitness
dau_vao:   Dự thảo hợp đồng hiện tại, Luật Bảo vệ quyền lợi người tiêu dùng
dau_ra:    Báo cáo rà soát rủi ro pháp lý + Bản đề xuất sửa đổi các điều khoản kèm giải thích
tieu_chi:  Đảm bảo trung thực 100%, bảo vệ quyền lợi hợp pháp của AKC và công bằng với hội viên
han:       24 giờ
quyen:     ĐỌC | GHI | BÁO CÁO | CHỈNH SỬA
thieu:     Chính sách bảo lưu thẻ tập hiện hành của AKC
```

### C. Mẫu Tài chính – Kế toán (AKC-TAICHINH)
```yaml
ma_viec:   AKC-TAICHINH-001
agent:     Tài chính – Kế toán
yeu_cau:   Tổng hợp và hạch toán chi phí khấu hao trang thiết bị (bao cát, găng, đài tập) cơ sở X
dau_vao:   Hóa đơn mua sắm, bảng theo dõi tài sản cố định
dau_ra:    Bảng tính khấu hao chi tiết theo tháng và đề xuất trích lập dự phòng thay mới
tieu_chi:  Số liệu khớp 100% hóa đơn chứng từ, rõ ràng minh bạch
han:       48 giờ
quyen:     ĐỌC | GHI | BÁO CÁO | ĐỀ XUẤT
thieu:     Danh sách thiết bị hỏng hóc thực tế phát sinh trong tháng
```

### D. Mẫu Marketing – Media (AKC-MKT)
```yaml
ma_viec:   AKC-MKT-001
agent:     Marketing – Media
yeu_cau:   Lên kế hoạch chương trình "Trải nghiệm 1 buổi Kick Fitness 1:1 miễn phí"
dau_vao:   Công suất đón khách tối đa của các cơ sở, khung giờ trống của PT
dau_ra:    Kế hoạch chi tiết: Thông điệp, kênh truyền thông, kịch bản chuyển đổi lead thành hội viên
tieu_chi:  Chi phí dự kiến tiết kiệm tối đa, không tự ý bật quảng cáo trả phí khi chưa duyệt
han:       3 ngày
quyen:     ĐỌC | GHI | ĐỀ XUẤT
thieu:     Hạn mức chi tiêu marketing được sếp Ricky phân bổ
```

### E. Mẫu Tuyển dụng (AKC-TUYENDUNG)
```yaml
ma_viec:   AKC-TUYENDUNG-001
agent:     Tuyển dụng
yeu_cau:   Xây dựng bản mô tả công việc (JD) và tiêu chí tuyển chọn Huấn luyện viên Kick Fitness Private
dau_vao:   Tiêu chuẩn kỹ thuật boxing/muay thai, kỹ năng sư phạm, hình thể và tác phong dịch vụ
dau_ra:    Bản JD hoàn chỉnh, bộ câu hỏi phỏng vấn thực hành, thang điểm đánh giá chuyên môn
tieu_chi:  Chính xác, thu hút nhân tài, phù hợp văn hóa tôn trọng khách hàng của AKC
han:       2 ngày
quyen:     ĐỌC | GHI | BÁO CÁO
thieu:     Khung lương cơ bản và tỷ lệ hoa hồng/buổi dạy hiện tại
```

### F. Mẫu Phân tích thị trường (AKC-THITRUONG)
```yaml
ma_viec:   AKC-THITRUONG-001
agent:     Phân tích thị trường
yeu_cau:   Khảo sát phân khúc phòng tập Private Fitness tại khu vực lân cận cơ sở mới
dau_vao:   Khu vực địa lý bán kính 3-5km
dau_ra:    Báo cáo ma trận cạnh tranh: giá vé, dịch vụ đi kèm, điểm mạnh, điểm yếu của đối thủ
tieu_chi:  100% số liệu có link nguồn hoặc phương pháp khảo sát thực địa rõ ràng
han:       3 ngày
quyen:     ĐỌC | GHI | BÁO CÁO
thieu:     Địa chỉ cụ thể của cơ sở dự kiến mở rộng
```

### G. Mẫu Trợ lý chiến lược (AKC-CHIENLUOC)
```yaml
ma_viec:   AKC-CHIENLUOC-001
agent:     Trợ lý chiến lược
yeu_cau:   Thiết lập kế hoạch hành động tối ưu hóa tỷ lệ gia hạn thẻ tập của hội viên cũ
dau_vao:   Tỷ lệ rời bỏ hiện tại, phản hồi của hội viên sau 3 tháng tập
dau_ra:    Bản chiến lược hành động: Hành trình chăm sóc khách hàng + chính sách tri ân hội viên thân thiết
tieu_chi:  Tính khả thi cao, chi phí tối thiểu, đo lường được bằng KPI
han:       4 ngày
quyen:     ĐỌC | GHI | BÁO CÁO
thieu:     Dữ liệu khảo sát mức độ hài lòng của hội viên gần nhất
```

---

## 3. BIỂU MẪU THẨM ĐỊNH ĐIỂM SỐ (Scoring Sheet)

```markdown
### BẢNG ĐÁNH GIÁ ĐIỂM SỐ (Thang 100)
- Mã việc: AKC-xxxx-xxx
- Agent thực hiện: [Tên Agent]
- Ngày thẩm định: [YYYY-MM-DD]

| Tiêu chí | Điểm tối đa | Điểm chấm | Ghi chú & Căn cứ chấm |
|---|:---:|:---:|---|
| 1. Đúng yêu cầu & Mục tiêu | 25 | ... / 25 | [Giải trình] |
| 2. Dữ liệu & Nguồn kiểm chứng | 20 | ... / 20 | [Liệt kê link nguồn đối chiếu] |
| 3. Tính khả thi & Thực tế | 20 | ... / 20 | [Đánh giá khả năng áp dụng tại AKC] |
| 4. An toàn & Tuân thủ | 20 | ... / 20 | [Xác nhận không vi phạm 4 vùng cấm] |
| 5. Tiết kiệm & Tối ưu | 15 | ... / 15 | [Mức độ tiết kiệm chi phí/thời gian] |
| **TỔNG ĐIỂM** | **100** | **... / 100** | **[≥90: Duyệt · 80-89: Xét · <80: Tạm dừng]** |
```

---

## 4. BIỂU MẪU ĐÓNG BĂNG TÀI LIỆU (Data Freezing Sheet)

```markdown
### BIÊN BẢN ĐÓNG BĂNG DỮ LIỆU
- Mã tài liệu: FREEZE-YYYYMMDD-xxx
- Đường dẫn file gốc: [Đường dẫn file]
- Thư mục đóng băng lưu trữ: `archive/[Năm]/[Tháng]/`
- Lý do ngừng sử dụng: [Thay thế bằng bản mới / hết hiệu lực]
- Tình trạng: ĐÃ ĐÓNG BĂNG (Không xóa, bảo lưu toàn vẹn)
- Người thực hiện: AI Automation
- Ngày đóng băng: [YYYY-MM-DD]
```
