import { gettext } from 'i18n';

Page({
  build() {
    console.log(gettext('example'));

    // Render the main home screen UI here
    const homeScreen = document.createElement('div');
    homeScreen.innerHTML = `
      <h1>${gettext('Welcome to the Screen Reader')}</h1>
      <p>${gettext('This is the main home screen of the Screen Reader app.')}</p>
      <p>${gettext('Use the navigation buttons to browse through different sections.')}</p>
      <button>${gettext('Start Reading')}</button>
    `;

    // Append the home screen UI to the document body
    document.body.appendChild(homeScreen);
  }
});
