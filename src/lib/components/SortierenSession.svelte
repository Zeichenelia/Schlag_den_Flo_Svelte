<script lang="ts">
  import Sortieren from '$lib/games/Sortieren.svelte';
  type SortierListe = {
    label: string;
    items: { name: string; year: number }[];
    labelOben: string;
    labelUnten: string;
  };
  export let listen: SortierListe[];
  export let playerNames: string[] = ["Flo", "Kandidat"];
  export let points: number;
  export let onSessionEnd: (winner: 0 | 1) => void;


let showIntro = true;
let round = 0;
let wins = [0, 0]; // [player1, player2]
let showSortieren = true;
let roundNumber = 0; // Aktuelle Runde, wird für UI verwendet
function handleGameEnd(event: CustomEvent<{ winner: 0 | 1 | -1 }>) {
  if (event.detail.winner === 0) {
    wins[0]++;
    roundNumber++;
  } else if (event.detail.winner === 1) {
    wins[1]++;
    roundNumber++;
  } else if (event.detail.winner === -1) {
    // Unentschieden: keine Punkte vergeben
  }
  if (wins[0] === 2 || wins[1] === 2) {
    showSortieren = false;
    setTimeout(() => {
      onSessionEnd?.(wins[0] === 2 ? 0 : 1);
    }, 500); // Kurze Pause für UI
    return;
  }
  round++;
}
function handleStartGame() {
  showIntro = false;
}
</script>

{#if showIntro}
  <div class="sortieren-intro">
    <h2>Sortieren – Spielregeln</h2>
    <ul>
      <li>Ihr spielt Best-of-3: Wer zuerst 2 Runden gewinnt, holt die Punkte.</li>
      <li>In jeder Runde müsst ihr eine gegebene Liste korrekt in eine Reihenfolge anhand eines Referenzbeispiels einsortieren.</li>
      <li>Wer falsch einsortiert, verliert eins von drei Leben. Wer keine Leben mehr hat, verliert die Runde.</li>
      <li>Die Achsen-Beschriftungen zeigen, wie sortiert werden soll.</li>
      <li>Bei Unentschieden gibt es keine Punkte.</li>
    </ul>
    <button class="start-btn" on:click={handleStartGame}>Spiel starten</button>
  </div>
{:else if showSortieren}
  <Sortieren
    items={listen[round].items}
    label={listen[round].label}
    labelOben={listen[round].labelOben}
    labelUnten={listen[round].labelUnten}
    playerNames={playerNames}
    on:gameEnd={handleGameEnd}
  />
  <div class="sortieren-session-info-bottom">
    <div>Runde {roundNumber + 1} von 3 &ndash; Best of 3</div>
    <div>{playerNames[0]}: {wins[0]} &nbsp;|&nbsp; {playerNames[1]}: {wins[1]}</div>
  </div>
{/if}

<style>
.sortieren-session-info-bottom {
  position: fixed;
  left: 50%;
  bottom: 2.5vh;
  transform: translateX(-50%);
  background: rgba(34,34,34,0.97);
  color: #ffe066;
  font-size: 1.1rem;
  font-weight: bold;
  letter-spacing: 0.03em;
  border-radius: 1rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  padding: 1.1rem 2.2rem 1.1rem 2.2rem;
  z-index: 30;
  text-align: center;
  min-width: 260px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}
.sortieren-intro {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #23232a 60%, #ffe06622 100%);
  color: #ffe066;
  font-size: 1.18rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  border-radius: 1.3rem;
  box-shadow: 0 8px 32px 0 rgba(0,0,0,0.45), 0 1.5px 8px #ffe06633;
  padding: 2.5rem 2.8rem 2.2rem 2.8rem;
  z-index: 40;
  min-width: 340px;
  max-width: 95vw;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  border: 1.5px solid #ffe06655;
  backdrop-filter: blur(2.5px);
  animation: fadeInIntro 0.7s cubic-bezier(.4,1.4,.6,1) 1;
}
@keyframes fadeInIntro {
  from { opacity: 0; transform: translate(-50%, -60%) scale(0.97); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
.sortieren-intro h2 {
  color: #ffe066;
  font-size: 2.2rem;
  margin-bottom: 0.7rem;
  margin-top: 0;
  font-family: 'Bebas Neue', 'Impact', sans-serif;
  letter-spacing: 0.09em;
  text-shadow: 0 2px 8px #000a, 0 0 2px #ffe06699;
}
.sortieren-intro ul {
  text-align: left;
  color: #fffbe6;
  font-size: 1.13rem;
  font-weight: 400;
  margin: 0 0 1.2rem 0;
  padding-left: 1.2em;
  list-style: disc inside;
  max-width: 440px;
  background: rgba(255,224,102,0.06);
  border-radius: 0.7em;
  box-shadow: 0 1px 6px #ffe06611;
  padding: 1.1em 1.2em 1.1em 1.5em;
}
.sortieren-intro li {
  margin-bottom: 0.55em;
  line-height: 1.5;
  letter-spacing: 0.01em;
}
.start-btn {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.5rem;
  padding: 1.1rem 2.7rem;
  background: linear-gradient(90deg, #ffe066 60%, #fffbe6 100%);
  color: #222;
  border: none;
  border-radius: 1.1rem;
  box-shadow: 0 3px 18px rgba(0,0,0,0.22), 0 1.5px 8px #ffe06655;
  cursor: pointer;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  font-weight: bold;
  transition: background 0.18s, transform 0.13s, box-shadow 0.18s;
  margin-top: 1.2rem;
  outline: none;
}
.start-btn:hover, .start-btn:focus {
  background: linear-gradient(90deg, #ffd700 60%, #fffbe6 100%);
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 7px 24px rgba(0,0,0,0.28), 0 2px 12px #ffe06677;
}
</style>