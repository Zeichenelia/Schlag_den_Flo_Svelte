<!-- src/lib/components/GameRevealIntro.svelte -->
<script lang="ts">
  import { onMount, createEventDispatcher, onDestroy } from 'svelte';

  export let gameLogo: string; // Pfad zum spezifischen Spiele-Logo
  export let gameName: string; // Wird vielleicht nicht direkt angezeigt, aber gut zu haben
  
  const commonBacksideLogo = "/logo_intro_back.png"; // Deine gemeinsame Rückseite

  const dispatch = createEventDispatcher();
  let audio: HTMLAudioElement | undefined; // Optional: Soundeffekt
  const revealSoundSrc = "/audio/game_reveal_sound.mp3"; // Beispiel-Sound

  let animationFinished = false;

  onMount(() => {
    // Optional: Soundeffekt abspielen
    // audio = new Audio(revealSoundSrc);
    // audio.play().catch(e => console.error("Reveal sound error", e));

    // Die CSS-Animationen starten automatisch.
    // Wir warten, bis die Hauptanimation (z.B. der Flip) abgeschlossen ist.
    // Das kann über einen Timeout geschehen, der zur CSS-Animationsdauer passt,
    // oder indem man auf das 'animationend'-Event des Flipping-Elements lauscht.

    // Einfacher Timeout-Ansatz (anpassen an deine CSS-Animationsdauer)
    const animationDuration = 2000; // z.B. 2 Sekunden für den Flip
    setTimeout(() => {
      animationFinished = true;
      dispatch('miniIntroEnd');
    }, animationDuration);
  });

  onDestroy(() => {
    if (audio) {
      audio.pause();
      audio = undefined;
    }
  });

</script>

<div class="mini-intro-overlay">
  <div class="mini-logo-flip-container">
    <div class="mini-logo-flip">
      <img
        src={commonBacksideLogo}
        alt="Logo Rückseite"
        class="mini-logo-img mini-logo-back"
        draggable="false"
      />
      <img
        src={gameLogo}
        alt="{gameName} Logo"
        class="mini-logo-img mini-logo-front"
        draggable="false"
      />
    </div>
  </div>
  <!-- Optional: Spielname kann hier auch animiert eingeblendet werden -->
  <!-- <h2 class="revealed-game-name">{gameName}</h2> -->
</div>

<style>
  .mini-intro-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.85); /* Dunkler Overlay */
    display: flex;
    flex-direction: column; /* Falls du den Namen darunter anzeigen willst */
    align-items: center;
    justify-content: center;
    z-index: 2000; /* Über der normalen Spielseite */
    opacity: 0;
    animation: fadeInOverlay 0.3s ease-out forwards;
  }

  @keyframes fadeInOverlay {
    to { opacity: 1; }
  }

  .mini-logo-flip-container {
    perspective: 1000px;
  }

  .mini-logo-flip {
    width: clamp(250px, 50vw, 450px); /* Größe anpassen */
    height: clamp(180px, 36vw, 320px); /* Seitenverhältnis anpassen */
    position: relative;
    transform-style: preserve-3d;
    /* Initialzustand für die Animation */
    transform: rotateY(0deg) scale(0.5);
    opacity: 0;
    /* Animation: Flip, dann vielleicht ein kurzer Zoom/Hold */
    animation:
      miniLogoAppearAndFlip 1.5s cubic-bezier(.68,-0.55,.27,1.55) 0.2s forwards,
      miniLogoHold 0.5s 1.7s forwards; /* 0.2s + 1.5s = 1.7s */
      /* Die Gesamtzeit (1.7s + 0.5s = 2.2s) sollte zum Timeout im Script passen */
  }

  @keyframes miniLogoAppearAndFlip {
    0% {
      opacity: 0;
      transform: rotateY(0deg) scale(0.5);
    }
    20% { /* Sichtbar werden */
      opacity: 1;
    }
    100% {
      opacity: 1;
      transform: rotateY(180deg) scale(1);
    }
  }
  
  @keyframes miniLogoHold { /* Optional: Kurzes Halten bevor es verschwindet */
    0% { opacity: 1; transform: rotateY(180deg) scale(1); }
    100% { opacity: 1; transform: rotateY(180deg) scale(1); }
  }


  .mini-logo-img {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: transparent;
    object-fit: contain; /* Stellt sicher, dass das Logo gut ins Bild passt */
    backface-visibility: hidden;
    /* Kein oder sehr subtiler Glow hier, um den Fokus auf das Logo zu legen */
    /* filter: drop-shadow(0px 0px 5px rgba(255, 224, 102, 0.7)); */
    border-radius: 1rem; /* Falls die Karten abgerundet sind */
  }

  .mini-logo-back {
    transform: rotateY(0deg);
  }

  .mini-logo-front {
    transform: rotateY(180deg);
  }

  /* Optional: Styling für den eingeblendeten Spielnamen */
  .revealed-game-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(2rem, 5vw, 3.5rem);
    color: #ffe066;
    text-shadow: 0 0 5px #000;
    margin-top: 2rem;
    opacity: 0;
    animation: fadeInGameName 0.5s ease-out 1.5s forwards; /* Erscheint, wenn das Logo fast gedreht ist */
  }

  @keyframes fadeInGameName {
    to { opacity: 1; }
  }
</style>