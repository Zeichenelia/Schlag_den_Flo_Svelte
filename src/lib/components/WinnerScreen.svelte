<!-- src/lib/components/WinnerScreen.svelte -->
<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';

  export let winnerName: string;
  const dispatch = createEventDispatcher();
  let audio: HTMLAudioElement;

  onMount(() => {
    setTimeout(() => {
      audio?.play().catch(e => console.error("Siegermusik konnte nicht starten:", e));
    }, 100);
  });

  function handlePlayAgain() {
    dispatch('playAgain');
  }
</script>

<div class="winner-overlay">
  <div class="confetti-container">
    {#each Array(150) as _}
      <div
        class="confetto"
        style="
          --left: {Math.random() * 100}vw;
          --hue: {Math.random() * 360};
          --delay: {Math.random() * 5}s;
          --duration: {3 + Math.random() * 2}s;
        "
      ></div>
    {/each}
  </div>

  <div class="winner-content">
    <h1 class="congrats-title">Herzlichen Glückwunsch!</h1>
    <h2 class="winner-name">{winnerName}</h2>
    <p class="win-message">hat Schlag den Flo gewonnen!</p>
    <button class="play-again-btn" on:click={handlePlayAgain}>Nochmal spielen</button>
  </div>
</div>

<audio bind:this={audio} src="/one_moment_in_time.mp3" preload="auto">
  Dein Browser unterstützt das Audio-Element nicht.
</audio>

<style>
  .winner-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
    background: radial-gradient(ellipse at center, rgba(29,39,53,0.95) 0%, rgba(13,18,24,1) 100%);
    color: white;
    text-align: center;
    font-family: 'Bebas Neue', sans-serif;
    overflow: hidden;
  }

  .winner-content {
    animation: fadeInContent 2s ease-out forwards;
    z-index: 2; /* Inhalt über dem Konfetti */
  }

  @keyframes fadeInContent {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }

  .congrats-title {
    font-size: clamp(3rem, 10vw, 6rem);
    color: #ffe066;
    text-shadow: 0 0 20px #ffe066;
    margin: 0;
  }

  .winner-name {
    font-size: clamp(2.5rem, 8vw, 5rem);
    margin: 0.5rem 0;
    color: white;
  }

  .win-message {
    font-family: 'Open Sans', sans-serif;
    font-size: clamp(1rem, 3vw, 1.5rem);
  }

  .play-again-btn {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.5rem;
    padding: 0.8rem 2.5rem;
    margin-top: 2rem;
    background: #ffe066;
    color: #222;
    border: none;
    border-radius: 1rem;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.2s;
  }
  .play-again-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(0,0,0,0.4);
  }

  /* --- Konfetti-Stile --- */
  .confetti-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1; /* Hinter dem Inhalt, aber im Overlay */
  }

  .confetto {
    position: absolute;
    width: 12px;
    height: 24px;
    background-color: hsl(var(--hue), 100%, 65%);
    top: -20px;
    left: var(--left);
    
    animation-name: fall;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    animation-delay: var(--delay);
    animation-duration: var(--duration);
  }

  @keyframes fall {
    0% {
      transform: translateY(0vh) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(105vh) rotate(720deg);
      opacity: 0;
    }
  }
</style>