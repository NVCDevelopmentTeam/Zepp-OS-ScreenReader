<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { error } from '@sveltejs/kit';

    let CMS = null;
    let cmsInitialized = false;
    let cmsError = null;

    async function fetchCMSConfig() {
        try {
            const response = await fetch('/admin/config.yml');
            if (!response.ok) throw new Error('Failed to fetch CMS configuration');
            return await response.json();
        } catch (err) {
            console.error(err);
            throw error(500, 'Error fetching CMS configuration');
        }
    }

    onMount(async () => {
        if (browser) {
            try {
                const cmsConfig = await fetchCMSConfig();
                const sveltia = await import('@sveltia/cms');
                CMS = sveltia.default;

                await CMS.init({
                    config: cmsConfig,
                    hooks: {
                        preSave: (collection, data) => {
                            if (collection === 'posts' && data.title.length < 3) {
                                throw new Error('Post title must be at least 3 characters long.');
                            }
                            return data;
                        },
                    },
                });
                cmsInitialized = true;
            } catch (err) {
                cmsError = err;
                console.error('CMS Initialization Error:', err);
            }
        }
    });
</script>

{#if cmsError}
    <div class="text-red-500 text-center">
        <h2>CMS Initialization Failed</h2>
        <p>{cmsError.message}</p>
    </div>
{:else if !cmsInitialized}
    <div class="text-center text-lg">
        <p>Loading Content Management System...</p>
    </div>
{:else}
    <div id="sveltia-cms"></div>
{/if}
