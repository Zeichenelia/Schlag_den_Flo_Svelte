<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  const dispatch = createEventDispatcher();

  // Pool aus Haushaltsgegenständen
  const itemsPool = [
    'Zahnbürste', 'Handtuch', 'Buch', 'Schlüssel', 'Tasse', 'Kamm', 'Socken', 'Schere', 'Seife', 'Kissen',
    'Lampe', 'Stift', 'Notizblock', 'Brille', 'Löffel', 'Teller', 'Fernbedienung', 'Kerze', 'Messer', 'Gabel',
    'Regenschirm', 'Kleber', 'Spiegel', 'Kabel', 'Taschenlampe', 'Kopfhörer', 'Mütze', 'Schal', 'Tasche', 'Kamera',
    'Uhr', 'Portemonnaie', 'Handschuhe', 'Bettdecke', 'Teekanne', 'Blumentopf', 'Pflanze', 'Küchenrolle', 'Geschirrspüler-Tabs', 'Staubsaugerbeutel',
    'Wasserkocher', 'Mixer', 'Toaster', 'Pfanne', 'Topf', 'Backblech', 'Schüssel', 'Essstäbchen', 'Küchenmesser', 'Pizzaschneider',
    'Schneebesen', 'Reibe', 'Dosenöffner', 'Flaschenöffner', 'Küchenwaage', 'Salzstreuer', 'Pfefferstreuer', 'Zuckerstreuer', 'Teelöffel', 'Kaffeebecher',
    'Geschirrhandtuch', 'Ofenhandschuh', 'Küchenrolle', 'Spülmittel', 'Abtropfgestell', 'Mülleimer', 'Wäschekorb', 'Besen', 'Schaufel', 'Kehrblech',
    'Wischmopp', 'Staubtuch', 'Putzmittel', 'Glasreiniger', 'Lappen', 'Schwamm', 'Badehandtuch', 'Duschgel', 'Shampoo', 'Conditioner',
    'Rasierapparat', 'Zahnpasta', 'Deodorant', 'Parfüm', 'Körperlotion', 'Haargel', 'Haarspray', 'Nagelschneider', 'Pinzette', 'Bürste',
  ];


let usedItems: string[] = [];
let currentItem: string = '';
let timer = 20;
let timerInterval: any = null;
let activePlayer = Math.round(Math.random()); // 0 = Flo, 1 = Kandidat
let playerNames = ['Flo', 'Kandidat'];
let gameEnded = false;
let inputText = '';
let errorMsg = '';
let round = 1;
let showWord = false;
let showAnswerBtns = false;
let lastTimer = timer;
let flipClass = '';
let showIntro = true;

  function startGame() {
    usedItems = [];
    nextItem();
    timer = 20;
    gameEnded = false;
    errorMsg = '';
    inputText = '';
    round = 1;
    showWord = false;
    showAnswerBtns = false;
    showIntro = false;
    timerInterval = setInterval(() => {
      timer--;
      if (timer <= 0) {
        clearInterval(timerInterval);
        // Zeit abgelaufen, Buttons zeigen
        showWord = true;
        showAnswerBtns = true;
      }
    }, 1000);
  }

  function nextItem() {
    // Wähle ein neues Item, das noch nicht benutzt wurde
    const available = itemsPool.filter(item => !usedItems.includes(item));
    if (available.length === 0) {
      endGame();
      return;
    }
    currentItem = available[Math.floor(Math.random() * available.length)];
    usedItems.push(currentItem);
    inputText = '';
    errorMsg = '';
    showWord = false;
    showAnswerBtns = false;
    timer = 20 + 5 * (round - 1);
  }

  function handleCorrect() {
    round++;
    activePlayer = 1 - activePlayer;
    nextItem();
    showWord = false;
    showAnswerBtns = false;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timer--;
      if (timer <= 0) {
        clearInterval(timerInterval);
        // Zeit abgelaufen, Buttons zeigen
        showWord = true;
        showAnswerBtns = true;
      }
    }, 1000);
  }

  function handleWrong() {
    endGame();
  }

  function endGame() {
    clearInterval(timerInterval);
    gameEnded = true;
    showAnswerBtns = false;
    dispatch('sessionEnd', { winner: activePlayer === 0 ? 1 : 0, rounds: round-1 });
  }

onMount(() => {
    // Zeige zuerst das Intro, Spielstart nach Button
    return () => clearInterval(timerInterval);
});

  $: if (timer !== lastTimer) {
    flipClass = 'flip';
    setTimeout(() => { flipClass = ''; }, 500);
    lastTimer = timer;
  }
</script>


{#if showIntro}
  <div class="kofferpacken-intro">
    <h2>Koffer packen – Spielregeln</h2>
    <ul>
      <li>Ihr spielt abwechselnd "Ich packe meinen Koffer" und fügt jeweils einen neuen vorgegebenen Gegenstand hinzu.</li>
      <li>Zu Beginn hat der Teilnehmer 20 Sekunden Zeit, für jeden weiteren Gegenstand kommen 5 Sekunden dazu.</li>
      <li>Das Spiel endet, wenn ein Fehler gemacht wird.</li>
    </ul>
    <button class="start-btn" on:click={startGame}>Spiel starten</button>
  </div>
{:else if !gameEnded}
  <div class="kofferpacken-fullscreen">
    <div class="kofferpacken-active-player">
      <span class="player-label">Aktiver Spieler:</span>
      <span class="player-name">{playerNames[activePlayer]}</span>
    </div>
    <div class="kofferpacken-timer-center">
      {#if !showWord}
        <span class="timer-huge {flipClass}">{timer}</span>
      {:else}
        <!-- Buttons und neuer Gegenstand anzeigen -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2.2rem; width: 100%;">
          <div class="item-big"><b>{currentItem}</b></div>
          <div class="answer-btns">
            <button class="kofferpacken-btn error" on:click={handleWrong}>Falsch</button>
            <button class="kofferpacken-btn" on:click={handleCorrect}>Richtig</button>
          </div>
        </div>
      {/if}
    </div>
    <div class="kofferpacken-btn-row">
      {#if !showWord}
        <button class="kofferpacken-btn main-btn" on:click={() => { showWord = true; showAnswerBtns = true; clearInterval(timerInterval); }}>Wort aufdecken</button>
      {/if}
    </div>
    {#if showWord}
      <!-- Die Anzeige des neuen Gegenstands ist jetzt oben bei den Buttons -->
    {/if}
  </div>
{:else}
  <div class="kofferpacken-end">
    <h2>Spiel beendet!</h2>
    <p>Runden geschafft: <b>{round-1}</b></p>
    <p>Verlierer: <b>{playerNames[activePlayer]}</b></p>
    <button class="kofferpacken-btn" on:click={startGame}>Nochmal spielen</button>
  </div>
{/if}

<style>
:global(body), :global(html) {
  margin: 0;
  padding: 0;
  overflow: hidden !important;
  height: 100vh;
  width: 100vw;
}

.kofferpacken-fullscreen {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: transparent;
  box-sizing: border-box;
  padding-top: 0;
  padding-bottom: clamp(1.5rem, 5vw, 3.5rem);
  padding-left: clamp(1.5rem, 5vw, 3.5rem);
  padding-right: clamp(1.5rem, 5vw, 3.5rem);
  gap: clamp(2rem, 6vw, 4rem);
  margin: 0;
}
.kofferpacken-active-player {
  font-family: 'Bebas Neue', 'Impact', sans-serif;
  font-size: clamp(1.5rem, 4vw, 2.8rem);
  color: #ffe066;
  background: rgba(34,34,34,0.92);
  border-radius: 1.2rem;
  box-shadow: 0 2px 10px #ffe06633;
  padding: 1.1rem 2.2rem;
  margin-bottom: clamp(1.2rem, 3vw, 2.2rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  letter-spacing: 0.07em;
}
.player-label {
  font-size: 1.1em;
  color: #fffbe6;
  margin-bottom: 0.3em;
}
.player-name {
  font-size: 1.3em;
  color: #ffe066;
  font-weight: bold;
  text-shadow: 0 2px 8px #000a, 0 0 2px #ffe06699;
}
.kofferpacken-timer-center {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 30vh;
  margin-bottom: clamp(2rem, 6vw, 4rem);
}
.timer-huge {
  font-family: 'Bebas Neue', 'Impact', sans-serif;
  font-size: clamp(9rem, 32vw, 22rem);
  color: #ffd700;
  font-weight: bold;
  text-align: center;
  letter-spacing: 0.13em;
  background: none;
  -webkit-background-clip: initial;
  -webkit-text-fill-color: initial;
  background-clip: initial;
  text-shadow: 0 2px 12px #ffe066, 0 0 8px #ffd70099;
  padding: 0.1em 0.4em;
  border-radius: 0;
  box-shadow: none;
  transition: color 0.18s;
}
.kofferpacken-btn-row {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  margin-bottom: clamp(2rem, 6vw, 4rem);
}
.main-btn {
  font-size: clamp(2rem, 5vw, 3rem);
  padding: 1.2rem 3.2rem;
  background: linear-gradient(90deg, #ffe066 60%, #fffbe6 100%);
  color: #222;
  border-radius: 1.3rem;
  box-shadow: 0 4px 18px rgba(0,0,0,0.22), 0 1.5px 8px #ffe06655;
  font-family: 'Bebas Neue', sans-serif;
  font-weight: bold;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  transition: background 0.18s, transform 0.13s, box-shadow 0.18s;
  outline: none;
}
.main-btn:hover, .main-btn:focus {
  background: linear-gradient(90deg, #ffd700 60%, #fffbe6 100%);
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 7px 24px rgba(0,0,0,0.28), 0 2px 12px #ffe06677;
}
.item-big {
  font-size: clamp(2rem, 6vw, 3.5rem);
  color: #ffe066;
  margin: 1.2rem 0;
}
.kofferpacken-btn.error {
  background: #ff4d4d;
  color: #fff;
}
.kofferpacken-intro {
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
.kofferpacken-intro h2 {
  color: #ffe066;
  font-size: 2.2rem;
  margin-bottom: 0.7rem;
  margin-top: 0;
  font-family: 'Bebas Neue', 'Impact', sans-serif;
  letter-spacing: 0.09em;
  text-shadow: 0 2px 8px #000a, 0 0 2px #ffe06699;
}
.kofferpacken-intro ul {
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
.kofferpacken-intro li {
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
.kofferpacken-btn {
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
.kofferpacken-btn:hover, .kofferpacken-btn:focus {
  background: #ffd700;
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 7px 24px rgba(0,0,0,0.28), 0 2px 12px #ffe06677;
}
.kofferpacken-end {
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
.answer-btns {
  display: flex;
  gap: 2.2rem;
  margin-top: 2.5rem;
  margin-bottom: 4rem;
  justify-content: center;
}
</style>
