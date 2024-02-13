<script>
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
    // Tạo một store để kiểm soát việc hiển thị hộp thoại
    export const showDialog = writable(false);

    let name = '';
    let feedback = '';

    function submitForm() {
        // Xử lý dữ liệu form tại đây
        console.log({ name, feedback });

        // Đóng hộp thoại sau khi gửi form
        showDialog.set(false);
    }
</script>

{#if $showDialog}
    <div class="dialog">
        <h2>Phản hồi</h2>
        <form on:submit|preventDefault={submitForm}>
            <label for="name">Tên:</label>
            <input id="name" bind:value={name} required />

            <label for="feedback">Phản hồi:</label>
            <textarea id="feedback" bind:value={feedback} required></textarea>

            <button type="submit">Gửi</button>
        </form>
    </div>
{/if}
