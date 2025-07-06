<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  let showIntro = true;

  function startGame() {
    showIntro = false;
  }

  function endMapGame() {
    // Punkte an Scoreboard melden
    let winner: 0 | 1 | -1 = -1;
    if (wins[0] > wins[1]) winner = 0;
    else if (wins[1] > wins[0]) winner = 1;
    dispatch('sessionEnd', { winner, wins });
  }
  // Fragen und Lösungen (SVG-Koordinaten, z.B. Rom)
  type Question = {
    text: string;
    solution: { x: number; y: number };
  };

  const questions: Question[] = [
    {
      text: 'Wo wohnt der Papst?',
      solution: { x: 1052, y: 232 } // Apostolischer Palast, Vatikan
    },
    {
      text: 'Wo liegt höchste Berg der Erde?',
      solution: { x: 1459, y: 322 } // Mount Everest
    },
    {
      text: 'Wo befindet sich das Bauwerk, das als einziges der sieben Weltwunder der Antike noch erhalten ist?',
      solution: { x: 1152, y: 310 } // Pyramiden von Gizeh
    },
    {
      text: 'Wo wurden vier Präsidentenköpfe in einen Berg gemeißelt?',
      solution: { x: 421, y: 223 } // Mount Rushmore, USA
    },
    {
      text: 'Wo wurden vier Präsidentenköpfe in einen Berg gemeißelt?',
      solution: { x: 421, y: 223 } // Mount Rushmore, USA
    },




  ];

let currentRound = 0;
let pins: { x: number; y: number }[] = [];
let tempPin: { x: number; y: number } | null = null;
let activePlayer = 0; // 0 = Flo, 1 = Kandidat
let wins = [0, 0];
let showSolution = false;
let bo5Winner: number | null = null;
let roundStarter = 0; // 0 = Flo, 1 = Kandidat

  // Zoom-Logik
  let zoom = 1;
  let zoomX = 2000 / 2;
  let zoomY = 857 / 2;
  let zoomViewBox = '0 0 2000 857';
  let zoomContainer: HTMLDivElement;

  function updateViewBox() {
    const baseW = 2000, baseH = 857;
    const w = baseW / zoom;
    const h = baseH / zoom;
    let x = zoomX - w / 2;
    let y = zoomY - h / 2;
    x = Math.max(0, Math.min(baseW - w, x));
    y = Math.max(0, Math.min(baseH - h, y));
    zoomViewBox = `${x} ${y} ${w} ${h}`;
  }

  function handleWheel(e: WheelEvent) {
    e.preventDefault();
    const svg = zoomContainer.querySelector('svg');
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const styleWidth = rect.width;
    const styleHeight = rect.height;
    const [vbX, vbY, vbW, vbH] = zoomViewBox.split(' ').map(Number);
    let relX = (e.clientX - rect.left) / styleWidth;
    let relY = (e.clientY - rect.top) / styleHeight;
    relX = Math.max(0, Math.min(1, relX));
    relY = Math.max(0, Math.min(1, relY));
    const svgX = vbX + relX * vbW;
    const svgY = vbY + relY * vbH;
    const delta = e.deltaY < 0 ? 1.15 : 0.87;
    const baseW = 2000, baseH = 857;
    const minViewW = 150, minViewH = 150;
    let maxZoomW = baseW / minViewW;
    let maxZoomH = baseH / minViewH;
    let maxZoom = Math.min(maxZoomW, maxZoomH);
    let candidateZoom = zoom * delta;
    let w = baseW / candidateZoom;
    let h = baseH / candidateZoom;
    if (w < minViewW) candidateZoom = baseW / minViewW;
    if (h < minViewH) candidateZoom = baseH / minViewH;
    candidateZoom = Math.min(candidateZoom, maxZoom);
    const newZoom = Math.max(1, candidateZoom);
    if (newZoom !== zoom) {
      // Korrektes Zoomverhalten: Der Punkt unter dem Mauszeiger bleibt unter dem Mauszeiger
      // Berechne neuen ViewBox-Ausschnitt so, dass relX/relY gleich bleibt
      const newW = baseW / newZoom;
      const newH = baseH / newZoom;
      // Der Punkt unter dem Cursor soll nach dem Zoom an der gleichen relativen Stelle bleiben
      // Also: newVbX + relX * newW = svgX
      // => newVbX = svgX - relX * newW
      // Analog für Y
      const newVbX = svgX - relX * newW;
      const newVbY = svgY - relY * newH;
      zoomX = newVbX + newW / 2;
      zoomY = newVbY + newH / 2;
      zoom = newZoom;
      updateViewBox();
    }
  }


  // Pan-Logik
  let isPanning = false;
  let panStart = { x: 0, y: 0, zoomX: 0, zoomY: 0 };

  function handlePointerDown(e: PointerEvent) {
    // Nur linke Maustaste (0) für Pan
    if (e.button === 0) {
      isPanning = true;
      panStart.x = e.clientX;
      panStart.y = e.clientY;
      panStart.zoomX = zoomX;
      panStart.zoomY = zoomY;
      (e.target as Element).setPointerCapture(e.pointerId);
    }
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isPanning) return;
    const baseW = 2000, baseH = 857;
    const w = baseW / zoom;
    const h = baseH / zoom;
    // Verschiebung in SVG-Koordinaten
    const dx = (e.clientX - panStart.x) * (w / zoomContainer.clientWidth);
    const dy = (e.clientY - panStart.y) * (h / zoomContainer.clientHeight);
    zoomX = panStart.zoomX - dx;
    zoomY = panStart.zoomY - dy;
    updateViewBox();
  }

  function handlePointerUp(e: PointerEvent) {
    if (e.button === 0) {
      isPanning = false;
      (e.target as Element).releasePointerCapture(e.pointerId);
    }
  }

  function handleMapContextMenu(event: MouseEvent) {
    event.preventDefault();
    // Rechtsklick: Pin setzen
    const svg = event.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const styleWidth = rect.width;
    const styleHeight = rect.height;
    const [vbX, vbY, vbW, vbH] = zoomViewBox.split(' ').map(Number);
    let relX = (event.clientX - rect.left) / styleWidth;
    let relY = (event.clientY - rect.top) / styleHeight;
    relX = Math.max(0, Math.min(1, relX));
    relY = Math.max(0, Math.min(1, relY));
    const svgX = vbX + relX * vbW;
    const svgY = vbY + relY * vbH;
    tempPin = { x: svgX, y: svgY };
  }

  function confirmPin() {
    if (tempPin) {
      pins.push(tempPin);
      tempPin = null;
      // Nach jedem Pin: Map auf Ursprungsform zurücksetzen
      zoom = 1;
      zoomX = 2000 / 2;
      zoomY = 857 / 2;
      updateViewBox();
      if (pins.length === 2) {
        showSolution = true;
        // Nach beiden Pins: automatisch auf alles zoomen und Interaktion sperren
        setTimeout(() => zoomToPinsAndSolution(), 100); // Kurze Verzögerung für Rendering
      } else {
        // Spielerwechsel: 0 -> 1, 1 -> 0
        activePlayer = (activePlayer + 1) % 2;
      }
    }
  }

  // Interaktion sperren, wenn Lösung angezeigt wird
  $: interactionLocked = showSolution && pins.length === 2;

  // Blauer Kreis um Lösung: Abstand zum näheren Pin
  $: solutionCircle = (() => {
    if (!showSolution || pins.length !== 2) return null;
    const sol = questions[currentRound].solution;
    const d0 = Math.hypot(pins[0].x - sol.x, pins[0].y - sol.y);
    const d1 = Math.hypot(pins[1].x - sol.x, pins[1].y - sol.y);
    const r = Math.min(d0, d1);
    return { x: sol.x, y: sol.y, r };
  })();

  function zoomToPinsAndSolution() {
    if (pins.length < 2 || !showSolution) return;
    const sol = questions[currentRound].solution;
    const points = [pins[0], pins[1], sol];
    let minX = Math.min(...points.map(p => p.x));
    let maxX = Math.max(...points.map(p => p.x));
    let minY = Math.min(...points.map(p => p.y));
    let maxY = Math.max(...points.map(p => p.y));
    // Padding in SVG-Pixeln
    const pad = 60;
    minX -= pad; maxX += pad; minY -= pad; maxY += pad;
    // Begrenzung auf SVG
    minX = Math.max(0, minX); minY = Math.max(0, minY);
    maxX = Math.min(2000, maxX); maxY = Math.min(857, maxY);
    // Neue ViewBox berechnen
    const w = maxX - minX;
    const h = maxY - minY;
    // Zoom so, dass alles reinpasst
    const zoomW = 2000 / w;
    const zoomH = 857 / h;
    zoom = Math.min(zoomW, zoomH, 12); // Maximal 12x Zoom
    zoomX = minX + w / 2;
    zoomY = minY + h / 2;
    updateViewBox();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      // Set pin to center if not set
      const [vbX, vbY, vbW, vbH] = zoomViewBox.split(' ').map(Number);
      const relX = 0.5;
      const relY = 0.5;
      const svgX = vbX + relX * vbW;
      const svgY = vbY + relY * vbH;
      tempPin = { x: svgX, y: svgY };
    }
  }

  function checkWinner() {
    const sol = questions[currentRound].solution;
    const d0 = Math.hypot(pins[0].x - sol.x, pins[0].y - sol.y);
    const d1 = Math.hypot(pins[1].x - sol.x, pins[1].y - sol.y);
    if (d0 === d1) {
      // Unentschieden, keine Punkte
    } else if (d0 < d1) {
      wins[0]++;
    } else {
      wins[1]++;
    }
    // Spiel beenden, wenn 3 Punkte oder alle Fragen gespielt
    if (wins[0] === 3 || wins[1] === 3 || currentRound >= questions.length - 1) {
      bo5Winner = wins[0] > wins[1] ? 0 : 1;
    }
  }

  function nextRound() {
    // Nur weitermachen, wenn das Spiel noch nicht vorbei ist
    if (bo5Winner !== null) return;
    pins = [];
    showSolution = false;
    currentRound++;
    // Nach Reset: wieder auf Gesamtkarte zoomen
    zoom = 1;
    zoomX = 2000 / 2;
    zoomY = 857 / 2;
    // Abwechselnd Starter: 0,1,0,1...
    roundStarter = (roundStarter + 1) % 2;
    activePlayer = roundStarter;
    updateViewBox();
  }

  import { onMount } from 'svelte';
onMount(() => {
    updateViewBox();
    // Setze roundStarter und activePlayer für die erste Runde
    roundStarter = 0;
    activePlayer = roundStarter;
});
</script>

{#if showIntro}
  <div class="sortieren-intro">
    <h2>Wo ist das? – Spielregeln</h2>
    <ul>
      <li>Ihr spielt Best-of-5: Wer zuerst 3 Runden gewinnt, holt die Punkte.</li>
      <li>Zu jeder Frage setzt ihr abwechselnd eine Stecknadel auf die Weltkarte. Der andere Spieler darf muss sich währendessen die Augen zu halten.</li>
      <li>Wer näher an der gesuchten Lösung ist, gewinnt die Runde.</li>
    </ul>
    <div style="color:#fffbe6; font-size:1.08rem; margin-bottom:0.7rem;">
      <b>Starter dieser Runde: {roundStarter === 0 ? 'Flo' : 'Kandidat'}</b>
    </div>
    <button class="start-btn" on:click={startGame}>Spiel starten</button>
  </div>
{:else if bo5Winner === null && questions[currentRound]}
  <div class="map-game-container">
    <div class="map-question">
      <b>Frage {currentRound + 1} von 5:</b> {questions[currentRound].text}
    </div>
    <div class="map-score">
      Flo: {wins[0]} | Kandidat: {wins[1]}
    </div>
    <div class="map-svg-wrapper">
      <div class="map-zoom-container" bind:this={zoomContainer} style="width:100%;height:100%;position:relative;overflow:hidden;">
        <svg
          class="map-base-svg"
          viewBox={zoomViewBox}
          style="position:absolute;left:0;top:0;width:100%;height:100%;z-index:1;pointer-events:none;"
          aria-hidden="true"
        >
          <!-- BEGIN worldH.svg content -->
          <g>
            <!-- SVG paths from worldH.svg inserted below -->
            <image href="/worldH.svg" x="0" y="0" width="2000" height="857" />
          </g>
          <!-- END worldH.svg content -->
        </svg>
        <svg
          class="map-overlay"
          viewBox={zoomViewBox}
          on:pointerdown={!interactionLocked ? handlePointerDown : undefined}
          on:pointermove={!interactionLocked ? handlePointerMove : undefined}
          on:pointerup={!interactionLocked ? handlePointerUp : undefined}
          on:contextmenu={!interactionLocked ? handleMapContextMenu : undefined}
          on:keydown={!interactionLocked ? handleKeyDown : undefined}
          on:wheel|preventDefault={!interactionLocked ? handleWheel : undefined}
          role="button"
          tabindex="0"
          aria-label="Karte auswählen"
          style="position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:all;z-index:2;"
        >
          {#each pins as pin, i}
            <!-- Pinnadel: kleiner Kopf, dünner Schaft, Spitze trifft genau den Punkt -->
            <g>
              <!-- Schaft -->
              <rect x={pin.x - 0.7} y={pin.y - 10} width="1.4" height="10" fill="#888" stroke="#444" stroke-width="0.3" rx="0.7" />
              <!-- Kopf -->
              <circle cx={pin.x} cy={pin.y - 10} r="3.2" fill={i === 0 ? '#4be07b' : '#e74c3c'} stroke="#222" stroke-width="1" />
              <!-- Spitze -->
              <circle cx={pin.x} cy={pin.y} r="1.1" fill="#fff" stroke="#222" stroke-width="0.5" />
            </g>
          {/each}
          {#if showSolution}
            <!-- Beide Pins nochmal hervorheben, wenn Lösung gezeigt wird -->
            {#each pins as pin, i}
              <g>
                <rect x={pin.x - 0.7} y={pin.y - 10} width="1.4" height="10" fill={i === 0 ? '#4be07b' : '#e74c3c'} stroke="#222" stroke-width="0.3" rx="0.7" opacity="0.7" />
                <circle cx={pin.x} cy={pin.y - 10} r="3.2" fill={i === 0 ? '#4be07b' : '#e74c3c'} stroke="#222" stroke-width="1" opacity="0.7" />
                <circle cx={pin.x} cy={pin.y} r="1.1" fill="#fff" stroke="#222" stroke-width="0.5" opacity="0.7" />
              </g>
            {/each}
          {/if}
          {#if tempPin}
            <g opacity="0.7">
              <rect x={tempPin.x - 0.7} y={tempPin.y - 10} width="1.4" height="10" fill="#888" stroke="#444" stroke-width="0.3" rx="0.7" />
              <circle cx={tempPin.x} cy={tempPin.y - 10} r="3.2" fill={pins.length === 0 ? '#4be07b' : '#e74c3c'} stroke="#222" stroke-width="1" />
              <circle cx={tempPin.x} cy={tempPin.y} r="1.1" fill="#fff" stroke="#222" stroke-width="0.5" />
            </g>
          {/if}
          {#if showSolution && solutionCircle}
            <!-- Blauer Kreis für den näheren Pin -->
            <circle cx={solutionCircle.x} cy={solutionCircle.y} r={solutionCircle.r} fill="#3fa9f5" fill-opacity="0.18" stroke="#3fa9f5" stroke-opacity="0.4" stroke-width="2" />
          {/if}
          {#if showSolution}
            <g>
              <rect x={questions[currentRound].solution.x - 0.7} y={questions[currentRound].solution.y - 10} width="1.4" height="10" fill="#ffe066" stroke="#222" stroke-width="0.3" rx="0.7" />
              <circle cx={questions[currentRound].solution.x} cy={questions[currentRound].solution.y - 10} r="3.2" fill="#ffe066" stroke="#222" stroke-width="1" />
              <circle cx={questions[currentRound].solution.x} cy={questions[currentRound].solution.y} r="1.1" fill="#fff" stroke="#222" stroke-width="0.5" />
            </g>
          {/if}
        </svg>
      </div>
    </div>
    <div class="map-player-info">
      {#if showSolution}
        {#if pins.length === 2}
          {#if Math.hypot(pins[0].x - questions[currentRound].solution.x, pins[0].y - questions[currentRound].solution.y) === Math.hypot(pins[1].x - questions[currentRound].solution.x, pins[1].y - questions[currentRound].solution.y)}
            <div style="margin:1rem 0; font-weight:bold; color:#fff;">Unentschieden!</div>
          {:else if Math.hypot(pins[0].x - questions[currentRound].solution.x, pins[0].y - questions[currentRound].solution.y) < Math.hypot(pins[1].x - questions[currentRound].solution.x, pins[1].y - questions[currentRound].solution.y)}
            <div style="margin:1rem 0; font-weight:bold; color:#fff;">Flo gewinnt diese Runde!</div>
          {:else}
            <div style="margin:1rem 0; font-weight:bold; color:#fff;">Kandidat gewinnt diese Runde!</div>
          {/if}
        {/if}
        <button class="map-confirm-btn map-next-btn" on:click={() => { checkWinner(); nextRound(); }}>Weiter</button>
      {:else}
        {#if pins.length < 2}
          {#if activePlayer === 0}
            Flo ist am Zug
          {:else}
            Kandidat ist am Zug
          {/if}
          {#if tempPin}
            <button class="map-confirm-btn" on:click={confirmPin} disabled={interactionLocked}>Pin einloggen</button>
          {/if}
        {/if}
      {/if}
    </div>
  </div>


{:else}
  <div class="map-game-end">
    <h2>Spiel beendet!</h2>
    {#if bo5Winner !== null}
      <p>Gewinner: {bo5Winner === 0 ? 'Flo' : 'Kandidat'}</p>
    {/if}
    <p>Endstand: {wins[0]} : {wins[1]}</p>
    <button class="map-confirm-btn map-next-btn" on:click={endMapGame}>Weiter</button>
  </div>
{/if}





<style>
/* --- MapGame intro uses SortierenSession intro design --- */
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
@keyframes fadeInIntro {
  from { opacity: 0; transform: translate(-50%, -60%) scale(0.97); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

.map-game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  background: transparent;
  border-radius: 1.2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  padding: 2.2rem 2.5rem 2.2rem 2.5rem;
  color: #ffe066;
  min-width: 340px;
  max-width: 95vw;
  margin: 2rem auto;
}
.map-question {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  color: #fffbe6;
}
.map-score {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}
.map-svg-wrapper {
  position: relative;
  width: 100vw;
  max-width: 2000px;
  aspect-ratio: 2000/857;
  margin: 0 auto;
  /* Dunkler, moderner Hintergrund mit leichtem Verlauf passend zum Design */
  background: linear-gradient(135deg, #23243a 0%, #1a1b2b 100%);
  box-shadow: 0 2px 16px #0002;
  border-radius: 0.7rem;
  min-width: 320px;
  min-height: 400px;
  height: 70vh;
}
.map-zoom-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
.map-overlay {
  position: absolute;
  left: 0; top: 0;
  width: 100%;
  height: 100%;
  pointer-events: all;
  border-radius: 0.7rem;
  z-index: 20;
}
.map-player-info {
  font-size: 1.1rem;
  margin-top: 1rem;
  color: #ffe066;
}
.map-game-end {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(34,34,34,0.97);
  border-radius: 1.2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  padding: 2.2rem 2.5rem 2.2rem 2.5rem;
  color: #ffe066;
  min-width: 340px;
  max-width: 95vw;
  margin: 2rem auto;
}
.map-confirm-btn {
  margin-left: 1.2rem;
  padding: 0.5rem 1.2rem;
  font-size: 1.1rem;
  background: #ffe066;
  color: #222;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 2px 8px #0002;
  transition: background 0.2s;
  z-index: 100;
}
.map-confirm-btn:hover {
  background: #fffbe6;
}
.map-next-btn {
  display: block;
  margin: 1.2rem auto 0 auto;
  min-width: 120px;
  font-size: 1.2rem;
  z-index: 101;
}
</style>


