<!-- src/lib/components/MainGamePage.svelte (oder wie du es nennen möchtest) -->
<script lang="ts">
  import { onMount } from 'svelte';

  // Beispiel-Daten, diese würden von außen kommen oder hier verwaltet
  let player1Name = "Flo";
  let player2Name = "Gegner";
  let player1Score = 0;
  let player2Score = 0;
  let currentRound = 1;
  let totalRounds = 18; // Oder basierend auf der Anzahl der Spiele

  const games = [
    { id: 1, name: "Blamieren oder Kassieren", rules: "Quizfragen beantworten.", points: 1 },
    { id: 2, name: "Auswendig lernen", rules: "Dinge merken.", points: 2 },
    // ... mehr Spiele
  ];

  let currentGameIndex = 0;
  let currentSelectedGame = games[currentGameIndex];
  let isCardFlipped = false;

  function revealGame() {
    if (!isCardFlipped) {
      isCardFlipped = true;
      // Logik, um Spiel-Infos zu aktualisieren, falls nicht schon geschehen
    }
  }

  function awardPoints(winner: 'player1' | 'player2' | 'draw') {
    if (!currentSelectedGame || !isCardFlipped) return;

    const points = currentSelectedGame.points;
    if (winner === 'player1') {
      player1Score += points;
    } else if (winner === 'player2') {
      player2Score += points;
    }
    // Nächstes Spiel vorbereiten
    prepareNextGame();
  }

  function prepareNextGame() {
    isCardFlipped = false;
    currentGameIndex++;
    if (currentGameIndex < games.length) {
      currentSelectedGame = games[currentGameIndex];
      currentRound = currentSelectedGame.id; // Wenn Spiel-ID = Runde
    } else {
      // Spiel vorbei Logik
      console.log("Spiel vorbei!");
      // Hier könnte man z.B. einen Gewinner-Screen anzeigen
    }
  }

  // Für eine kleine Intro-Animation der Elemente
  let pageLoaded = false;
  onMount(() => {
    setTimeout(() => {
      pageLoaded = true;
    }, 100); // Kurzer Delay für den Effekt
  });

</script>

<div class="main-game-bg" class:loaded={pageLoaded}>
  <header class="game-header">
    <img src="/logo_intro_front.png" alt="Schlag den Flo Logo" class="header-logo" draggable="false"/>
    <div class="header-title-container">
      <h1 class="main-title">SCHLAG DEN FLO</h1>
      <div class="round-info">Spiel {currentRound} / {totalRounds}</div>
    </div>
  </header>

  <main class="game-content">
    <section class="scoreboard-section panel">
      <div class="player-score">
        <span class="player-name">{player1Name}</span>
        <span class="score">{player1Score}</span>
      </div>
      <div class="vs">VS</div>
      <div class="player-score">
        <span class="player-name">{player2Name}</span>
        <span class="score">{player2Score}</span>
      </div>
    </section>

    <section class="game-announcement-section panel">
      <h2>Nächstes Spiel</h2>
      <div class="game-card-container" on:click={revealGame}>
        <div class="game-card" class:flipped={isCardFlipped}>
          <div class="card-face card-front">
            <span>Spiel {currentSelectedGame?.id || '?'}</span>
          </div>
          <div class="card-face card-back">
            <span>{currentSelectedGame?.name || 'Spielname'}</span>
          </div>
        </div>
      </div>
      {#if !isCardFlipped}
        <button class="action-btn reveal-btn" on:click|stopPropagation={revealGame}>Spiel aufdecken!</button>
      {/if}
    </section>

    {#if isCardFlipped && currentSelectedGame}
      <section class="current-game-details-section panel">
        <h3>{currentSelectedGame.name}</h3>
        <p class="rules">{currentSelectedGame.rules}</p>
        <p class="points"><strong>Punkte für dieses Spiel: {currentSelectedGame.points}</strong></p>
        <div class="winner-controls">
          <button class="action-btn" on:click={() => awardPoints('player1')}>{player1Name} gewinnt</button>
          <button class="action-btn" on:click={() => awardPoints('player2')}>{player2Name} gewinnt</button>
          {#if currentSelectedGame.points > 1} <!-- Unentschieden nur sinnvoll, wenn Punkte nicht zwingend vergeben werden -->
            <button class="action-btn draw-btn" on:click={() => awardPoints('draw')}>Unentschieden</button>
          {/if}
        </div>
      </section>
    {/if}
  </main>
</div>

<style>
  :global(body) { /* Stellt sicher, dass der Body keinen unerwünschten Margin hat */
    margin: 0;
    font-family: 'Arial', sans-serif; /* Fallback Schriftart */
  }

  /* Import einer coolen Schriftart, z.B. Bebas Neue oder Anton für Überschriften */
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Open+Sans:wght@400;700&display=swap');

  .main-game-bg {
    min-height: 100vh;
    /* Dunkler, dynamischer Hintergrund - ähnlich dem Intro-Farbverlauf, aber subtiler */
    background: linear-gradient(145deg, #1a1a1d 0%, #2b2b30 40%, #c08401 150%);
    /* Oder ein radialer Schein: */
    /* background: radial-gradient(ellipse at 50% -20%, #f7c94833 0%, #1a1a1d 60%); */
    background-color: #1a1a1d; /* Fallback */
    background-size: 150% 150%;
    animation: gradientMoveBG 15s ease-in-out infinite alternate;
    padding: 2rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s ease-out, transform 0.5s ease-out;
  }

  .main-game-bg.loaded {
    opacity: 1;
    transform: translateY(0);
  }

  @keyframes gradientMoveBG {
    0% { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
  }

  .game-header {
    display: flex;
    align-items: center;
    justify-content: center; /* Zentriert, wenn Titel daneben ist */
    gap: 1.5rem;
    width: 100%;
    max-width: 900px;
    margin-bottom: 1rem;
    text-align: center;
    flex-wrap: wrap; /* Falls der Platz eng wird */
  }

  .header-logo {
    height: clamp(150px, 10vw, 150px); /* Responsive Höhe */
    filter: drop-shadow(0 0 10px #ffe066aa); /* Leichter Glow wie im Intro */
  }

  .header-title-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .main-title {
    font-family: 'Bebas Neue', 'Impact', sans-serif; /* Plakative Schrift */
    font-size: clamp(2.5rem, 10vw, 4rem);
    color: #ffe066;
    text-shadow: 0 0 5px #000, 0 0 10px #000, 2px 2px 2px #222;
    margin: 0;
    letter-spacing: 0.1em;
  }

  .round-info {
    font-family: 'Open Sans', sans-serif;
    color: #fffbe6;
    font-size: clamp(0.9rem, 2vw, 1.2rem);
    background-color: rgba(0,0,0,0.3);
    padding: 0.2em 0.8em;
    border-radius: 0.5em;
    margin-top: 0.5rem;
  }

  .game-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    max-width: 700px; /* Begrenzt die Breite der Panels */
  }

  .panel {
    background-color: rgba(40, 40, 45, 0.8); /* Dunkel, leicht transparent */
    border: 1px solid #ffe06666; /* Subtiler goldener Rand */
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3), inset 0 0 10px rgba(255, 224, 102, 0.1); /* Tiefe und innerer Schein */
    color: #fffbe6;
    font-family: 'Open Sans', sans-serif;
    opacity: 0;
    transform: scale(0.95);
    animation: panelFadeIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }
  /* Animation Delays für gestaffeltes Erscheinen */
  .main-game-bg.loaded .scoreboard-section { animation-delay: 0.2s; }
  .main-game-bg.loaded .game-announcement-section { animation-delay: 0.4s; }
  .main-game-bg.loaded .current-game-details-section { animation-delay: 0.6s; }


  @keyframes panelFadeIn {
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .panel h2, .panel h3 {
    font-family: 'Bebas Neue', 'Impact', sans-serif;
    color: #ffe066;
    text-align: center;
    margin-top: 0;
    margin-bottom: 1rem;
    letter-spacing: 0.05em;
  }
  .panel h3 { font-size: 1.8rem; }


  .scoreboard-section {
    display: flex;
    justify-content: space-around;
    align-items: center;
    font-size: 1.5rem;
  }
  .player-score {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  .player-name {
    font-size: 0.9em;
    color: #ccc;
  }
  .score {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2.5em;
    color: #ffe066;
    line-height: 1;
  }
  .vs {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2em;
    color: #f7c948;
  }

  .game-announcement-section, .current-game-details-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  /* Styling für die Flip-Karte (aus deinem vorherigen Beispiel angepasst) */
  .game-card-container {
    width: 220px;
    height: 140px;
    perspective: 1000px;
    cursor: pointer;
    margin-bottom: 1rem; /* Platz zum Button darunter */
  }

  .game-card {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.8s cubic-bezier(.68,-0.55,.27,1.55);
    border-radius: 10px; /* Abrundung für die Karte selbst */
    box-shadow: 0 5px 20px rgba(0,0,0,0.4);
  }

  .game-card.flipped {
    transform: rotateY(180deg);
  }

  .card-face {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 10px; /* Abrundung für die Flächen */
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.8em;
    color: #1a1a1d; /* Dunkler Text für Kontrast */
    padding: 0.5em;
    text-align: center;
    line-height: 1.2;
  }

  .card-front {
    background: linear-gradient(135deg, #ffe066, #f7c948); /* Goldener Verlauf */
  }

  .card-back {
    background: linear-gradient(135deg, #f0f0f0, #e0e0e0); /* Helle Rückseite */
    transform: rotateY(180deg);
  }


  .action-btn {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.4rem;
    padding: 0.8rem 2rem;
    background: #ffe066;
    color: #222;
    border: none;
    border-radius: 0.8rem; /* Etwas weniger rund als der Start-Button */
    box-shadow: 0 3px 10px rgba(0,0,0,0.3);
    cursor: pointer;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  }
  .action-btn:hover {
    background: #ffd700;
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 5px 15px rgba(0,0,0,0.4);
  }
  .action-btn:active {
    transform: translateY(0px) scale(1);
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
  }
  .reveal-btn { /* Speziell für den Aufdeck-Button, falls er anders sein soll */
    margin-top: 0.5rem;
  }

  .winner-controls {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap; /* Falls Buttons untereinander rutschen sollen */
    justify-content: center;
    margin-top: 1rem;
  }
  .draw-btn {
    background-color: #aaa;
    color: #333;
  }
  .draw-btn:hover {
    background-color: #bbb;
  }

  .rules {
    text-align: center;
    max-width: 80%;
    line-height: 1.6;
    font-size: 0.95rem;
  }
  .points {
    font-size: 1.1rem;
    color: #ffe066;
    margin-top: 0.5rem;
  }

</style>