require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true,

  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

const { initializeDatabase } = require("./db");
const Poll = require("./models/poll.models");

app.use(express.json());
initializeDatabase();

app.get("/", (req, res) => {
  res.send("Hello, poll voting!");
});

// Create a poll
app.post("/polls", async (req, res) => {
  const { question, options } = req.body;
  if (!question || !options || options.length < 2) {
    return res.status(400).json({ error: "Invalid poll data" });
  }

  const poll = new Poll({
    question,
    options: options.map((opt) => ({ text: opt, votes: 0 })),
  });

  await poll.save();
  res.status(201).json(poll);
});

// Vote on a poll
app.post("/polls/:id/vote", async (req, res) => {
  const { id } = req.params;
  const { optionIndex } = req.body;

  const poll = await Poll.findById(id);
  if (!poll || optionIndex < 0 || optionIndex >= poll.options.length) {
    return res.status(404).json({ error: "Poll or option not found" });
  }

  poll.options[optionIndex].votes += 1;
  await poll.save();

  res.json(poll);
});

// Get poll results
app.get("/polls/:id", async (req, res) => {
  const poll = await Poll.findById(req.params.id);
  if (!poll) {
    return res.status(404).json({ error: "Poll not found" });
  }
  res.json(poll);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
