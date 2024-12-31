import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        // Access the file from the static directory
        const filePath = path.join(process.cwd(), 'static', 'sveltiaconfig.json');
        
        // Read the file synchronously
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        
        // Parse and return the JSON data
        const sveltiaConfig = JSON.parse(fileContent);
        return json(sveltiaConfig);
    } catch (error) {
        console.error('Error reading JSON file:', error);
        console.error('File path attempted:', path.join(process.cwd(), 'static', 'sveltiaconfig.json'));
        return new Response('Error reading JSON file', { status: 500 });
    }
}