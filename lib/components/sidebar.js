const { default: accessibility } = require("lib/accessibility");
const { set } = require("@zos/alarm");

class Sidebar {
  constructor() {
    this.isOpen = false;
    this.speechEnabled = true;
  }

  initialize() {
    try {
      // Handle touch events
      document.addEventListener("touchstart", (e) => this.handleGesture(e));
      
      // Initialize speech
      if (accessibility && accessibility.speech) {
        this.speech = accessibility.speech;
      } else {
        console.error("Speech functionality not available");
      }
    } catch (error) {
      console.error("Sidebar initialization failed:", error);
    }
  }

  handleGesture(event) {
    const touchX = event.touches[0].clientX;
    const screenWidth = window.innerWidth;

    // Detect right swipe (from left edge)
    if (touchX < 50) {
      this.toggleSidebar();
    }
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
    
    if (this.speechEnabled && this.speech) {
      this.speech.speak(this.isOpen ? "Sidebar opened" : "Sidebar closed");
    }
    
    // Toggle sidebar visibility
    document.getElementById("sidebar").style.display = this.isOpen ? "block" : "none";
  }
}

// Initialize sidebar
const sidebarComponent = new Sidebar();
sidebarComponent.initialize();
