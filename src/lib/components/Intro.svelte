<!-- Intro.svelte -->
<script lang="ts">
  // onDestroy hinzugefügt für sauberes Aufräumen des Event Listeners
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  // export let onIntroEnd: () => void; // Wird nicht mehr als Prop benötigt, wenn dispatch verwendet wird
  export let musicSrc: string = '/intro.mp3';

  let audio: HTMLAudioElement;
  const dispatch = createEventDispatcher();
  let introSkipped = false; // Flag, um mehrfaches Auslösen zu verhindern

  function skipIntro() {
    if (introSkipped) return; // Verhindert mehrfaches Auslösen durch schnelles Drücken oder Event-Überlappung
    introSkipped = true;

    console.log("Intro.svelte: Intro skipped via Spacebar.");
    if (audio) {
      audio.pause();
      audio.currentTime = 0; // Optional: Audio zurücksetzen
    }
    // Die Prop onIntroEnd wird hier nicht mehr direkt aufgerufen, da wir das Event dispatchen
    // if (typeof onIntroEnd === 'function') {
    //   onIntroEnd();
    // }
    dispatch('introEnd');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.code === 'Space') {
      event.preventDefault(); // Verhindert Standardaktionen der Leertaste (z.B. Scrollen)
      skipIntro();
    }
  }
  
  onMount(() => {
    if (audio) {
      audio.play().catch(error => console.error("Audio Playback Error:", error));
      audio.onended = () => {
        if (!introSkipped) { // Nur auslösen, wenn nicht schon geskippt wurde
            console.log("Intro.svelte: Intro audio ended naturally, dispatching introEnd event.");
            // if (typeof onIntroEnd === 'function') { // Alte Prop-basierte Methode
            //    onIntroEnd();
            // }
            dispatch('introEnd');
        }
      };
    }
    // Event Listener für Tastendrücke hinzufügen
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    // WICHTIG: Event Listener entfernen, wenn die Komponente zerstört wird
    window.removeEventListener('keydown', handleKeydown);
    // Aufräumen für Audio, falls die Komponente zerstört wird, während Audio läuft
    if (audio && !audio.paused) {
        audio.pause();
        audio.onended = null; // Entfernt den onended Handler, um Fehler zu vermeiden
    }
  });
</script>

<div class="intro-bg">
  <div class="logo-flip-container">
    <div class="logo-flip"> 
      <img
        src="/logo_intro_back.png"
        alt="Logo Rückseite"
        class="logo-img logo-back"
        draggable="false"
      />
      <img
        src="/logo_intro_front.png"
        alt="Schlag den Flo Logo"
        class="logo-img logo-front"
        draggable="false"
      />
    </div>
  </div>
  {#if musicSrc}
    <audio bind:this={audio} src={musicSrc} preload="auto"></audio>
  {/if}
</div>

<style>
/* Dein bestehender CSS-Code bleibt hier unverändert */
.intro-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 30%, rgba(255, 224, 102, 0.20) 0%, transparent 70%),
    linear-gradient(160deg, #1a1a1d 0%, #2b2b30 50%, #101012 100%);
  background-color: #1a1a1d;
  /* Die Animation für den Hintergrund-Puls wurde hier korrigiert, um auf .intro-bg angewendet zu werden */
  animation: introBackgroundPulse 8s ease-in-out infinite alternate; 
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  overflow: hidden;
}

@keyframes introBackgroundPulse {
  0% {
    background:
      radial-gradient(ellipse at 50% 30%, rgba(255, 224, 102, 0.18) 0%, transparent 70%),
      linear-gradient(160deg, #1a1a1d 0%, #2b2b30 50%, #101012 100%);
    transform: scale(1);
  }
  50% {
    background:
      radial-gradient(ellipse at 50% 30%, rgba(255, 224, 102, 0.22) 0%, transparent 68%),
      linear-gradient(160deg, #1c1c1f 0%, #2d2d32 50%, #111114 100%);
    transform: scale(1.01);
  }
  100% {
    background:
      radial-gradient(ellipse at 50% 30%, rgba(255, 224, 102, 0.18) 0%, transparent 70%),
      linear-gradient(160deg, #1a1a1d 0%, #2b2b30 50%, #101012 100%);
    transform: scale(1);
  }
}

/* Du hattest zwei .intro-bg Definitionen, ich habe die zweite (die nur die Animation enthielt)
   mit der ersten zusammengeführt. Stelle sicher, dass du nur eine Definition für .intro-bg hast.
*/

.logo-flip-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1200px;
}

.logo-flip {
  width: min(70vw, 600px);
  height: min(52vw, 450px);
  position: relative;
  transform-style: preserve-3d;
  transform: rotateY(0deg) scale(0.7); 
  animation: 
    flipAndReachBaseScale 2s cubic-bezier(.68,-0.55,.27,1.55) 0.5s forwards, 
    zoomAfterFlip 0.5s 2.5s forwards,
    growOverTime 24s 3s forwards;
}

.logo-img {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: transparent;
  filter: 
    drop-shadow(0px 1px 3px rgba(255, 224, 102, 0.9))
    drop-shadow(0px 0px 2px rgba(255, 255, 255, 0.7));
  backface-visibility: hidden;
  mask-image: radial-gradient(circle, white 90%, rgba(255,255,255,0.1) 98%, transparent 100%);
}

.logo-back {
  transform: rotateY(0deg);
}

.logo-front {
  transform: rotateY(180deg);
}

@keyframes flipAndReachBaseScale {
  0% { transform: rotateY(0deg) scale(0.7); }
  100% { transform: rotateY(180deg) scale(1); }
}

@keyframes zoomAfterFlip {
  0% { transform: rotateY(180deg) scale(1); }
  100% { transform: rotateY(180deg) scale(1.15); }
}

@keyframes growOverTime {
  0% { transform: rotateY(180deg) scale(1.15); }
  100% { transform: rotateY(180deg) scale(1.35); }
}
</style>