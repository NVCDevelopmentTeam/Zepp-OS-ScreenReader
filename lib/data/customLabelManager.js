class CustomLabelManager {
  constructor() {
    this.customLabels = {};
  }

  addLabel(elementId, label) {
    if (!elementId || !label) {
      throw new Error('Element ID and label are required');
    }
    this.customLabels[elementId] = label;
  }

  removeLabel(elementId) {
    if (!elementId) {
      throw new Error('Element ID is required');
    }
    delete this.customLabels[elementId];
  }

  getLabel(elementId) {
    return this.customLabels[elementId] || null;
  }

  hasLabel(elementId) {
    return !!this.customLabels[elementId];
  }

  // Save labels to storage
  saveLabels() {
    try {
      const labelsJSON = JSON.stringify(this.customLabels);
      settings.setItem('customLabels', labelsJSON);
    } catch (error) {
      console.error('Failed to save custom labels:', error);
    }
  }

  // Load labels from storage
  loadLabels() {
    try {
      const labelsJSON = settings.getItem('customLabels');
      if (labelsJSON) {
        this.customLabels = JSON.parse(labelsJSON);
      }
    } catch (error) {
      console.error('Failed to load custom labels:', error);
    }
  }
}

export default new CustomLabelManager();
