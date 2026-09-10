/**
 * Zepp OS Screen Reader (ZSR) - Touch Exploration Feature Module
 * File: zsr_touch_exploration.js
 * Description: Toàn bộ tính năng "Khám phá bằng cách chạm" tích hợp trong một file duy nhất.
 *              Bao gồm: Lớp phủ bắt sự kiện, Quản lý danh sách UI, Thuật toán Hit-Testing,
 *              Cơ chế chống nhiễu (Throttling) và Cử chỉ Chạm hai lần (Double Tap) để kích hoạt.
 */

import { createWidget, widget } from '@zos/ui'

// ==========================================
// 1. CẤU HÌNH VÀ KHỞI TẠO BIẾN TOÀN CỤC
// ==========================================
let lastFocusedElementId = null
let lastTapTime = 0
const DOUBLE_TAP_TIMEOUT = 300 // Khoảng thời gian tối đa giữa 2 lần chạm (ms)
const THROTTLE_DELAY = 60 // Giới hạn tần suất xử lý sự kiện MOVE (ms) เพื่อ tiết kiệm pin
let lastMoveProcessedTime = 0

// Danh sách các thành phần UI cần được ZSR quản lý và đọc to
// Trong ứng dụng thực tế, bạn sẽ push các widget vào danh sách này khi khởi tạo giao diện
const zsrUiElements = []

// ==========================================
// 2. CÁC HÀM TRỢ GIÚP LOGIC CỐT LÕI
// ==========================================

/**
 * Hàm giả lập hoặc gọi trực tiếp hệ thống TTS của ZSR để phát âm thanh
 * @param {string} text - Nội dung văn bản cần đọc
 */
function zsrSpeak(text) {
  console.log(`[ZSR TTS]: ${text}`)
  // Tích hợp API âm thanh thực tế của ZSR tại đây
  // Ví dụ: if (globalThis.ZSR && globalThis.ZSR.speak) globalThis.ZSR.speak(text)
}

/**
 * Đăng ký một widget vào danh sách quản lý Khám phá bằng cách chạm
 * @param {string} id - Định danh duy nhất cho thành phần
 * @param {string} text - Văn bản/Mô tả sẽ đọc lên khi chạm trúng
 * @param {number} x - Tọa độ X của widget
 * @param {number} y - Tọa độ Y của widget
 * @param {number} w - Chiều rộng (width) của widget
 * @param {number} h - Chiều cao (height) của widget
 * @param {function} callback - Hàm sẽ thực thi khi người dùng kích hoạt (Double Tap) thành công
 */
export function registerZsrElement(id, text, x, y, w, h, callback) {
  zsrUiElements.push({ id, text, x, y, w, h, callback })
}

/**
 * Xóa danh sách các phần tử UI khi chuyển màn hình để tránh rò rỉ bộ nhớ
 */
export function clearZsrElements() {
  zsrUiElements.length = 0
  lastFocusedElementId = null
}

/**
 * Thuật toán kiểm tra điểm chạm có nằm trong vùng hình học của phần tử không (Hit-Testing)
 */
function findElementAtCoords(touchX, touchY) {
  return zsrUiElements.find((el) => {
    return touchX >= el.x && touchX <= el.x + el.w && touchY >= el.y && touchY <= el.y + el.h
  })
}

// ==========================================
// 3. KHỞI TẠO LỚP PHỦ HỖ TRỢ TIẾP CẬN (ACCESSIBILITY OVERLAY)
// ==========================================
let touchOverlayWidget = null

export function initTouchExploration(screenWidth = 480, screenHeight = 480) {
  // Tạo một VIEW trong suốt phủ toàn bộ màn hình để hứng trọn các sự kiện chạm trước khi đến lớp dưới
  touchOverlayWidget = createWidget(widget.VIEW, {
    x: 0,
    y: 0,
    w: screenWidth,
    h: screenHeight
  })

  // A. Xử lý sự kiện DI CHUYỂN NGÓN TAY (Khám phá bằng cách chạm)
  touchOverlayWidget.addEventListener(widget.event.MOVE, (event) => {
    const now = Date.now()
    // Cơ chế Throttling: Bỏ qua các sự kiện MOVE quá dày đặc để tiết kiệm pin và CPU cho đồng hồ
    if (now - lastMoveProcessedTime < THROTTLE_DELAY) {
      return
    }
    lastMoveProcessedTime = now

    const touchX = event.x
    const touchY = event.y

    // Tìm kiếm phần tử dưới ngón tay
    const currentHovered = findElementAtCoords(touchX, touchY)

    if (currentHovered) {
      // Chỉ đọc khi chuyển từ vùng trống hoặc từ phần tử khác sang phần tử mới này
      if (currentHovered.id !== lastFocusedElementId) {
        lastFocusedElementId = currentHovered.id
        zsrSpeak(currentHovered.text)
      }
    } else {
      // Nếu di chuyển ra vùng trống hoàn toàn
      lastFocusedElementId = null
    }
  })

  // B. Xử lý sự kiện CHẠM XUỐNG / NHẤC LÊN (Cử chỉ Kích hoạt - Double Tap)
  // Zepp OS hỗ trợ bắt sự kiện nhấn thông qua event CLICK hoặc UP/DOWN độc lập
  touchOverlayWidget.addEventListener(widget.event.CLICK, (event) => {
    const now = Date.now()
    const touchX = event.x
    const touchY = event.y

    // Tìm xem cú nhấp này nằm trên phần tử nào
    const clickedElement = findElementAtCoords(touchX, touchY)

    if (!clickedElement) {
      return
    }

    // Kiểm tra xem phần tử được click có trùng với phần tử đang được Focus đọc to hay không
    if (clickedElement.id === lastFocusedElementId) {
      // Tính toán khoảng cách thời gian giữa hai lần nhấp chuột để xác nhận Double Tap
      if (now - lastTapTime < DOUBLE_TAP_TIMEOUT) {
        // Thực thi hành động kích hoạt của phần tử đó
        zsrSpeak(`Kích hoạt ${clickedElement.text}`)
        if (typeof clickedElement.callback === 'function') {
          clickedElement.callback()
        }
        // Reset thời gian sau khi kích hoạt thành công
        lastTapTime = 0
      } else {
        // Ghi nhận lần chạm đầu tiên
        lastTapTime = now
      }
    } else {
      // Trường hợp người dùng nhấp trực tiếp vào một mục mà không kéo vuốt từ trước
      // Chuyển focus ngay lập tức và đọc to mục đó lên
      lastFocusedElementId = clickedElement.id
      zsrSpeak(clickedElement.text)
      lastTapTime = now // Đặt mốc thời gian cho lần chạm tiếp theo để tạo cú đúp
    }
  })
}

/**
 * Hủy bỏ lớp phủ và giải phóng tài nguyên
 */
export function destroyTouchExploration() {
  if (touchOverlayWidget) {
    // Trong thực tế sẽ gọi hàm xóa widget của Zepp OS tùy phiên bản API, ví dụ: deleteWidget(touchOverlayWidget)
    touchOverlayWidget = null
  }
  clearZsrElements()
}
