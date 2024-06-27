import { Layout } from '@zeppos/zml';

export default Layout({
    build() {
        return (
            <div>
                <text>Instructions for use</text>
                <scroll>
                    <text>This is a detailed guide on how to use the Screen Reader application...</text>
                </scroll>
            </div>
        );
    }
});