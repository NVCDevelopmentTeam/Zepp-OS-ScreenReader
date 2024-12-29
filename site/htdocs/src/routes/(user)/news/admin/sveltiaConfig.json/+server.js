import { json } from '@sveltejs/kit';
import sveltiaConfig from '../../../../../../static/admin/sveltiaConfig.json';

export async function GET() {
  try {
    return json(sveltiaConfig);
  } catch (error) {
    return new Response('Error fetching JSON file', { status: 500 });
  }
}
