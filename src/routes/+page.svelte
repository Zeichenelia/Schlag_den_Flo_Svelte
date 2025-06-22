<script lang="ts">
  import SplashScreen from '$lib/components/SplashScreen.svelte';
  import Intro from '$lib/components/Intro.svelte';
  import Scoreboard from '$lib/components/Scoreboard.svelte';
  import { onMount } from 'svelte';

  let showSplash = true;
  let showIntro = false;
  let showGame = false;

  function startGame() {
    showSplash = false;
    showIntro = true;
    showGame = false;
  }
  function handleIntroEnd() {
    showIntro = false;
    showGame = true;
    showSplash = false;
  }
</script>

{#if showSplash}
  <SplashScreen onStart={startGame} />
{:else if showIntro}
  <Intro on:introEnd={handleIntroEnd} musicSrc="/intro.mp3" />
{:else if showGame}
  <Scoreboard />
{/if}
