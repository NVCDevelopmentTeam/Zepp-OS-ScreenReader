<script>
	import Header from './Header.svelte';
		import './styles.css';
	import Footer from './Footer.svelte';
	</script>

		<Header />
  <main id="main">

		<slot />

 </main>

<Footer />

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>
