<script lang="ts">
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  // Standard-Emoji-Set (25 verschiedene, einfach zu beschreiben)
  const emojiSet = [
    '🏠','🎡','🐶','🚗','🍎','🌳','📚','🎸','🦄','🍕',
    '🚀','🎲','🧸','🎈','🍦','🦉','🎤','🛴','🦖','🍔',
    '🛸','🎮','🦋','🍩','🐸'
  ];

  // Kartenstruktur
  type Card = {
    id: number;
    emoji: string;
    revealed: boolean;
    guessed: boolean;
  };

  let cards: Card[] = [];
  let showIntro = true;
  let showAll = false;
  let timer = 60;
  let timerInterval: any = null;
  let activePlayer = Math.round(Math.random()); // 0 = Flo, 1 = Kandidat
  let playerNames = ['Flo', 'Kandidat'];
  let scores = [0, 0];
  let selectedCard: Card | null = null;
  let gameEnded = false;

  function startGame() {
    // Karten mischen und zuweisen
    const shuffled = [...emojiSet].sort(() => Math.random() - 0.5);
    cards = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      emoji: shuffled[i],
      revealed: true,
      guessed: false
    }));
    showIntro = false;
    showAll = true;
    timer = 60;
    timerInterval = setInterval(() => {
      timer--;
      if (timer <= 0) {
        clearInterval(timerInterval);
        showAll = false;
        cards = cards.map(card => ({ ...card, revealed: false }));
      }
    }, 1000);
  }

  function selectCard(card: Card) {
    // Prevent selecting another card while one is already selected
    if (selectedCard) return;
    if (!showAll && !card.guessed && !card.revealed) {
      selectedCard = card;
      cards = cards.map(c => c.id === card.id ? { ...c, revealed: true } : c);
    }
  }

  function handleGuess(correct: boolean) {
    if (!selectedCard) return;
    if (correct) {
      scores[activePlayer]++;
      cards = cards.map(c => c.id === selectedCard!.id ? { ...c, guessed: true } : c);
    } else {
      cards = cards.map(c => c.id === selectedCard!.id ? { ...c, revealed: false } : c);
    }
    selectedCard = null;
    // Spieler wechseln
    activePlayer = 1 - activePlayer;
    // Spielende prüfen
    if (cards.every(c => c.guessed)) {
      gameEnded = true;
      let winner = scores[0] > scores[1] ? 0 : 1;
      dispatch('sessionEnd', { winner, scores });
    }
  }
</script>

{#if showIntro}
  <div class="merken-intro">
    <h2>Merken – Spielregeln</h2>
    <ul>
      <li>Ihr spielt auf einem 5x5 Feld mit 25 Karten.</li>
      <li>Jede Karte hat ein individuelles Emoji auf der Rückseite.</li>
      <li>Zu Beginn werden alle Karten für 60 Sekunden aufgedeckt.</li>
      <li>Danach werden die Karten umgedreht und nur die Nummer ist sichtbar.</li>
      <li>Ein zufälliger Spieler beginnt und wählt eine Karte, die der andere erraten soll.</li>
      <li>Richtig: Karte bleibt offen, Punkt für den ratenden Spieler.</li>
      <li>Falsch: Karte bleibt verdeckt.</li>
      <li>Der Spieler mit den meisten Punkten gewinnt.</li>
    </ul>
    <button class="start-btn" on:click={startGame}>Spiel starten</button>
  </div>
{:else}
  <div class="merken-game">
    <div class="merken-header">
      <div>Flo: {scores[0]} | Kandidat: {scores[1]}</div>
      <div>Aktiver Spieler: <b>{playerNames[activePlayer]}</b></div>
    </div>
    <div class="merken-grid">
      {#each cards as card}
        <div
          class="merken-card {card.guessed ? 'guessed' : ''} {card.revealed || showAll ? 'flipped' : ''}"
          on:click={() => selectCard(card)}
          tabindex="0"
          role="button"
          aria-label={`Karte ${card.id}${card.guessed ? ' (erraten)' : ''}`}
          on:keydown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !card.guessed && !card.revealed && !showAll && !selectedCard) {
              selectCard(card);
            }
          }}
        >
          <div class="merken-card-inner">
            <div class="merken-card-front">
              <span class="merken-id">{card.id}</span>
            </div>
            <div class="merken-card-back">
              <span class="merken-emoji">{card.emoji}</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
    {#if selectedCard}
      <div class="merken-guess-box merken-guess-overlay">
        <div>Karte {selectedCard.id}: {selectedCard.emoji}</div>
        <button class="merken-btn" on:click={() => handleGuess(true)}>Richtig geraten</button>
        <button class="merken-btn" on:click={() => handleGuess(false)}>Falsch geraten</button>
      </div>
    {/if}
    {#if gameEnded}
      <div class="merken-end merken-guess-overlay">
        <h2>Spiel beendet!</h2>
        <p>Flo: {scores[0]} | Kandidat: {scores[1]}</p>
        <p>Gewinner: <b>{scores[0] > scores[1] ? 'Flo' : 'Kandidat'}</b></p>
      </div>
    {/if}
  </div>
{/if}

<style>
.merken-intro {
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
.merken-intro h2 {
  color: #ffe066;
  font-size: 2.2rem;
  margin-bottom: 0.7rem;
  margin-top: 0;
  font-family: 'Bebas Neue', 'Impact', sans-serif;
  letter-spacing: 0.09em;
  text-shadow: 0 2px 8px #000a, 0 0 2px #ffe06699;
}
.merken-intro ul {
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
.merken-intro li {
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
@keyframes fadeInIntro {
  from { opacity: 0; transform: translate(-50%, -60%) scale(0.97); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
/* Prevent scrolling, fill viewport */
/* Svelte global selector for body and html to prevent scrolling */
:global(body), :global(html) {
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  overflow: hidden !important;
}
.merken-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0 0 15rem 0; /* bottom padding for button space */
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}
.merken-header {
  font-size: 1.2rem;
  color: #ffe066;
  margin-bottom: 1.2rem; /* more space below score */
  margin-top: 2.5vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  z-index: 2;
  max-width: 95vw;
  box-sizing: border-box;
  padding: 0.5rem 1.2rem 0 1.2rem;
  overflow-wrap: anywhere;
  word-break: break-word;
}
/* Größeres Spielfeld und Flip-Animation */
/* Responsive grid: uses vw/vh units and clamps for mobile/desktop */
/* Responsive grid: uses vw/vh units and clamps for mobile/desktop */
.merken-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  grid-template-rows: repeat(5, minmax(0, 1fr));
  gap: clamp(0.7rem, 2vw, 2rem);
  width: 70vw;
  max-width: 1200px;
  height: min(70vw, 60vh);
  max-height: 60vh;
  margin-bottom: 2.5rem;
  box-sizing: border-box;
}
/* Cards fill grid cell, scale with screen */
.merken-card {
  width: 100%;
  height: 100%;
  aspect-ratio: 1 / 1;
  perspective: 900px;
  cursor: pointer;
  user-select: none;
  border-radius: 1.1rem;
  box-shadow: 0 4px 18px #0003;
  border: 2.5px solid #ffe06655;
  background: none;
  position: relative;
  transition: box-shadow 0.18s, border 0.18s;
  min-width: 40px;
  min-height: 40px;
}
.merken-card.guessed {
  border: 2.5px solid #ffe066;
  box-shadow: 0 8px 32px #ffe06644;
}
.merken-card-inner {
  position: absolute;
  width: 100%;
  height: 100%;
  transition: transform 0.5s cubic-bezier(.4,1.4,.6,1);
  transform-style: preserve-3d;
}
.merken-card.flipped .merken-card-inner {
  transform: rotateY(180deg);
}
.merken-card-front, .merken-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1.1rem;
}
.merken-card-front {
  background: linear-gradient(135deg, #23243a 0%, #1a1b2b 100%);
  color: #fffbe6;
  font-size: 1.6rem;
}
/* Emoji and ID scale with card size */
.merken-card-back {
  background: linear-gradient(90deg, #ffe066 60%, #fffbe6 100%);
  color: #222;
  font-size: clamp(2.2rem, 6vw, 5rem);
  font-weight: bold;
  transform: rotateY(180deg);
  box-shadow: 0 8px 32px #ffe06633;
}
.merken-emoji {
  font-size: clamp(2.2rem, 6vw, 6vh);
}
.merken-id {
  font-size: clamp(1.1rem, 2vw, 2.2rem);
  color: #fffbe6;
}
/* Guess box always visible, never needs scroll */
.merken-guess-box {
  background: rgba(34,34,34,0.97);
  border-radius: 1.2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  padding: 1.2rem 2.2rem;
  color: #ffe066;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  min-width: 320px;
  max-width: 95vw;
  box-sizing: border-box;
}
.merken-guess-overlay {
  position: absolute;
  left: 50%;
  bottom: 4rem;
  transform: translateX(-50%);
  z-index: 10;
}
.merken-btn {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.2rem;
  padding: 0.7rem 2rem;
  background: #ffe066;
  color: #222;
  border: none;
  border-radius: 1.1rem;
  box-shadow: 0 3px 10px rgba(0,0,0,0.22);
  cursor: pointer;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  font-weight: bold;
  transition: background 0.18s, transform 0.13s, box-shadow 0.18s;
  outline: none;
}
.merken-btn:hover, .merken-btn:focus {
  background: #ffd700;
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 7px 24px rgba(0,0,0,0.28), 0 2px 12px #ffe06677;
}
.merken-end {
  margin-top: 2rem;
  background: rgba(34,34,34,0.97);
  border-radius: 1.2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  padding: 2.2rem 2.5rem 2.2rem 2.5rem;
  color: #ffe066;
  min-width: 340px;
  max-width: 95vw;
  text-align: center;
}
</style>
