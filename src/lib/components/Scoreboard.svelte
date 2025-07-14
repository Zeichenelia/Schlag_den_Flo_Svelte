<!-- src/lib/components/MainGamePage.svelte (oder wie du es nennen möchtest) -->
<script lang="ts">
  import FlipBoard from '$lib/components/FlipBoard.svelte';
  import Sortieren from '$lib/games/Sortieren.svelte';
  import SortierenSession from './SortierenSession.svelte';
  import MapGame from '$lib/games/MapGame.svelte';
  import { onMount } from 'svelte';

  // Typdefinition für ein Spiel
  type Game = {
    name: string;
    rules: string;
    frontLogo: string;
    id: number;
    points: number;
    component?: string; 
  };

  let player1Name = "Flo";
  let player2Name = "Kandidat";
  let player1Score = 0;
  let player2Score = 0;
  let currentRound = 1;

  // Ursprüngliche Spieleliste ohne Punkte
  let games: Omit<Game, 'id' | 'points'>[] = [
    { name: "Blamieren oder Kassieren", rules: "Quizfragen beantworten.", frontLogo: "/BoK.png" },
    { name: "Jenga", rules: "Turm bauen und abwechselnd Steine ziehen.", frontLogo: "/Jenga.png" },
    { name: "Klackern", rules: "Abwechselndes Klackern: Der Ball darf weder den Boden noch den Körper berühren. Wer den Ball zuerst nicht fängt, verliert.", frontLogo: "/Klackern.png" },
    { name: "Luft anhalten", rules: "Beide Teilnehmer müssen ihren Kopf unter Wasser halten. Wer zuerst auftaucht, verliert.", frontLogo: "/Luftanhalten.png" },
    { name: "Sortieren", rules: "Die Teilnehmer müssen Antworten in eine Liste richtig einsortieren.", frontLogo: "/Sortieren.png", component: 'Sortieren' },
    { name: "Wo ist das?",  rules: "Die Teilnehmer müssen auf einer Weltkarte den richtigen Ort markieren.", frontLogo: "/WoIstDas.png", component: 'MapGame' },
    { name: "Die Flasche", rules: "Die Teilnehmer müssen abwechselnd mit einem Flaschendeckel eine auf dem Kopf stehende Flasche umschnipsen. Der erste, dem dies gelingt, ohne dass der andere es ebenfalls schafft, gewinnt das Spiel.", frontLogo: "/DieFlasche.png" }
    // ... mehr Spiele
  ];

  function shuffle<T>(array: T[]): T[] {
    let m = array.length, t, i;
    while (m) {
      i = Math.floor(Math.random() * m--);
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
    return array;
  }

  // Beim Start mischen und Punkte zuweisen
  let randomizedGames: Game[] = shuffle(games).map((game, idx) => ({
    ...game,
    id: idx + 1,
    points: idx + 1
  }));

  let totalRounds = randomizedGames.length;
  let currentGameIndex = 0;
  let currentSelectedGame: Game =  randomizedGames[currentGameIndex];
    // "Sortieren" immer als erstes Spiel für Debug
  // let currentSelectedGame: Game = {
  //   ...games.find(g => g.name === "Wo ist das?")!,
  //   id: 1,
  //   points: 1
  // } as Game;
  // // Restliche Spiele mischen, aber "Sortieren" bleibt vorn
  // randomizedGames = [
  //   currentSelectedGame,
  //   ...shuffle(games.filter(g => g.name !== "Wo ist das?")).map((game, idx) => ({
  //     ...game,
  //     id: idx + 2,
  //     points: idx + 2
  //   }))
  // ];
  let isCardFlipped = false;
  let showFlipBoard = false;

  function awardPoints(winner: 'player1' | 'player2' | 'draw') {
    if (!currentSelectedGame || !isCardFlipped) return;
    const points = currentSelectedGame.points;
    if (winner === 'player1') {
      player1Score += points;
    } else if (winner === 'player2') {
      player2Score += points;
    }
    prepareNextGame();
  }

  function prepareNextGame() {
    isCardFlipped = false;
    currentGameIndex++;
    if (currentGameIndex < randomizedGames.length) {
      currentSelectedGame = randomizedGames[currentGameIndex];
      currentRound = currentSelectedGame.id;
    } else {
      // Spiel vorbei Logik
      console.log("Spiel vorbei!");
      // Hier könnte man z.B. einen Gewinner-Screen anzeigen
    }
  }

  function handleRevealBtn() {
    showFlipBoard = true;
  }

  function handleFlipEnd() {
    showFlipBoard = false;
    isCardFlipped = true;
  }

  let pageLoaded = false;
  onMount(() => {
    setTimeout(() => {
      pageLoaded = true;
    }, 100);
  });

  function handleMapGameEnd(event: CustomEvent<{ winner: 0 | 1 | -1, wins: number[] }>) {
  const { winner, wins } = event.detail;
  if (winner === 0) {
    awardPoints('player1');
  } else if (winner === 1) {
    awardPoints('player2');
  }
}
</script>

<div class="main-game-bg" class:loaded={pageLoaded}>
  {#if isCardFlipped && currentSelectedGame && currentSelectedGame.component}
    {#if currentSelectedGame.component === 'Sortieren'}
      <SortierenSession
        listen={[
          // Hauptlisten (werden angezeigt)
          {
            label: "Deutsche Bundekanzler von 1960 bis heute",
            items: [
              { name: "Konrad Adenauer", year: 1963 },
              { name: "Ludwig Erhard", year: 1966 },
              { name: "Kurt Georg Kiesinger", year: 1969 },
              { name: "Willy Brandt", year: 1974 },
              { name: "Helmut Schmidt", year: 1982 },
              { name: "Helmut Kohl", year: 1998 },
              { name: "Gerhard Schröder", year: 2005 },
              { name: "Angela Merkel", year: 2021 },
              { name: "Olaf Scholz", year: 2025 },
              { name: "Friedrich Merz", year: 2029 }
            ],
            labelOben:"Alt",
            labelUnten:"Neu"
          },
          {
            label: "Filme nach deutschem Kinostart",
            items: [
              { name: "Top Gun: Maverick", year: 2022 },
              { name: "Parasite", year: 2019 },
              { name: "Ziemlich beste Freunde", year: 2012 },
              { name: "Avatar – Aufbruch nach Pandora", year: 2009 },
              { name: "The Dark Knight", year: 2008 },
              { name: "Herr der Ringe: Die Gefährten", year: 2001 },
              { name: "Forrest Gump", year: 1994 },
              { name: "Jurassic Park", year: 1993 },
              { name: "Zurück in die Zukunft", year: 1985 },
              { name: "Der Pate", year: 1972 }
            ],
            labelOben:"Alt",
            labelUnten:"Neu"
          },
          {
            label: "Berge nach Höhe",
            items: [
              { name: "Mount Everest", year: 8848 },
              { name: "K2", year: 8611 },
              { name: "Aconcagua", year: 6961 },
              { name: "Kilimandscharo", year: 5895 },
              { name: "Mont Blanc", year: 4807 },
              { name: "Mount Fuji", year: 3776 },
              { name: "Zugspitze", year: 2962 },
              { name: "Brocken", year: 1141 },
              { name: "Feldberg", year: 1493 },
              { name: "Ben Nevis", year: 1345 }
            ],
            labelOben:"Tief",
            labelUnten:"Hoch"
          },
          // Zusätzliche Listen für Unentschieden (werden nicht angezeigt, nur intern genutzt)
          {
            label: "Nobelpreisträger für Physik",
            items: [
              { name: "Albert Einstein", year: 1921 },
              { name: "Marie Curie", year: 1903 },
              { name: "Wilhelm Conrad Röntgen", year: 1901 },
              { name: "Max Planck", year: 1918 },
              { name: "Niels Bohr", year: 1922 },
              { name: "Enrico Fermi", year: 1938 },
              { name: "Werner Heisenberg", year: 1932 },
              { name: "Wolfgang Pauli", year: 1945 },
              { name: "Richard Feynman", year: 1965 },
              { name: "Peter Higgs", year: 2013 }
            ],
            labelOben:"Alt",
            labelUnten:"Neu"
          },
          {
            label: "Deutsche Städte nach Einwohnerzahl",
            items: [
              { name: "Berlin", year: 3769000 },
              { name: "Hamburg", year: 1841000 },
              { name: "München", year: 1472000 },
              { name: "Köln", year: 1086000 },
              { name: "Frankfurt am Main", year: 763000 },
              { name: "Stuttgart", year: 635000 },
              { name: "Düsseldorf", year: 620000 },
              { name: "Leipzig", year: 617000 },
              { name: "Dortmund", year: 587000 },
              { name: "Essen", year: 583000 }
            ],
            labelOben:"Weniger",
            labelUnten:"Mehr"
          }
        ]}
        points={currentSelectedGame.points}
        playerNames={[player1Name, player2Name]}
        onSessionEnd={(winner) => {
          if (winner === 0) {
            awardPoints('player1');
          } else if (winner === 1) {
            awardPoints('player2');
          }
        }}
      />
    {:else if currentSelectedGame.component === 'MapGame'}
      <MapGame on:sessionEnd={handleMapGameEnd} />
    {/if}
  {:else}
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

      {#if showFlipBoard}
        <FlipBoard
          frontImg={currentSelectedGame.frontLogo}
          backImg="/logo_intro_back.png"
          sound="/GameSound.mp3"
          on:flipEnd={handleFlipEnd}
        />
      {:else}
        <section class="game-announcement-section panel">
          <h2>Nächstes Spiel</h2>
          {#if !isCardFlipped}
            <button class="action-btn reveal-btn" on:click|stopPropagation={handleRevealBtn}>Spiel aufdecken!</button>
          {/if}
        </section>
      {/if}

      {#if isCardFlipped && currentSelectedGame && !currentSelectedGame.component}
        <!-- Standardanzeige für andere Spiele -->
        <section class="current-game-details-section panel">
          <h3>{currentSelectedGame.name}</h3>
          <p class="rules">{currentSelectedGame.rules}</p>
          <p class="points"><strong>Punkte für dieses Spiel: {currentSelectedGame.points}</strong></p>
          <div class="winner-controls">
            <button class="action-btn" on:click={() => awardPoints('player1')}>{player1Name} gewinnt</button>
            <button class="action-btn" on:click={() => awardPoints('player2')}>{player2Name} gewinnt</button>
          </div>
        </section>
      {/if}
    </main>
  {/if}
</div>

<style>
  /* Import einer coolen Schriftart, z.B. Bebas Neue oder Anton für Überschriften */
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Open+Sans:wght@400;700&display=swap');

  :global(body) { /* Stellt sicher, dass der Body keinen unerwünschten Margin hat */
    margin: 0;
    font-family: 'Arial', sans-serif; /* Fallback Schriftart */
  }

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