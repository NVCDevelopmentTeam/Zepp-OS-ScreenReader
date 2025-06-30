import { json, error } from '@sveltejs/kit';

export async function GET({ fetch }) {
    try {
// fetch file from the folder `static`
        const response = await fetch('/sveltiaconfig.json');

        if (!response.ok) {
            error(response.status, 'Không thể tải file cấu hình');
        }

        const data = await response.json();
        return json(data);
    } catch (err) {
        console.error('Lỗi khi đọc JSON:', err);
        error(500, 'Lỗi server khi đọc file JSON');
    }
}
