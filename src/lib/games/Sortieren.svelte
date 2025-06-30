<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

    export let items: { name: string; year: number }[];
    export let label: string;
    export let playerNames: string[];


  // Referenzkanzler und zu sortierende Liste werden jetzt zufällig gewählt
  function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }


  // Initialwerte für das Spiel (werden bei items-Änderung neu gesetzt)
  let refIndex: number;
  let sortedList: { name: string; year: number }[] = [];
  let toPlace: { name: string; year: number }[] = [];
  let allPlaced = false;
  let currentPlayer: number;
  let playerLives: [number, number] = [3, 3];
  let gameOver = false;

  // Merkt sich, wer zuletzt angefangen hat (1 oder 2)
  let lastStartingPlayer: number | null = null;

  // Nur neu initialisieren, wenn sich die items-Referenz wirklich ändert
  let prevItems: typeof items | null = null;
  $: if (items !== prevItems) {
    prevItems = items;
    refIndex = getRandomInt(items.length);
    sortedList = [items[refIndex]];
    toPlace = items.filter((_, i) => i !== refIndex).sort(() => Math.random() - 0.5);
    allPlaced = false;
    // Wenn currentPlayer gesetzt ist (z.B. von außen), dann: beim ersten Mal random, danach abwechselnd
    if (typeof currentPlayer === 'undefined' || currentPlayer === null) {
      if (lastStartingPlayer === null) {
        currentPlayer = getRandomInt(2) + 1;
      } else {
        currentPlayer = lastStartingPlayer === 1 ? 2 : 1;
      }
    }
    lastStartingPlayer = currentPlayer;
    playerLives = [3, 3];
    gameOver = false;
    // Drag & Drop Status zurücksetzen
    draggedIndex = null;
    dragOverIndex = null;
    lastPlacedIdx = null;
    lastPlacedCorrect = null;
  }

  // Drag & Drop

  let draggedIndex: number | null = null;
  let dragOverIndex: number | null = null;
  let lastPlacedIdx: number | null = null; // Index im sortedList, wo zuletzt einsortiert wurde
  let lastPlacedCorrect: boolean | null = null; // true = richtig, false = falsch

  function handleDragStart(idx: number) {
    draggedIndex = idx;
  }
function handleDrop(idx: number) {
    if (draggedIndex === null) return;
    const item = toPlace[draggedIndex];
    // Finde die erlaubten Jahr-Bereiche für die Drop-Position
    let min = -Infinity;
    let max = Infinity;
    if (sortedList.length > 0) {
      if (idx > 0) {
        min = sortedList[idx - 1].year;
      }
      if (idx < sortedList.length) {
        max = sortedList[idx].year;
      }
    }
    // Prüfe, ob die Antwort korrekt ist
    const isCorrect = item.year > min && item.year < max;
    lastPlacedIdx = idx;
    lastPlacedCorrect = isCorrect;
    let revertTimeout: ReturnType<typeof setTimeout>;
    if (isCorrect) {
      sortedList = [
        ...sortedList.slice(0, idx),
        item,
        ...sortedList.slice(idx)
      ];
      toPlace = toPlace.filter((_, i) => i !== draggedIndex);
      if (toPlace.length === 0) {
        allPlaced = true;
      } else {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
      }
      // Feedback nach kurzer Zeit zurücksetzen
      revertTimeout = setTimeout(() => {
        lastPlacedIdx = null;
        lastPlacedCorrect = null;
      }, 900);
    } else {
      // Falsch: temporär einsortieren, dann zurück
      const tempSorted = [
        ...sortedList.slice(0, idx),
        item,
        ...sortedList.slice(idx)
      ];
      sortedList = tempSorted;
      // Leben abziehen
      playerLives[currentPlayer-1] = Math.max(0, playerLives[currentPlayer-1] - 1);
      // Prüfe auf Game Over
      if (playerLives[currentPlayer-1] === 0) {
        gameOver = true;
        // Alle restlichen Einträge einsortieren
        sortedList = [...sortedList, ...toPlace];
        toPlace = [];
        allPlaced = true;
      }
      // Feedback nach kurzer Zeit zurücksetzen und zurückordnen
      revertTimeout = setTimeout(() => {
        if (!gameOver) {
          // Entferne das Item wieder aus sortedList
          sortedList = sortedList.filter((k, i2) => !(i2 === idx && k === item));
        }
        lastPlacedIdx = null;
        lastPlacedCorrect = null;
        if (!gameOver) {
          // Nächster Spieler
          currentPlayer = currentPlayer === 1 ? 2 : 1;
        }
      }, 900);
    }
    // Drag & Drop Status zurücksetzen
    draggedIndex = null;
    dragOverIndex = null;
  }
  function handleDragOver(idx: number) {
    dragOverIndex = idx;
  }
  function handleDragLeave() {
    dragOverIndex = null;
  }
</script>

<div class="sortieren-layout">
  <div class="sortieren-label-side sortieren-label-left">{label}</div>
  <div class="lives lives-left {currentPlayer === 1 ? 'lives-active' : ''}">
    <span class="lives-label">{playerNames[0]}</span>
    {#each Array(3) as _, i}
      <span class="life-icon {playerLives[0] > i ? 'life-full' : 'life-empty'}">♥</span>
    {/each}
  </div>
  <div class="lives lives-right {currentPlayer === 2 ? 'lives-active' : ''}">
    <span class="lives-label">{playerNames[1]}</span>
    {#each Array(3) as _, i}
      <span class="life-icon {playerLives[1] > i ? 'life-full' : 'life-empty'}">♥</span>
    {/each}
  </div>
  <div class="sort-list-vertical responsive-box">
    {#each sortedList as k, i}
      <!-- Dropzone über jedem Eintrag -->
      <div
        class="dropzone-vertical {dragOverIndex === i ? 'active' : ''}"
        role="listitem"
        aria-label="Dropzone"
        on:dragover|preventDefault={() => handleDragOver(i)}
        on:dragleave={handleDragLeave}
        on:drop={() => handleDrop(i)}
      ></div>
      <div class="slot-vertical {lastPlacedIdx === i && lastPlacedCorrect === true ? 'slot-correct' : ''} {lastPlacedIdx === i && lastPlacedCorrect === false ? 'slot-wrong' : ''}">
        {#if k === items[refIndex]}
          {k.name} ({k.year})
        {:else}
          {k.name}
        {/if}
      </div>
    {/each}
    <!-- Dropzone am Ende -->
    <div
      class="dropzone-vertical {dragOverIndex === sortedList.length ? 'active' : ''}"
      role="listitem"
      aria-label="Dropzone"
      on:dragover|preventDefault={() => handleDragOver(sortedList.length)}
      on:dragleave={handleDragLeave}
      on:drop={() => handleDrop(sortedList.length)}
    ></div>
    <div class="alt-label alt-label-top">Alt</div>
    <div class="neu-label">Neu</div>
  </div>
  <div class="to-place-list-vertical responsive-box">
    <div class="to-place-label to-place-label-top">Noch zu sortieren:</div>
    <div class="to-place-list-content">
      {#each toPlace as k, idx}
        <div
          class="to-place-item-vertical"
          draggable="true"
          role="option"
          aria-selected="false"
          tabindex="0"
          on:dragstart={() => handleDragStart(idx)}
        >
          {k.name}
        </div>
      {/each}
    </div>
    <div class="to-place-label to-place-label-bottom">Aktueller Spieler: <b>{playerNames[currentPlayer-1]}</b></div>
  </div>
</div>

{#if allPlaced}
  <div class="game-end-message">
    {#if playerLives[0] === playerLives[1]}
      <p><b>Unentschieden!</b></p>
    {:else if playerLives[0] > playerLives[1]}
      <p><b>{playerNames[0]} gewinnt!</b></p>
    {:else}
      <p><b>{playerNames[1]} gewinnt!</b></p>
    {/if}
    <button on:click={() => dispatch('gameEnd', {
      winner: playerLives[0] === playerLives[1] ? -1 : (playerLives[0] > playerLives[1] ? 0 : 1)
    })}>Weiter</button>
  </div>
{/if}

<style>
.game-end-message {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: rgba(34,34,34,0.97);
  border-radius: 1rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  color: #ffe066;
  text-align: center;
  z-index: 20;
  min-width: 300px;
  font-size: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
}
.game-end-message button {
  margin-top: 1rem;
  font-size: 1.2rem;
  padding: 0.7rem 2.2rem;
  border-radius: 0.7rem;
  background: #ffe066;
  color: #222;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.game-end-message button:hover {
  background: #ffd700;
  color: #111;
}
.lives {
  position: fixed;
  bottom: 2vh;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.3rem;
  z-index: 10;
  filter: none;
  opacity: 0.7;
  transition: filter 0.2s, opacity 0.2s;
}
.lives-active {
  filter: drop-shadow(0 0 8px #ffe066) brightness(1.2);
  opacity: 1;
}
.lives {
  position: fixed;
  bottom: 2vh;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.3rem;
  z-index: 10;
}
.lives-left {
  left: 2vw;
}
.lives-right {
  right: 2vw;
}
.lives-label {
  color: #ffe066;
  font-weight: bold;
  margin-right: 0.5rem;
}
.life-icon {
  font-size: 1.5em;
  color: #ffe066;
  filter: drop-shadow(0 0 2px #222);
  transition: color 0.2s, opacity 0.2s;
}
.life-full {
  color: #e74c3c;
  opacity: 1;
}
.life-empty {
  color: #444;
  opacity: 0.3;
}
.sortieren-layout {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
  gap: 3vw;
  height: 80vh;
  width: 100vw;
  position: fixed;
  left: 0;
  top: 7vh;
}
.responsive-box {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: #222;
  border-radius: 1rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  position: relative;
  justify-content: center;
  min-width: 18vw;
  max-width: 30vw;
  min-height: 50vh;
  max-height: 85vh;
  width: 25vw;
  height: 85vh;
  margin-bottom: 2vh;
  transition: width 0.3s, height 0.3s;
}
.sort-list-vertical,
.to-place-list-vertical {
  height: 100%;
  box-sizing: border-box;
}
.sort-list-vertical {
  padding: 1.5rem 1rem 2.5rem 1rem;
}
.to-place-list-vertical {
  padding: 1.5rem 1rem 2.5rem 1rem;
}
.alt-label {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 0.7rem;
  color: #ffe066;
  font-weight: bold;
  font-size: 1.1rem;
  letter-spacing: 0.1em;
  text-align: center;
}
.neu-label {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0.7rem;
  color: #ffe066;
  font-weight: bold;
  font-size: 1.1rem;
  letter-spacing: 0.1em;
  text-align: center;
}
.slot-vertical {
  background: #ffe066;
  color: #222;
  padding: 0.7rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 0.2rem;
  font-weight: bold;
  border: 2px solid #ffe066;
  box-shadow: 0 2px 8px #ffe06633;
  text-align: center;
  transition: box-shadow 0.2s, background 0.2s, color 0.2s, border 0.2s;
}
.slot-correct {
  background: #4be07b;
  color: #222;
  border: 2px solid #4be07b;
  box-shadow: 0 0 16px 2px #4be07b99;
}
.slot-wrong {
  background: #e74c3c;
  color: #fff;
  border: 2px solid #e74c3c;
  box-shadow: 0 0 16px 2px #e74c3c99;
}
.dropzone-vertical {
  height: 5px;
  background: transparent;
  border: 2px dashed transparent;
  border-radius: 0.5rem;
  margin-bottom: 0.2rem;
  transition: background 0.2s, border 0.2s, height 0.2s;
}
.dropzone-vertical.active {
  background: #ffe06699;
  border: 2px solid #ffe066;
  height: 28px;
}
.to-place-list-vertical {
  display: flex;
  flex-direction: column;
  min-width: 220px;
  background: #222;
  border-radius: 1rem;
  padding: 1.5rem 1rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  position: relative;
  height: 100%;
  box-sizing: border-box;
}
.to-place-label {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  color: #ffe066;
  font-weight: bold;
  font-size: 1.1rem;
  letter-spacing: 0.1em;
  text-align: center;
  z-index: 2;
  pointer-events: none;
}
.to-place-label-top {
  top: 0.7rem;
}
.to-place-label-bottom {
  bottom: 0.7rem;
}
.to-place-list-content {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  flex: 1 1 auto;
  justify-content: center;
  margin-top: 2.2rem;
  margin-bottom: 2.2rem;
}
.to-place-item-vertical {
  background: #ffe066;
  color: #222;
  padding: 0.7rem 1rem;
  border-radius: 0.5rem;
  font-weight: bold;
  border: 2px solid #222;
  cursor: grab;
  user-select: none;
  transition: background 0.2s, color 0.2s;
  text-align: center;
}
.to-place-item-vertical:active {
  background: #ffd700;
  color: #111;
}
.sortieren-label-side {
  position: absolute;
  left: 1vw;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(34,34,34,0.97);
  color: #ffe066;
  font-size: 1.3rem;
  font-weight: bold;
  letter-spacing: 0.03em;
  border-radius: 1rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  padding: 1.1rem 2.2rem;
  z-index: 30;
  min-width: 120px;
  max-width: 18vw;
  max-height: 70vh;
  overflow: auto;
  pointer-events: none;
  white-space: pre-line;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sortieren-label-side span, .sortieren-label-side p, .sortieren-label-side div, .sortieren-label-side {
  text-align: justify;
}
.sortieren-label-side span:last-child, .sortieren-label-side p:last-child, .sortieren-label-side div:last-child {
  text-align: center;
}
</style>