"use strict";

let focusMinutes = 25;
let breakMinutes = 5;
let timeLeft = focusMinutes * 60;
let timer = null;
let isFocus = true;

const timerDisplay = document.getElementById("timerDisplay");
const modeLabel = document.getElementById("modeLabel");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const saveTimerBtn = document.getElementById("saveTimerBtn");
const focusInput = document.getElementById("focusInput");
const breakInput = document.getElementById("breakInput");

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  timerDisplay.textContent =
    String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

function switchMode() {
  isFocus = !isFocus;

  if (isFocus) {
    modeLabel.textContent = "Focus Time";
    timeLeft = focusMinutes * 60;
  } else {
    modeLabel.textContent = "Break Time";
    timeLeft = breakMinutes * 60;
  }

  updateDisplay();
}

function startTimer() {
  if (timer !== null) {
    return;
  }

  timer = setInterval(function () {
    if (timeLeft > 0) {
      timeLeft--;
      updateDisplay();
    } else {
      clearInterval(timer);
      timer = null;

      if (isFocus) {
        alert("Focus sprint complete! Take a break.");
      } else {
        alert("Break is over! Back to focus.");
      }

      switchMode();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  timer = null;
}

function resetTimer() {
  pauseTimer();
  isFocus = true;
  modeLabel.textContent = "Focus Time";
  timeLeft = focusMinutes * 60;
  updateDisplay();
}

function saveSettings() {
  focusMinutes = Number(focusInput.value);
  breakMinutes = Number(breakInput.value);

  localStorage.setItem("focusMinutes", focusMinutes);
  localStorage.setItem("breakMinutes", breakMinutes);

  resetTimer();
}

function loadSettings() {
  const savedFocus = localStorage.getItem("focusMinutes");
  const savedBreak = localStorage.getItem("breakMinutes");

  if (savedFocus) {
    focusMinutes = Number(savedFocus);
    focusInput.value = focusMinutes;
  }

  if (savedBreak) {
    breakMinutes = Number(savedBreak);
    breakInput.value = breakMinutes;
  }

  timeLeft = focusMinutes * 60;
  updateDisplay();
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);
saveTimerBtn.addEventListener("click", saveSettings);

loadSettings();