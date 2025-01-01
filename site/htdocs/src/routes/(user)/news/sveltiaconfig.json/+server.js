import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

export async function GET({ url }) {
    try {
        let fileContent;

        // Determine the environment to decide how to read the file
        if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
            // Fetch the file from the URL when deployed
            const postRes = await fetch(`${url.origin}/sveltiaconfig.json`);
            fileContent = await postRes.text();
        } else {
            // Read the file locally when running on localhost
            const filePath = path.join(process.cwd(), 'static', 'sveltiaconfig.json');
            fileContent = fs.readFileSync(filePath, 'utf-8');
        }

        // Parse the JSON content
        const sveltiaConfig = JSON.parse(fileContent);
        return json(sveltiaConfig);

    } catch (error) {
        console.error('Error reading JSON file:', error);
        return new Response('Error reading JSON file', { status: 500 });
    }
}
