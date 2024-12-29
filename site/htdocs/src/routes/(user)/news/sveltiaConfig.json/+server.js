import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.resolve/site/htdocs/sveltiaConfig.json');

  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const jsonObject = JSON.parse(data);
    const jsCode = `export const config = ${JSON.stringify(jsonObject, null, 2)};`;
    return new Response(jsCode, {
      headers: {
        'Content-Type': 'application/javascript',
      },
    });
  } catch (error) {
    return new Response('Lỗi khi đọc hoặc phân tích cú pháp tệp JSON', { status: 500 });
  }
}
