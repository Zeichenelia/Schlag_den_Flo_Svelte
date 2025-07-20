<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  export let frontImg: string = '/BoK.png';
  export let backImg: string = '/logo_intro_back.png';
  export let sound: string = '/GameSound.mp3';

  let flipped = false;
  let audio: HTMLAudioElement | null = null;
  const dispatch = createEventDispatcher();

  function flip() {
    if (!flipped) {
      flipped = true;
      if (audio) {
        audio.currentTime = 0;
        audio.play();
      }
    }
  }

  function handleAudioEnd() {
    dispatch('flipEnd');
  }

  onMount(() => {
    // Flip automatisch starten
    flip();
    if (audio) {
      audio.currentTime = 0;
      audio.play();
      audio.addEventListener('ended', handleAudioEnd);
    }
  });

  onDestroy(() => {
    if (audio) {
      audio.removeEventListener('ended', handleAudioEnd);
      audio.pause();
    }
  });
</script>

<div class="flipboard-container">
  <div class="flipboard" class:flipped={flipped}>
    <div class="flipboard-face flipboard-back">
      <img src={backImg} alt="Rückseite" draggable="false" />
    </div>
    <div class="flipboard-face flipboard-front">
      <img src={frontImg} alt="Vorderseite" draggable="false" />
      <audio bind:this={audio} src={sound}></audio>
    </div>
  </div>
</div>

<style>
.flipboard-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  perspective: 1200px;
}

.flipboard {
  width: min(90vw, 480px);
  height: min(90vw, 480px);
  position: relative;
  transform-style: preserve-3d;
  /* Eine Animation, die die Verlangsamung steuert */
  animation: aggressive-flip-slowdown 3.2s ease-out forwards; /* ease-out verlangsamt am Ende */
}

@keyframes aggressive-flip-slowdown {
  0% {
    transform: rotateY(0deg) scale(1);
  }
  /* Phase 1: Extrem schnell - z.B. die ersten 1.5 Umdrehungen (540°) in sehr kurzer Zeit */
  20% { /* Nur 20% der Gesamtzeit für einen Großteil der Drehung */
    transform: rotateY(540deg) scale(1.03);
  }
  /* Phase 2: Nächste Umdrehung (360°) schon deutlich langsamer, aber immer noch zügig */
  50% { /* Weitere 30% der Zeit für die nächsten 200-300° */
    transform: rotateY(780deg) scale(1.06); /* z.B. 540° + 240° */
  }
  /* Phase 3: Die letzten Grad sehr langsam zum Ziel 900° (2.5 Umdrehungen) */
  100% {
    transform: rotateY(900deg) scale(1.08); /* Die restlichen 120° in 50% der Zeit */
  }
}

.flipboard-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.flipboard-back {
  z-index: 2;
}

.flipboard-front {
  transform: rotateY(180deg);
  z-index: 1;
}

.flipped {
  /* Endzustand nach Animation */
  transform: rotateY(900deg) scale(1.08);
}

img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
}
</style>