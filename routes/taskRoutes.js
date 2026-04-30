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

  const data = await response.json();
  return data.access_token;
}

router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ dueDate: 1 });
    res.render("index", { tasks });
  } catch (error) {
    console.error(error);
    res.send("Database connection error. Check MongoDB connection.");
  }
});

router.get("/addTask", (req, res) => {
  res.render("addTask");
});

router.post("/addTask", async (req, res) => {
  const { title, className, dueDate, priority, estimatedHours } = req.body;

  await Task.create({
    title,
    className,
    dueDate,
    priority,
    estimatedHours,
    completed: false
  });

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

router.post("/deleteTask", async (req, res) => {
  await Task.findByIdAndDelete(req.body.id);
  res.redirect("/");
});

router.get("/motivation", async (req, res) => {
  try {
    const response = await fetch("https://zenquotes.io/api/random");
    const data = await response.json();

    res.render("motivation", {
      quote: data[0].q,
      author: data[0].a
    });
  } catch (error) {
    res.render("motivation", {
      quote: "Keep going. Small progress is still progress.",
      author: "StudySprint"
    });
  }
});

router.get("/focusMusic", (req, res) => {
  res.render("focusMusic", { tracks: null, searchTerm: "" });
});

router.post("/focusMusic", async (req, res) => {
  try {
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

    const data = await response.json();

    const tracks = data.tracks.items.map(track => ({
      name: track.name,
      artist: track.artists.map(artist => artist.name).join(", "),
      image: track.album.images[0]?.url,
      link: track.external_urls.spotify
    }));

    res.render("focusMusic", { tracks, searchTerm });
  } catch (error) {
    console.error("Spotify error:", error);
    res.render("focusMusic", { tracks: [], searchTerm: req.body.searchTerm });
  }
});

router.get("/pomodoro", (req, res) => {
  res.render("pomodoro");
});

module.exports = router;