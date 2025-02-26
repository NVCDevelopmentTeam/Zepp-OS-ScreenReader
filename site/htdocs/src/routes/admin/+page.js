export const csr = true;
export const prerender = false;

export const load = async ({ fetch }) => {
    try {
        const response = await fetch('/sveltiaconfig.json');
        if (!response.ok) {
            throw new Error('Failed to load configuration');
        }
        const config = await response.json();
        return {
            config
        };
    } catch (error) {
        console.error('Error loading configuration:', error);
        return {
            config: null,
            error: 'Failed to load configuration'
        };
    }
};