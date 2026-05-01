"use strict";

const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

async function getSpotifyToken() {
  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!response.ok) {
    throw new Error("Could not get Spotify token");
  }

  const data = await response.json();
  return data.access_token;
}

router.get("/", async (req, res) => {
  const tasks = await Task.find().sort({ dueDate: 1 });
  res.render("index", { tasks });
});

router.get("/addTask", (req, res) => {
  res.render("addTask");
});

router.post("/addTask", async (req, res) => {
  const { title, className, dueDate, estimatedHours } = req.body;

  await Task.create({
    title,
    className,
    dueDate,
    estimatedHours
  });

  res.redirect("/");
});

router.post("/deleteTask", async (req, res) => {
  await Task.findByIdAndDelete(req.body.id);
  res.redirect("/");
});

router.post("/toggleComplete", async (req, res) => {
  const task = await Task.findById(req.body.id);

  if (task) {
    task.completed = !task.completed;
    await task.save();
  }

  res.redirect("/");
});

router.get("/motivation", async (req, res) => {
  try {
    const response = await fetch("https://zenquotes.io/api/random");
    const data = await response.json();

    if (data[0].q === "Too many requests") {
      throw new Error("Rate limited");
    }

    res.render("motivation", {
      quote: data[0].q,
      author: data[0].a
    });

  } catch (error) {
    console.log("Falling back to backup quote");

    res.render("motivation", {
      quote: "Discipline is choosing between what you want now and what you want most.",
      author: "Abraham Lincoln"
    });
  }
});

router.get("/focusMusic", (req, res) => {
  res.render("focusMusic", { tracks: null, searchTerm: "" });
});

router.post("/focusMusic", async (req, res) => {
  try {
    console.log("Searching Spotify for:", req.body.searchTerm);

    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
      throw new Error("Missing Spotify API keys in .env");
    }

    const searchTerm = req.body.searchTerm || "lofi study";
    const token = await getSpotifyToken();

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchTerm)}&type=track&limit=8`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error("Spotify search request failed");
    }

    const data = await response.json();

    const tracks = data.tracks.items.map(track => ({
      name: track.name,
      artist: track.artists.map(artist => artist.name).join(", "),
      image: track.album.images[0]?.url,
      link: track.external_urls.spotify
    }));

    res.render("focusMusic", { tracks, searchTerm });
  } catch (error) {
    console.error("Spotify error:", error.message);

    res.render("focusMusic", {
      tracks: [],
      searchTerm: req.body.searchTerm || ""
    });
  }
});

router.get("/pomodoro", (req, res) => {
  res.render("pomodoro");
});

router.get("/editTask/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    res.render("editTask", { task });
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
});

router.post("/editTask/:id", async (req, res) => {
  try {
    const { title, className, dueDate, estimatedHours } = req.body;

    await Task.findByIdAndUpdate(req.params.id, {
      title,
      className,
      dueDate,
      estimatedHours
    });

    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
});

module.exports = router;