import React from 'react';

const AppSettingsPage = (props) => {
  return (
    <div>
      <h1>Screen Reader Settings</h1>
      <Section>
        <h2>Voice Settings</h2>
        <div>
          <label htmlFor="voiceSelect">Select Voice:</label>
          <select id="voiceSelect" name="voice">
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
          <input id="speedSlider" type="range" min="0" max="100" />
        </div>
      </Section>
      <Section>
        <h2>Text-to-Speech Output</h2>
        <div>
          <label htmlFor="outputCheckbox">Enable Output:</label>
          <input id="outputCheckbox" type="checkbox" />
        </div>
      </Section>
    </div>
  );
};

const Section = (props) => {
  return <div>{props.children}</div>;
};

export default AppSettingsPage;
