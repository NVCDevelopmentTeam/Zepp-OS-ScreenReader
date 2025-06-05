const readCaptcha = (captchaText) => {
  try {
    // Split the captcha text into individual characters
    const characters = captchaText.split('');
    
    // Process each character
    const processedText = characters.map((char) => {
      if (/[0-9]/.test(char)) {
        return `Number ${char}`;
      } else if (/[A-Z]/.test(char)) {
        return `Capital ${char}`;
      } else if (/[a-z]/.test(char)) {
        return `Letter ${char}`;
      }
      return `Symbol ${char}`;
    }).join(', ');

    return {
      success: true,
      text: processedText,
      original: captchaText
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to process CAPTCHA',
      details: error.message
    };
  }
};

export default readCaptcha;
