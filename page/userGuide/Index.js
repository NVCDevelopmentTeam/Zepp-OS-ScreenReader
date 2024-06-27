import { Page } from '@zeppos/zml';

import userGuidePage from './userGuide';

const pages = {
    userGuide: userGuidePage
};

Page({
    onInit() {
        // Register pages
        for (let page in pages) {
            this.$router.registerPage(page, pages[page]);
        }
        // Go to userGuide page on startup
        this.$router.push('userGuide');
    }
});