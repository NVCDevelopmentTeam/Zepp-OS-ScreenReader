import { Layout } from '@zeppos/zml';

export default Layout({
    build() {
        return (
            <div>
                <text>Welcome to Zepp OS Screen Reader</text>
                <button onClick={() => this.$router.push('userGuide')}>Go to User Guide</button>
            </div>
        );
    }
});