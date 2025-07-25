class OCR {
  constructor() {
    this.lastResult = null;
    this.isProcessing = false;
    this.debugMode = false;
    this.debugStats = {
      processTime: 0,
      detectedRegions: 0,
      confidence: 0
    };
  }

  enableDebug(enable = true) {
    this.debugMode = enable;
  }

  async recognizeText(screenImage) {
    const startTime = Date.now();
    try {
      this.isProcessing = true;

      if (!screenImage || typeof screenImage.width !== 'number' || typeof screenImage.height !== 'number') {
        throw new Error('Invalid screenImage provided to recognizeText');
      }

      const result = await this.processImage(screenImage);
      this.lastResult = result;
      if (this.debugMode) {
        this.debugStats.processTime = Date.now() - startTime;
        this.logDebugInfo(result);
      }
      return result;
    } catch (error) {
      if (this.debugMode) {
        console.error('OCR Debug - Error:', {
          error,
          imageSize: screenImage ? `${screenImage.width}x${screenImage.height}` : 'N/A',
          processingTime: Date.now() - startTime
        });
      }
      console.error('OCR Error:', error);
      return null;
    } finally {
      this.isProcessing = false;
    }
  }

  logDebugInfo(result) {
    console.log('OCR Debug Info:', {
      processingTime: `${this.debugStats.processTime.toFixed(2)}ms`,
      detectedRegions: result.length,
      memoryUsage: performance.memory ? 
        `${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)}MB` : 'N/A'
    });
  }

  async prepareImage(screenImage) {
    // Convert screen capture to grayscale for better processing
    return {
      width: screenImage.width,
      height: screenImage.height,
      data: this.convertToGrayscale(screenImage.data)
    };
  }

  convertToGrayscale(imageData) {
    // Basic grayscale conversion
    const gray = new Uint8Array(imageData.length / 4);
    for (let i = 0; i < imageData.length; i += 4) {
      gray[i / 4] = (imageData[i] * 0.299 + 
                     imageData[i + 1] * 0.587 + 
                     imageData[i + 2] * 0.114);
    }
    return gray;
  }

  async processImage(screenImage) {
    // Basic text detection and recognition
    const imageData = await this.prepareImage(screenImage);
    const textRegions = this.detectTextRegions(imageData);
    return this.extractText(textRegions);
  }

  detectTextRegions(imageData) { // eslint-disable-line no-unused-vars
    const regions = [];
    // Implement basic text region detection
    // This is a simplified version - real implementation would need more sophisticated algorithms
    if (this.debugMode) {
      this.debugStats.detectedRegions = regions.length;
      this.visualizeRegions(regions);
    }
    return { regions, boundingBoxes: [] };
  }

  visualizeRegions(regions) {
    if (this.debugMode) {
      console.log('Text Regions:', regions.map((r, i) => 
        `Region ${i}: ${JSON.stringify(r.bounds)}`
      ));
    }
  }

  extractText(regions) {
    // Convert detected regions to text
    return regions.map(region => ({
      text: '',
      confidence: 0,
      bounds: region.bounds
    }));
  }

  getLastResult() {
    return this.lastResult;
  }
}

export default OCR;