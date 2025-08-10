<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  
  // import time functions if needed, e.g.:
  // import { sleep, wait } from './time'; // <-- adjust path and functions as needed

  export let revealSpeed = 50; // ms pro Schritt (für Blur/Klassisch)
  export let tileSpeed = 150; // ms pro Kachel (nur Kachel-Modus)
  export let playerNames: string[] = [];
  export let mode: number = 0; // Initialwert, wird pro Session gesetzt

  // Punktezählung für Gesichter
  let playerScores = [0, 0];
  let currentImageIdx = 0;
  let gameOver = false;
  let revealFinished = false;
  let imagesLeft: string[] = [];
  let modesLeft: number[] = [];

  const dispatch = createEventDispatcher();

  let revealProgress = 0; // 0..100
  let interval: any = null;
  let paused = false;

  // Steuert, ob die Spielregeln angezeigt werden
  let gameStarted = false;

  // Startet das Spiel erst nach Klick auf Weiter im Intro
  function startGesichterGame() {
    gameStarted = true;
    setTimeout(() => startReveal(), 0);
  }

  // Canvas für Twirl-Effekt
  let canvasEl: HTMLCanvasElement;
  let canvasUrl = '';
  let imgObj = new window.Image();
  imgObj.crossOrigin = 'anonymous';

  // Optionaler y-Offset für jedes Bild (gleiche Reihenfolge wie images)
  // Wert in Prozent des Bildes, z.B. 0.15 = 15% nach unten verschieben
  const imageYOffset = [
    0,    // Merkel
    0,    // Schumacher
    0,    // Mercury
    0,    // Klitschko
    0,    // Papaplatte
    0,    // Schweinsteiger
    0,    // Mikkelsen
    0,    // Kraetschmer
    0,    // Infantino
    0,    // Hawk
    -0.15,    // Lara
    -0.075,    // Barth
    0,    // Selenskyj
    -0.075, // Greta
    0,    // Otto
    0,    // Kennedy
    0,    // Wiedersich
  ];

  // Hilfsfunktion: Hole Index des aktuellen Bildes aus images
  // Liefert den Index des aktuellen Bildes im Original-Array
  function getImageIndex() {
    return images.indexOf(imagesLeft[currentImageIdx]);
  }

  function drawTwirl(img: HTMLImageElement, progress: number) {
    const canvas = canvasEl;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    // Twirl-Parameter
    const maxTwirl = Math.PI * 4; // maximaler Drehwinkel
    const twirl = maxTwirl * (1 - progress / 100);
    // Bilddaten holen
    // Pixelmanipulation
    const src = document.createElement('canvas');
    src.width = w;
    src.height = h;
    // Bild als "cover" mittig zeichnen
    const imgRatio = img.width / img.height;
    const canvasRatio = w / h;
    let sx = 0, sy = 0, sw = img.width, sh = img.height;
    const yOffset = imageYOffset[getImageIndex()] ?? 0;
    if (imgRatio > canvasRatio) {
      // Bild ist breiter als Canvas, schneide Seiten ab
      sw = img.height * canvasRatio;
      sx = (img.width - sw) / 2;
    } else {
      // Bild ist höher als Canvas, schneide oben/unten ab
      sh = img.width / canvasRatio;
      sy = (img.height - sh) / 2 + sh * yOffset;
      // Begrenze sy, damit es nicht aus dem Bild läuft
      sy = Math.max(0, Math.min(sy, img.height - sh));
    }
    src.getContext('2d')?.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    const srcData = src.getContext('2d')?.getImageData(0, 0, w, h);
    if (!srcData) return;
    const dstData = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        // Mittelpunkt als Ursprung
        const dx = x - w/2;
        const dy = y - h/2;
        const r = Math.sqrt(dx*dx + dy*dy);
        const theta = Math.atan2(dy, dx);
        // Twirl: Drehwinkel abhängig vom Radius
        const twirlAmount = twirl * (1 - r / (w/2));
        const srcTheta = theta + twirlAmount;
        const srcX = Math.round(w/2 + r * Math.cos(srcTheta));
        const srcY = Math.round(h/2 + r * Math.sin(srcTheta));
        if (srcX >= 0 && srcX < w && srcY >= 0 && srcY < h) {
          const dstIdx = (y * w + x) * 4;
          const srcIdx = (srcY * w + srcX) * 4;
          dstData.data[dstIdx] = srcData.data[srcIdx];
          dstData.data[dstIdx+1] = srcData.data[srcIdx+1];
          dstData.data[dstIdx+2] = srcData.data[srcIdx+2];
          dstData.data[dstIdx+3] = srcData.data[srcIdx+3];
        }
      }
    }
    ctx.putImageData(dstData, 0, 0);
    canvasUrl = canvas.toDataURL();
  }

  // Für Tastatursteuerung
  function handleKeydown(event: KeyboardEvent) {
    if (event.code === 'Space') {
      event.preventDefault();
      paused = !paused;
    }
  }

onMount(() => {
    revealProgress = 0;
    revealedTiles = Array(gridSize * gridSize).fill(false);
    if (imagesLeft.length === 0) {
      imagesLeft = [...images];
      // Modus-Liste: gleich viele von jedem Modus, dann mischen
      modesLeft = [];
      const n = imagesLeft.length;
      const baseCount = Math.floor(n / 3);
      const rest = n % 3;
      for (let i = 0; i < baseCount; i++) modesLeft.push(0, 1, 2);
      for (let i = 0; i < rest; i++) modesLeft.push(i); // Rest auffüllen
      // Mischen
      for (let i = modesLeft.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [modesLeft[i], modesLeft[j]] = [modesLeft[j], modesLeft[i]];
      }
      currentImageIdx = Math.floor(Math.random() * imagesLeft.length);
      mode = modesLeft[currentImageIdx];
    }
    window.addEventListener('keydown', handleKeydown);
    // Kein automatischer Reveal beim Mount! StartReveal wird erst nach Klick auf Start-Button ausgeführt
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      clearInterval(interval);
    };
  });

  // Für Kachel-Modus
  const gridSize = 6; // 6x6 = 36 Kacheln
  let revealedTiles: boolean[] = Array(gridSize * gridSize).fill(false);
  let tileOrder: number[] = [];

  function startReveal() {
    paused = false;
    revealFinished = false;
    revealedTiles = Array(gridSize * gridSize).fill(false);
    if (mode === 1) {
      console.log('Kachel-Modus gestartet', imagesLeft[currentImageIdx]);
      // Priorisierte Reihenfolge: Mitte zuerst, dann nach außen
      const centerX = (gridSize - 1) / 2;
      const centerY = (gridSize - 1) / 2;
      tileOrder = Array.from({length: gridSize * gridSize}, (_, i) => i)
        .map(idx => {
          const x = idx % gridSize;
          const y = Math.floor(idx / gridSize);
          const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          return { idx, dist };
        })
        .sort((a, b) => b.dist - a.dist)
        .map(obj => obj.idx);
      let tileIdx = 0;
      interval = setInterval(() => {
        if (!paused && tileIdx < tileOrder.length) {
          revealedTiles[tileOrder[tileIdx]] = true;
          tileIdx++;
        }
        if (tileIdx >= tileOrder.length) {
          clearInterval(interval);
          setTimeout(() => {
            revealFinished = true;
          }, 3000);
        }
      }, tileSpeed);
    } else {
      // Blur-Modus: Canvas vorbereiten
      setTimeout(() => {
        imgObj.src = imagesLeft[currentImageIdx];
        imgObj.onload = () => {
          if (canvasEl) drawTwirl(imgObj, revealProgress);
        };
      }, 0);
      interval = setInterval(() => {
        if (!paused && revealProgress < 100) {
          revealProgress += 1;
          if (canvasEl) drawTwirl(imgObj, revealProgress);
        }
        if (revealProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            revealFinished = true;
          }, 3000);
        }
      }, revealSpeed);
    }
  }

  function pauseReveal() {
    paused = true;
  }

  function continueReveal() {
    paused = false;
  }

  function resetReveal() {
    revealProgress = 0;
    clearInterval(interval);
    if (mode === 1) {
      revealedTiles = Array(gridSize * gridSize).fill(false);
    }
    startReveal();
  }

  function handleAward(playerIdx: number) {
    playerScores[playerIdx]++;
    if (playerScores[playerIdx] >= 7) {
      gameOver = true;
      return;
    }
    paused = false;
    nextRound();
  }

function nextRound() {
    revealProgress = 0;
    revealedTiles = Array(gridSize * gridSize).fill(false);
    imagesLeft.splice(currentImageIdx, 1);
    modesLeft.splice(currentImageIdx, 1);
    if (imagesLeft.length === 0) {
      gameOver = true;
      return;
    }
    // Wähle ein neues Bild zufällig aus den verbleibenden
    currentImageIdx = Math.floor(Math.random() * imagesLeft.length);
    mode = modesLeft[currentImageIdx];
    setTimeout(() => startReveal(), 0);
  }

  // Liste der Bilder
  const images = [
    '/gesichter/merkel.png',
    '/gesichter/schumacher.png',
    '/gesichter/mercury.png',
    '/gesichter/klitschko.png',
    '/gesichter/papaplatte.png',
    '/gesichter/schweinsteiger.png',
    '/gesichter/mikkelsen.png',
    '/gesichter/Kraetschmer.png',
    '/gesichter/infantino.png',
    '/gesichter/Hawk.png',
    '/gesichter/Lara.png',
    '/gesichter/Barth.png',
    '/gesichter/zelensky.png',
    '/gesichter/greta.png',
    '/gesichter/Otto.png',
    '/gesichter/kennedy.png', 
    '/gesichter/Wiedersich.png',
  ];

  // Namen passend zu den Bildern (gleiche Reihenfolge wie images)
  const gesichterNames = [
    'Angela Merkel',
    'Ralf Schumacher',
    'Freddie Mercury',
    'Wladimir Klitschko',
    'Kevin Teller aka Papaplatte',
    'Bastian Schweinsteiger',
    'Mads Mikkelsen',
    'Simon Kraetschmer',
    'Gianni Infantino',
    'Tony Hawk',
    'Lara Croft',
    'Mario Barth',
    'Wolodymyr Selenskyj',
    'Greta Thunberg',
    'Otto Waalkes',
    'John F. Kennedy',
    'Florian Wiederlich', 
  ];

  // Handler für das Spielende
  function handleEndGame() {
    let winnerIdx = -1;
    if (playerScores[0] > playerScores[1]) winnerIdx = 0;
    else if (playerScores[1] > playerScores[0]) winnerIdx = 1;
    dispatch('sessionEnd', { winner: winnerIdx });
  }

</script>

  {#if !gameStarted}
    <div class="gesichter-intro">
      <h2>Gesichter – Spielregeln</h2>
      <ul>
        <li>Es werden Bilder von bekannten Persönlichkeiten langsam aufgedeckt.</li>
        <li>Wer zuerst das Gesicht erkennt, drückt den Buzzer und nennt den Namen.</li>
        <li>Richtig: Punkt für den Spieler. Falsch: Punkt für den Gegner.</li>
        <li>Wer zuerst 7 Punkte hat, gewinnt das Spiel.</li>
      </ul>
      <button class="start-btn" on:click={startGesichterGame}>Spiel starten</button>
    </div>
  {:else}
    <div class="image-container-big">
      {#if mode === 0}
        {@html `<script>console.log('MODUS: Blur', '${imagesLeft[currentImageIdx]}')</script>`}
        <!-- Blur-Modus mit Twirl-Effekt -->
        <canvas bind:this={canvasEl} width={800} height={800} class="face-image" style="width:100%;height:100%;border-radius:2rem;user-select:none;"></canvas>
      {:else if mode === 1}
        {@html `<script>console.log('MODUS: Kachel', '${imagesLeft[currentImageIdx]}')</script>`}
        <!-- Kachel-Modus -->
        <div class="tile-grid">
          {#each Array(gridSize * gridSize) as _, idx}
            <div
              class="tile"
              style="
                width: {100/gridSize}%;
                height: {100/gridSize}%;
                position: absolute;
                left: {(idx % gridSize) * (100/gridSize)}%;
                top: {Math.floor(idx / gridSize) * (100/gridSize)}%;
                overflow: hidden;
              "
            >
              {#if revealedTiles[idx]}
                <div
                  class="tile-image-bg"
                  style="
                    background-image: url('{imagesLeft[currentImageIdx]}');
                    background-size: {gridSize * 100}% {gridSize * 100}%;
                    background-position: {((idx % gridSize) * 100 / (gridSize - 1))}% {((Math.floor(idx / gridSize) + (imageYOffset[getImageIndex()] ?? 0) * (gridSize - 1)) * 100 / (gridSize - 1))}%;
                    width: 100%;
                    height: 100%;
                  "
                ></div>
              {:else}
                <div class="tile-cover"></div>
              {/if}
            </div>
          {/each}
        </div>
      {:else}
        {@html `<script>console.log('MODUS: Klassisch', '${imagesLeft[currentImageIdx]}')</script>`}
        <!-- Klassisch -->
        <img src={imagesLeft[currentImageIdx]} alt="Gesicht" class="face-image" draggable="false"
          style="clip-path: inset(0 {100-revealProgress}% 0 0); transition: clip-path 0.1s; object-position: center {imageYOffset[getImageIndex()] * 100}%;" />
      {/if}
      <div class="reveal-bar">
        <div class="progress" style="width: {mode === 1 ? (revealedTiles.filter(Boolean).length / revealedTiles.length * 100) : revealProgress}%"></div>
      </div>
      <!-- Punkteanzeige unten in den Ecken -->
      <div class="score-corner score-corner-left">{playerNames[0]}: {playerScores[0]}</div>
      <div class="score-corner score-corner-right">{playerNames[1]}: {playerScores[1]}</div>
      {#if revealFinished}
        <div class="name-banner">
          {gesichterNames[getImageIndex()]}
        </div>
      {/if}
  }
    </div>
    <!-- Controls entfernt, Neustart-Button nicht mehr vorhanden -->
    {#if revealFinished && !gameOver}
      <div class="award-buttons">
        <button class="buzzer-btn" on:click={() => handleAward(0)}>{playerNames[0]}</button>
        <button class="buzzer-btn" on:click={() => handleAward(1)}>{playerNames[1]}</button>
        <button class="buzzer-btn" on:click={nextRound}>Weiter ohne Punkt</button>
      </div>
    {/if}
    {#if gameOver}
      <div class="overlay">
        <h2>Spiel beendet!</h2>
        <p>
          {#if playerScores[0] > playerScores[1]}
            Gewinner: {playerNames[0]}
          {:else if playerScores[1] > playerScores[0]}
            Gewinner: {playerNames[1]}
          {:else}
            Unentschieden
          {/if}
        </p>
        <button class="big-next-btn" on:click={handleEndGame}>Weiter</button>
      </div>
    {/if}
  {/if}

<style>
/* Banner für den Namen der Person */
.name-banner {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  background: rgba(40,40,45,0.92);
  color: #ffe066;
  font-size: 2rem;
  font-family: 'Bebas Neue', sans-serif;
  padding: 0.7em 2em;
  border-radius: 1.2em 1.2em 0 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  z-index: 20;
  letter-spacing: 0.04em;
  text-align: center;
}
.image-container-big {
  position: relative;
  width: min(90vw, 80vh);
  height: min(90vw, 80vh);
  background: #222;
  border-radius: 2rem;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.score-corner {
  position: absolute;
  bottom: 18px;
  font-size: 1.5rem;
  color: #ffe066;
  background: rgba(40,40,45,0.8);
  padding: 0.5em 1em;
  border-radius: 1em;
  font-family: 'Bebas Neue', sans-serif;
  z-index: 10;
}
.score-corner-left {
  left: 18px;
}
.score-corner-right {
  right: 18px;
}
.face-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 2rem;
  user-select: none;
}
.tile-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.tile {
  box-sizing: border-box;
}
.tile-image-bg {
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
}
.tile-cover {
  width: 100%;
  height: 100%;
  background: #222;
}
.reveal-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 16px;
  background: #444;
  border-radius: 0 0 2rem 2rem;
}
.progress {
  height: 100%;
  background: #ffe066;
  border-radius: 0 0 2rem 2rem;
  transition: width 0.1s;
}

.award-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: center;
}
.buzzer-btn {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.2rem;
  padding: 0.7rem 1.5rem;
  background: #ffe066;
  color: #222;
  border: none;
  border-radius: 0.8rem;
  box-shadow: 0 3px 10px rgba(0,0,0,0.3);
  cursor: pointer;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
}
.buzzer-btn:hover {
  background: #ffd700;
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 5px 15px rgba(0,0,0,0.4);
}
.buzzer-btn:active {
  transform: translateY(0px) scale(1);
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}
.overlay {
  position: fixed;
  left: 50%;
  top: 55%;
  transform: translate(-50%,0);
  z-index: 100;
  min-width: 280px;
  max-width: 95vw;
  background: #ffe066;
  color: #222;
  padding: 2rem 2.5rem;
  border-radius: 1.5rem;
  font-family: 'Bebas Neue', sans-serif;
  box-shadow: 0 4px 15px rgba(0,0,0,0.25);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.overlay h2 {
  font-size: 3rem;
  margin-bottom: 1.2rem;
  color: #c08401;
  text-shadow: 0 2px 8px #fffbe6;
}
.overlay p {
  font-size: 2.2rem;
  font-weight: bold;
  color: #222;
  margin-bottom: 1.5rem;
}
.big-next-btn {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2rem;
  padding: 1.2em 3em;
  margin-top: 2rem;
  background: #222;
  color: #ffe066;
  border: none;
  border-radius: 0.8rem;
  box-shadow: 0 3px 10px rgba(0,0,0,0.3);
  cursor: pointer;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  width: clamp(220px, 40vw, 400px);
}
.big-next-btn:hover {
  background: #c08401;
  color: #fffbe6;
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 5px 15px rgba(0,0,0,0.4);
}
.big-next-btn:active {
  transform: translateY(0px) scale(1);
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}

/* Neue Styles für die Spielregeln-Intro */
.gesichter-intro {
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
.gesichter-intro h2 {
  color: #ffe066;
  font-size: 2.2rem;
  margin-bottom: 0.7rem;
  margin-top: 0;
  font-family: 'Bebas Neue', 'Impact', sans-serif;
  letter-spacing: 0.09em;
  text-shadow: 0 2px 8px #000a, 0 0 2px #ffe06699;
}
.gesichter-intro ul {
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
.gesichter-intro li {
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
</style>
