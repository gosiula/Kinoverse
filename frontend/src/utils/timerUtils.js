import { useState, useEffect } from "react";

// Rezerwacja trwa X minut
export const RESERVATION_TIME_MINUTES = 10;

// Klucze w localStorage
const LS_CREATED_AT = "orderCreatedAt";     // string z backendu / ISO / etc.
const LS_EXPIRES_AT = "orderExpiresAtMs";   // liczba w ms jako string

// Formatowanie MM:SS
export const formatTime = (seconds) => {
  const safeSeconds = Number.isFinite(seconds) ? seconds : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

/**
 * Próbuje sparsować orderCreatedAt (string) do ms.
 * Obsługuje:
 * - "YYYY-MM-DD HH:mm:ss"
 * - "YYYY-MM-DDTHH:mm:ss"
 * - ISO z Z lub offsetem (+01:00)
 * Jeśli brak strefy → traktujemy jako UTC (dopisz "Z").
 */
function parseCreatedAtMs(createdAtString) {
  if (!createdAtString) return NaN;

  let s = createdAtString.trim().replace(" ", "T");

  const hasTimezone = /Z$/i.test(s) || /[+-]\d{2}:\d{2}$/.test(s);
  if (!hasTimezone) s = `${s}Z`;

  const ms = new Date(s).getTime();
  return Number.isFinite(ms) ? ms : NaN;
}

/**
 * Zwraca timestamp wygaśnięcia rezerwacji w ms.
 * - Jeśli LS_EXPIRES_AT już istnieje → używa go (to zapewnia brak resetów między stronami)
 * - Jeśli nie → liczy z orderCreatedAt i zapisuje LS_EXPIRES_AT
 */
function getOrCreateExpiresAtMs() {
  const existing = Number(localStorage.getItem(LS_EXPIRES_AT));
  if (Number.isFinite(existing) && existing > 0) return existing;

  const createdAtString = localStorage.getItem(LS_CREATED_AT);
  const createdAtMs = parseCreatedAtMs(createdAtString);

  // jeśli createdAt jest nieparsowalne, nie rób 10 minut "z powietrza" przy każdej stronie:
  // zrób 10 minut od teraz i zapisz expiresAt, żeby było stabilnie
  const baseMs = Number.isFinite(createdAtMs) ? createdAtMs : Date.now();

  const expiresAtMs = baseMs + RESERVATION_TIME_MINUTES * 60 * 1000;
  localStorage.setItem(LS_EXPIRES_AT, String(expiresAtMs));
  return expiresAtMs;
}

// Oblicza ile zostało sekund
export function calculateInitialTimeLeft() {
  const expiresAtMs = getOrCreateExpiresAtMs();
  const remainingMs = expiresAtMs - Date.now();
  return Math.max(0, Math.floor(remainingMs / 1000));
}

// Hook do używania timera (liczy zawsze od expiresAt, nie od lokalnego prevTime)
export function useReservationTimer() {
  const [timeLeft, setTimeLeft] = useState(calculateInitialTimeLeft());

  useEffect(() => {
    // w razie nawigacji / odświeżenia — zawsze bierzemy expiresAt z localStorage
    const tick = () => {
      const expiresAtMs = getOrCreateExpiresAtMs();
      const remainingMs = expiresAtMs - Date.now();
      const seconds = Math.max(0, Math.floor(remainingMs / 1000));
      setTimeLeft(seconds);

      if (seconds === 0) {
        // opcjonalnie: można tu czyścić localStorage
        // localStorage.removeItem(LS_EXPIRES_AT);
        alert("Czas rezerwacji zakończył się!");
      }
    };

    tick(); // od razu ustaw poprawnie
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, []);

  return { timeLeft, formattedTime: formatTime(timeLeft) };
}
