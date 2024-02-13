<script>
  import { writable } from 'svelte/store';

  // Export the store to control dialog display
  export const showDialog = writable(false);

  // Store form data directly in the store
  const formData = writable({ name: '', feedback: '' });

  function submitForm() {
    // Process form data here (e.g., send to server)
    console.log('Form data:', $formData);

    // Clear form data and close the dialog
    formData.set({ name: '', feedback: '' });
    showDialog.set(false);
  }
</script>

{#if $showDialog}
  <div class="dialog">
    <h2>Response</h2>
    <form on:submit|preventDefault={submitForm}>
      <label for="name">Name:</label>
      <input id="name" bind:value={$formData.name} required />

      <label for="feedback">Feedback:</label>
      <textarea id="feedback" bind:value={$formData.feedback} required></textarea>

      <button type="submit">Submit</button>
    </form>
  </div>
{/if}
