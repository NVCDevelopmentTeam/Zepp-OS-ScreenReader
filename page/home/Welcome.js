import { Page } from '@zeppos/zml';

export default Page({
    onInit() {
        console.log("Welcome Page Initialized");
    },

    build() {
        return (
            <div>
                <text>Welcome to Zepp OS Screen Reader</text>
                <button onClick={this.onNavigateToUserGuide}>Go to User Guide</button>
            </div>
        );
    },

    onNavigateToUserGuide() {
        this.$router.push('userGuide');
    }
});
