// src/lib/audioStore.ts
import { writable } from 'svelte/store';

export const isPlaying = writable(false);
export const volume = writable(0.5);

// NEU: Ein Store, um die Haupt-Musik stummzuschalten, wenn eine andere wichtige Musik läuft.
export const isMusicOverridden = writable(false);

export function toggleAudio() {
  isPlaying.update(playing => !playing);
}