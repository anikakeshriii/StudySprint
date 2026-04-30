"use strict";

function applyTheme(theme) {
  document.body.classList.remove("default", "green", "pink", "dark");
  document.body.classList.add(theme);
  localStorage.setItem("studySprintTheme", theme);
}

document.addEventListener("DOMContentLoaded", function () {
  const savedTheme = localStorage.getItem("studySprintTheme") || "default";
  applyTheme(savedTheme);

  const themeSelect = document.getElementById("themeSelect");
  const settingsBtn = document.getElementById("settingsBtn");
  const dropdown = document.getElementById("settingsDropdown");

  if (themeSelect) {
    themeSelect.value = savedTheme;

    themeSelect.addEventListener("change", function () {
      applyTheme(this.value);
    });
  }

});