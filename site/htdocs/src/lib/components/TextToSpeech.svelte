<script>
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';

  export let post = ''; // Receive post content from parent component
  let isPlaying = false;
  let volume = 1;
  let rate = 1;
  let pitch = 1;
  let selectedVoice = 'Vietnamese Male';
  let responsiveVoice;

  onMount(() => {
    if (browser) {
      const script = document.createElement('script');
      script.src = 'https://code.responsivevoice.org/responsivevoice.js?key=6BLD3hdr';
      script.async = true;
      script.onload = () => {
        responsiveVoice = window.responsiveVoice;
        responsiveVoice.init();
      };
      document.body.appendChild(script);
    }
  });

  onDestroy(() => {
    if (responsiveVoice && isPlaying) {
      responsiveVoice.cancel();
    }
  });

  function speakText() {
    if (browser && responsiveVoice) {
      if (isPlaying) {
        responsiveVoice.pause();
        isPlaying = false;
      } else {
        responsiveVoice.speak(post, selectedVoice, {
          volume: volume,
          rate: rate,
          pitch: pitch,
          onend: () => {
            isPlaying = false;
          }
        });
        isPlaying = true;
      }
    } else {
      console.error('ResponsiveVoice is not loaded or not working.');
    }
  }

  function handleParameterChange() {
    if (isPlaying) {
      responsiveVoice.cancel();
      speakText();
    }
  }

  $: if (browser && responsiveVoice && (volume !== 1 || rate !== 1 || pitch !== 1)) {
    handleParameterChange();
  }
</script>

<div>
  <button on:click={speakText}>
    {isPlaying ? 'Pause' : 'Play'}
  </button>
  
  <label for="voice">Voice:</label>
  <select id="voice" bind:value={selectedVoice} on:change={handleParameterChange}>
    <option value="Vietnamese Male">Vietnamese Male</option>
    <option value="Vietnamese Female">Vietnamese Female</option>
  </select>

  <label for="rate">Speed:</label>
  <input 
    type="range" 
    id="rate"
    min="0.5" 
    max="1.5" 
    step="0.1" 
    bind:value={rate} 
    aria-label="Reading rate" 
  />

  <label for="pitch">Pitch:</label>
  <input 
    type="range" 
    id="pitch"
    min="0.5" 
    max="1.5" 
    step="0.1" 
    bind:value={pitch} 
    aria-label="Reading pitch" 
  />

  <label for="volume">Volume:</label>
  <input 
    type="range" 
    id="volume"
    min="0" 
    max="1" 
    step="0.1" 
    bind:value={volume} 
    aria-label="Volume" 
  />
</div>