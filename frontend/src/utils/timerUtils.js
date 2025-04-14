import { useState, useEffect } from "react";

// Rezerwacja trwa X minut
export const RESERVATION_TIME_MINUTES = 10;

// Formatowanie MM:SS
export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

function parsePolishDateToTimestamp(dateString) {
  const date = new Date(dateString);

  const formatter = new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const values = {};
  parts.forEach((part) => {
    if (part.type !== "literal") {
      values[part.type] = parseInt(part.value, 10);
    }
  });

  // Tworzymy timestamp tak, jakby to był czas lokalny w Warszawie
  const timestamp = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour - 4,
    values.minute,
    values.second
  );

  return timestamp;
}

export function getPolishTimestamp() {
  const formatter = new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const dateParts = {};
  parts.forEach((part) => {
    if (part.type !== "literal") {
      dateParts[part.type] = part.value;
    }
  });

  const isoDateString = `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}:${dateParts.second}`;
  return new Date(isoDateString).getTime();
}

// Oblicza ile zostało czasu od stworzenia rezerwacji
export function calculateInitialTimeLeft() {
  try {
    const createdAtString = localStorage.getItem("orderCreatedAt");
    const createdAtMs = parsePolishDateToTimestamp(createdAtString);

    const nowMs = getPolishTimestamp();
    const expirationMs = createdAtMs + RESERVATION_TIME_MINUTES * 60 * 1000;

    // Obliczamy różnicę w milisekundach
    const remainingMs = expirationMs - nowMs;

    // Konwertujemy na sekundy i upewniamy się, że nie mamy wartości ujemnych
    const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));

    return remainingSeconds;
  } catch (error) {
    console.error("Błąd przy obliczaniu czasu:", error);
    return RESERVATION_TIME_MINUTES * 60;
  }
}

// Hook do używania timera
export function useReservationTimer() {
  const [timeLeft, setTimeLeft] = useState(calculateInitialTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = Math.max(0, prevTime - 1);
        if (newTime === 0) {
          clearInterval(interval);
          alert("Czas rezerwacji zakończył się!");
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { timeLeft, formattedTime: formatTime(timeLeft) };
}
