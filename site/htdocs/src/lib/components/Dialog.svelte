<script>
  /**
   * @typedef {Object} Props
   * @property {HTMLDialogElement} [dialog] bindable: the <dialog> element, to call showModal() / close()
   * @property {string} [labelledby] id of the element that names the dialog (its heading)
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { dialog = $bindable(), labelledby, children } = $props();
</script>

<!-- A <dialog> opened with showModal() already closes on Escape and keeps the focus inside.
     The element has no padding of its own: a click on the dialog element itself can then only
     be a click on the backdrop, which closes it. -->
<dialog
  bind:this={dialog}
  aria-labelledby={labelledby}
  class="backdrop:bg-zeppDark/80 glass rounded-[2.5rem] p-0 border-none shadow-2xl max-w-xl w-[95%] max-h-[95vh] overflow-y-auto relative dark"
  onclick={(e) => {
    if (e.target === dialog) dialog?.close()
  }}
>
  <!-- Background decoration -->
  <div class="absolute top-0 right-0 w-32 h-32 glow-blue opacity-60 pointer-events-none" aria-hidden="true"></div>

  <div class="relative p-10">
    {@render children?.()}
  </div>
</dialog>

<style>
  dialog::backdrop {
    animation: fade-in 0.5s ease-out forwards;
  }
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
