<!-- src/routes/+layout.svelte -->
<script lang="ts">
  // isMusicOverridden importieren
  import { isPlaying, toggleAudio, volume, isMusicOverridden } from '$lib/audioStore';

  let audio: HTMLAudioElement;

  $: if (audio) {
    // Die Musik spielt nur, wenn sie soll UND nicht von einer anderen übersteuert wird.
    if ($isPlaying && !$isMusicOverridden) {
      audio.play().catch(error => console.error("Audio konnte nicht gestartet werden:", error));
    } else {
      audio.pause();
    }
    audio.volume = $volume;
  }
</script>

<slot />

<audio 
  bind:this={audio} 
  src="/background-music.mp3" 
  loop
>
  Dein Browser unterstützt das Audio-Element nicht.
</audio>

<div class="audio-controls-container">
  <button class="audio-toggle-btn" on:click={toggleAudio} title={$isPlaying ? 'Musik pausieren' : 'Musik abspielen'}>
    {#if $isPlaying}
      <!-- Pause Icon -->
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="0" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
    {:else}
      <!-- Play Icon -->
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="0" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
    {/if}
  </button>

  <input 
    type="range" 
    min="0" 
    max="1" 
    step="0.01" 
    bind:value={$volume}
    class="volume-slider"
    title="Lautstärke"
  />
</div>

<style>
  .audio-controls-container {
    position: fixed;
    /* Geändert für die linke obere Ecke */
    top: 20px;
    left: 20px;
    z-index: 9999;
    
    display: flex;
    align-items: center;
    gap: 12px;
    
    background-color: rgba(40, 40, 45, 0.7);
    padding: 8px;
    border-radius: 30px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(5px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    
    transition: all 0.3s ease;
  }

  .audio-toggle-btn {
    background-color: white;
    color: #222;
    border: none;
    border-radius: 50%;
    width: 45px;
    height: 45px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: transform 0.2s ease;
    flex-shrink: 0;
  }

  .audio-toggle-btn:hover {
    transform: scale(1.1);
  }

  .volume-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 0;
    height: 6px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
    outline: none;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: width 0.3s ease, opacity 0.3s ease, visibility 0.3s;
  }
  
  .audio-controls-container:hover .volume-slider {
    width: 100px;
    opacity: 1;
    visibility: visible;
  }
  
  .volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
  }

  .volume-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    border: none;
  }
</style>