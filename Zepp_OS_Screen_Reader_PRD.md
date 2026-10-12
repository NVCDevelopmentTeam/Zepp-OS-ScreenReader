# AI SYSTEM SPECIFICATION & ARCHITECTURE DIRECTIVE

## Zepp OS Screen Reader (ZSR) - Technical Requirements Document for AI Context Optimization

---

## 1. TỔNG QUAN HỆ THỐNG & CẤU TRÚC REPOSITORY

ZSR (Zepp OS Screen Reader) là dịch vụ trợ năng chuyên biệt dành cho người khiếm thị trên các thiết bị đeo thông minh chạy hệ điều hành Zepp OS. Dưới đây là sơ đồ cấu trúc thư mục chuẩn hóa để AI nhận diện đúng phạm vi xử lý code:

- **`app-side/`**: Quản lý kích thước màn hình và kích thước biểu tượng của ứng dụng.
- **`app-widget/`**: Chứa các Widget chính của ứng dụng.
- **`assets/`**: Chứa tài nguyên hình ảnh, biểu tượng (icons) và âm thanh.
- **`lib/`**: Nhân cốt lõi (Core Engine) xử lý logic, thành phần UI và các phần phụ thuộc chính của ZSR.
- **`page/`**: Quản lý giao diện và điều hướng giữa các trang UI trong ứng dụng.
- **`secondary-widget/`**: Widget phụ hiển thị cảnh báo trực quan cho người sáng mắt khi ZSR đang kích hoạt.
- **`server/`**: Xử lý các tác vụ thời gian thực nâng cao (như nhận diện điều khiển giọng nói server-side).
- **`setting/`**: Chứa toàn bộ các mô-đun giao diện và logic cài đặt của ZSR.
- **`shared/`**: Quản lý phân quyền hệ thống, cấp quyền cho ZSR đọc nội dung ứng dụng khác mà không ràng buộc ứng dụng đó.

---

## 2. NGUYÊN TẮC KẾ THỪA THIẾT KẾ (INHERITANCE MODEL)

Hệ thống ZSR kết hợp các ưu điểm hàng đầu từ 3 trình đọc màn hình phổ biến:

- **TalkBack (Android):** Kế thừa cơ chế khám phá bằng cử chỉ chạm (_Explore by touch_), phân cấp Accessible Focus và khả năng đọc tài liệu theo cấu trúc ngữ cảnh linh hoạt.
- **Jieshuo (Commentary):** Kế thừa hệ thống phản hồi bằng gói âm thanh tùy biến (_Sound Schemes_) và khả năng gán cử chỉ vuốt đa cấp độ linh hoạt.
- **NVDA (Windows):** Kế thừa tùy chỉnh con trỏ màn hình, cơ chế điều hướng theo đối tượng/văn bản (_Object Navigation_) và quản lý quy tắc đọc tài liệu chi tiết.

---

## 3. DANH MỤC MÔ-ĐUN CÀI ĐẶT (SETTINGS MATRIX)

Bảng quy chuẩn danh mục cài đặt trong thư mục `setting/` dùng làm căn cứ định danh chức năng cho AI:

|  STT   | Mô-đun Cài đặt (Module Class) | Chức năng & Yêu cầu Kỹ thuật cho AI                                                                    |
| :----: | :---------------------------- | :----------------------------------------------------------------------------------------------------- |
| **1**  | **AboutSetting**              | Hiển thị thông tin thiết bị/ứng dụng; tích hợp tự động kiểm tra và tải bản cập nhật mới nhất.          |
| **2**  | **accessibilitySetting**      | Phím tắt kích hoạt nhanh dịch vụ trợ năng hệ thống mà không cần điều hướng thủ công.                   |
| **3**  | **AdvancedSettings**          | Tùy chỉnh sâu các thông số kỹ thuật nâng cao dành cho người dùng chuyên sâu.                           |
| **4**  | **AudioBrailleSetting**       | Mô-đun cha quản lý tập trung cài đặt Âm thanh và Chữ nổi Braille.                                      |
| **5**  | **audioSetting**              | Chọn thiết bị đầu ra (Tai nghe/Loa ngoài), Audio Ducking (giảm âm nền), phân luồng tai nghe Trái/Phải. |
| **6**  | **brailleSetting**            | Quản lý kết nối màn hình chữ nổi Braille qua BLE, bàn phím chữ nổi và các kiểu nhập liệu.              |
| **7**  | **DeveloperSettings**         | Môi trường thử nghiệm tính năng nội bộ dành riêng cho nhà phát triển.                                  |
| **8**  | **DisplaySetting**            | Tùy chỉnh hiển thị con trỏ màn hình và các cử chỉ liên quan (tham chiếu NVDA).                         |
| **9**  | **DocumentSetting**           | Quy tắc lọc và đọc nội dung tài liệu theo tùy chỉnh (tham chiếu NVDA, TalkBack, Jieshuo).              |
| **10** | **FeedbackSetting**           | Cấu hình chi tiết phản hồi bằng âm thanh (Sound) và phản hồi rung (Haptic feedback).                   |
| **11** | **fontSetting**               | Tùy chỉnh font chữ hiển thị và cách ZSR xử lý đọc các dạng font chữ đặc biệt.                          |
| **12** | **GeneralSetting**            | Cấu hình chung cho toàn bộ hệ thống ZSR.                                                               |
| **13** | **GesturesInputSetting**      | Quản lý phương thức nhập liệu, cử chỉ vuốt chạm và bàn phím ảo.                                        |
| **14** | **InputCompositionSetting**   | Xử lý ghép chuỗi ký tự và bộ gõ nâng cao.                                                              |
| **15** | **InputGestureSetting**       | Bản đồ gán (mapping) cử chỉ đầu vào với các lệnh hành động cụ thể.                                     |
| **16** | **KeyboardSetting**           | Cấu hình tương tác và phím tắt thông qua bàn phím vật lý kết nối với đồng hồ.                          |
| **17** | **LanguageSetting**           | Đa ngôn ngữ (i18n) cho toàn bộ giao diện và phản hồi giọng nói của ZSR.                                |
| **18** | **MenuSetting**               | Tùy biến Context Menu (Menu ngữ cảnh) thao tác nhanh của ZSR.                                          |
| **19** | **NavigationSetting**         | Điều hướng theo văn bản, đối tượng, ứng dụng hoặc trình duyệt web (tham chiếu NVDA).                   |
| **20** | **NotificationSetting**       | Xử lý ngắt, lọc và đọc thông báo ứng dụng theo thời gian thực.                                         |
| **21** | **ObjectPresentationSetting** | Cấu hình phương thức đọc thuộc tính, trạng thái và loại đối tượng trên UI.                             |
| **22** | **OCRSetting**                | Tích hợp OCR nhận diện và chuyển đổi văn bản từ hình ảnh/màn hình.                                     |
| **23** | **RemoteAccessSetting**       | Điều khiển thiết bị từ xa qua kết nối Bluetooth/Companion App trên Smartphone.                         |
| **24** | **shortcutSetting**           | Tùy biến các tổ hợp phím tắt thao tác nhanh trên thiết bị.                                             |
| **25** | **SoundSetting**              | Quản lý các gói âm thanh hiệu ứng (Sound Schemes) độc lập (tham chiếu Jieshuo).                        |
| **26** | **SpeechHistorySetting**      | Nhật ký lưu trữ và cho phép xem lại/đọc lại các câu phát âm gần nhất.                                  |
| **27** | **SpeechSetting**             | Điều chỉnh Tốc độ (Rate), Độ cao (Pitch), Verbosity (độ chi tiết) nhằm tiết kiệm thời gian nghe.       |
| **28** | **TextToSpeechSetting**       | Quản lý Engine TTS (Mặc định tích hợp eSpeak-NG offline, cho phép đổi công cụ TTS khác).               |
| **29** | **VisionSetting**             | Tùy chỉnh tính năng màn hình như làm mờ/tắt màn hình (Screen Curtain) để bảo mật.                      |
| **30** | **VoiceSetting**              | Lựa chọn giọng đọc và biến thể ngôn ngữ của TTS Engine đang sử dụng.                                   |
| **31** | **volumeSetting**             | Điều chỉnh kênh âm lượng độc lập dành riêng cho trình đọc màn hình ZSR.                                |

---

## 4. CHỈ THỊ THỰC THI CHO AI DEVELOPER (IMPLEMENTATION DIRECTIVES)

1. **Tối ưu hóa Tài nguyên:** Thiết bị Zepp OS có RAM và dung lượng Pin rất hạn chế. Mọi luồng xử lý giọng nói trong `SpeechSetting` phải được tối ưu độ trễ phát âm dưới 100ms và không gây quá tải bộ nhớ.
2. **Dự phòng TTS Offline:** Mô-đun `TextToSpeechSetting` bắt buộc phải duy trì **eSpeak-NG** làm bộ đọc dự phòng mặc định để đảm bảo ZSR luôn hoạt động ổn định ở chế độ Offline.
3. **Kiểm soát Quyền hạn trong `shared/`:** Các tác vụ truy cập nội dung từ ứng dụng khác phải đi qua lớp kiểm tra quyền tại `shared/`. Đảm bảo ứng dụng bên thứ ba không bị gián đoạn và có cơ chế fallback mượt mà khi người dùng thu hồi quyền.
4. **Thích ứng Đa Màn hình:** Khi sinh code UI, tuyệt đối không dùng giá trị pixel cứng (_hardcoded px_). Bắt buộc khai báo `targets` trong `app.json` và sử dụng trợ lý `px()` để co giãn tự động theo kích thước màn hình mặt đồng hồ.
