<!-- src/lib/components/NewSplashScreen.svelte -->
<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  export let onStart: () => void;
  const dispatch = createEventDispatcher();
  
  function handleStart() {
    dispatch('start');
  }

  let loaded = false;
  onMount(() => {
    // Kurzer Delay, damit die Animation sichtbar wird
    setTimeout(() => {
      loaded = true;
    }, 100);
  });
</script>

<div class="new-splash-bg" class:loaded>
  <div class="logo-container">
    <img src="/logo_intro_front.png" alt="Schlag den Flo Logo" class="splash-main-logo" draggable="false"/>
    <h1 class="splash-title">SCHLAG DEN FLO</h1>
    <p class="splash-subtitle">Bist du bereit für die Herausforderung?</p>
  </div>
  <button class="start-game-btn" on:click={onStart}>
    <span class="btn-icon">▶</span> Spiel starten
  </button>
  <div class="footer-flair">
    <!-- Optional: Kleine dekorative Elemente -->
  </div>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto:wght@400;700&display=swap');

  .new-splash-bg {
    min-height: 100vh;
    width: 100%;
    /* Hintergrund ähnlich dem Intro, vielleicht etwas statischer oder mit anderer Dynamik */
    background:
      radial-gradient(ellipse at 50% 30%, rgba(255, 224, 102, 0.15) 0%, transparent 60%), /* Leichter goldener Schein oben */
      linear-gradient(160deg, #1a1a1d 0%, #2b2b30 50%, #101012 100%);
    background-color: #1a1a1d; /* Fallback */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    box-sizing: border-box;
    text-align: center;
    gap: 2rem; /* Abstand zwischen Logo-Block und Button */
    opacity: 0;
    transform: scale(0.95);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  }

  .new-splash-bg.loaded {
    opacity: 1;
    transform: scale(1);
  }

  .logo-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem; /* Kleinerer Abstand innerhalb des Logo-Blocks */
    animation: fadeInLogo 1s ease-out 0.3s forwards;
    opacity: 0; /* Initial unsichtbar für Animation */
  }

  @keyframes fadeInLogo {
    to {
      opacity: 1;
    }
  }

  .splash-main-logo {
    width: clamp(200px, 40vw, 450px); /* Responsive Größe */
    max-width: 90%;
    height: auto;
    filter: drop-shadow(0px 5px 25px rgba(255, 224, 102, 0.4))
            drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.3));
    margin-bottom: 1rem;
  }

  .splash-title {
    font-family: 'Bebas Neue', 'Impact', sans-serif;
    font-size: clamp(3rem, 8vw, 6rem);
    color: #ffe066;
    text-shadow: 0 0 8px rgba(0,0,0,0.7), 3px 3px 0px #111;
    margin: 0;
    line-height: 1.1;
    letter-spacing: 0.05em;
  }

  .splash-subtitle {
    font-family: 'Roboto', sans-serif;
    font-size: clamp(1rem, 2.5vw, 1.5rem);
    color: #e0e0e0;
    margin: 0.5rem 0 0 0;
    font-weight: 400;
    opacity: 0.9;
  }

  .start-game-btn {
    font-family: 'Bebas Neue', 'Impact', sans-serif;
    font-size: clamp(1.8rem, 4vw, 2.5rem);
    padding: clamp(0.8rem, 2vw, 1.2rem) clamp(2.5rem, 5vw, 4rem);
    background: linear-gradient(145deg, #ffe066, #f7c948);
    color: #222;
    border: none;
    border-radius: 50px; /* Stark abgerundet */
    box-shadow: 0 6px 25px rgba(0,0,0,0.4),
                inset 0 -3px 5px rgba(0,0,0,0.15),
                inset 0 2px 3px rgba(255,255,255,0.3);
    cursor: pointer;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    transition: all 0.2s ease-out;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    animation: пульс 2s infinite ease-in-out alternate, fadeInButton 1s ease-out 0.6s forwards; /* Puls-Animation und Fade-In */
    opacity: 0; /* Initial unsichtbar für Animation */
  }

  @keyframes fadeInButton {
    to {
      opacity: 1;
    }
  }

  .start-game-btn:hover {
    transform: scale(1.08) translateY(-3px);
    box-shadow: 0 10px 30px rgba(255, 200, 50, 0.5),
                inset 0 -3px 5px rgba(0,0,0,0.2),
                inset 0 2px 3px rgba(255,255,255,0.4);
    background: linear-gradient(145deg, #fff0a0, #f8d050); /* Heller im Hover */
    animation-play-state: paused; /* Stoppt die Puls-Animation im Hover */
  }
  .start-game-btn:active {
    transform: scale(1.02) translateY(0px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.3),
                inset 0 -2px 3px rgba(0,0,0,0.2),
                inset 0 1px 2px rgba(255,255,255,0.2);
  }

  .btn-icon {
    font-size: 0.8em; /* Macht das Dreieck etwas kleiner als der Text */
    line-height: 1; /* Verhindert vertikales Verrutschen */
  }

  /* Keyframe für die Puls-Animation des Buttons */
  @keyframes пульс { /* Kreativer Name ;) */
    0% {
      transform: scale(1);
      box-shadow: 0 6px 25px rgba(0,0,0,0.4),
                  inset 0 -3px 5px rgba(0,0,0,0.15),
                  inset 0 2px 3px rgba(255,255,255,0.3);
    }
    50% {
      transform: scale(1.03);
      box-shadow: 0 8px 30px rgba(255, 210, 80, 0.4), /* Leichter goldener Schein beim Puls */
                  inset 0 -3px 5px rgba(0,0,0,0.15),
                  inset 0 2px 3px rgba(255,255,255,0.3);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 6px 25px rgba(0,0,0,0.4),
                  inset 0 -3px 5px rgba(0,0,0,0.15),
                  inset 0 2px 3px rgba(255,255,255,0.3);
    }
  }

  /* Optional: Kleines dekoratives Element am unteren Rand */
  .footer-flair {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 3px;
    background: linear-gradient(90deg, transparent, #ffe06688, transparent);
    border-radius: 3px;
    opacity: 0;
    animation: fadeInFlair 1s ease-out 0.9s forwards;
  }
  @keyframes fadeInFlair {
    to { opacity: 0.6; }
  }

</style>