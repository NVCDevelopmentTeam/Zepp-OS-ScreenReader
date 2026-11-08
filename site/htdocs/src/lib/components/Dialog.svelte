<script>
	let { dialog = $bindable(), children } = $props();
</script>

<dialog 
  bind:this={dialog} 
  class="backdrop:bg-zeppDark/80 glass rounded-[2.5rem] p-10 border-none shadow-2xl max-w-xl w-[95%] animate-in zoom-in duration-500 overflow-hidden relative dark"
  onclick={(e) => { if (e.target === dialog) dialog.close(); }}
  onkeydown={(e) => { if (e.key === 'Escape') dialog.close(); }}
>
  <!-- Background decoration -->
  <div class="absolute top-0 right-0 w-32 h-32 glow-blue opacity-60 -z-10" aria-hidden="true"></div>
  
	{@render children?.()}
</dialog>

<style>
  dialog::backdrop {
    animation: fade-in 0.5s ease-out forwards;
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
