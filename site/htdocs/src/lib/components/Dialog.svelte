<script>
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	let { dialog = $bindable(), children } = $props();
</script>
<dialog bind:this={dialog} onclose={bubble('close')}>
	{@render children?.()}
</dialog>
