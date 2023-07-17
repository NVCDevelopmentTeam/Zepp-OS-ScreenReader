import React, { useState } from 'react';

const AppSettingsPage = (props) => {
  const [selectedVoice, setSelectedVoice] = useState('voice1');
  const [speechSpeed, setSpeechSpeed] = useState(50);
  const [isOutputEnabled, setIsOutputEnabled] = useState(false);

  const handleVoiceChange = (event) => {
    setSelectedVoice(event.target.value);
  };

  const handleSpeedChange = (event) => {
    setSpeechSpeed(event.target.value);
  };

  const handleOutputChange = (event) => {
    setIsOutputEnabled(event.target.checked);
  };

  return (
    <div>
      <h1>Screen Reader Settings</h1>
      <Section>
        <h2>Voice Settings</h2>
        <div>
          <label htmlFor="voiceSelect">Select Voice:</label>
          <select id="voiceSelect" name="voice" value={selectedVoice} onChange={handleVoiceChange}>
            <option value="voice1">Voice 1</option>
            <option value="voice2">Voice 2</option>
            <option value="voice3">Voice 3</option>
          </select>
        </div>
      </Section>
      <Section>
        <h2>Speech Speed</h2>
        <div>
          <label htmlFor="speedSlider">Adjust Speed:</label>
          <input id="speedSlider" type="range" min="0" max="100" value={speechSpeed} onChange={handleSpeedChange} />
        </div>
      </Section>
      <Section>
        <h2>Text-to-Speech Output</h2>
        <div>
          <label htmlFor="outputCheckbox">Enable Output:</label>
          <input id="outputCheckbox" type="checkbox" checked={isOutputEnabled} onChange={handleOutputChange} />
        </div>
      </Section>
    </div>
  );
};

const Section = (props) => {
  return <div>{props.children}</div>;
};

export default AppSettingsPage;
