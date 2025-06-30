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
</script>

{#if showSortieren}
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
</style>