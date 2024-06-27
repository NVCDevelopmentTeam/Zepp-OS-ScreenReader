const tts = new EspeakTTSNG(); // Assuming EspeakTTSNG is a separate class for Text-to-Speech functionality

console.log("User Guide Page Initialized");
tts.speak('Welcome to the User Guide');

const element = (
  <div>
    <text>Welcome to the User Guide</text>
    <button onClick={navigateToDetail}>Go to Detail</button>
  </div>
);

function navigateToDetail() {
  tts.speak('Navigating to detail page');
  // Assuming $router is a reference for navigation (replace with your navigation logic)
  window.location.href = "userGuideDetail"; // Redirect to userGuideDetail route
}

// Assuming this code is being used within a framework, render the element
document.body.appendChild(element);
