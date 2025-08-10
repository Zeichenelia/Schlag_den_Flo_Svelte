// src/lib/audioStore.ts
import { writable } from 'svelte/store';

// Zustand für Play/Pause
export const isPlaying = writable(false);

// NEU: Zustand für die Lautstärke (Wert zwischen 0 und 1)
export const volume = writable(0.5); // Startet bei 50% Lautstärke

// Funktion zum Umschalten von Play/Pause
export function toggleAudio() {
  isPlaying.update(playing => !playing);
}