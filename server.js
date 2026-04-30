"use strict";

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const taskRoutes = require("./routes/taskRoutes");

const app = express();
const port = process.env.PORT || 4000;

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.resolve(__dirname, "public")));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use("/", taskRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});