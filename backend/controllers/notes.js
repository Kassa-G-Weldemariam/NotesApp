const notesRouter = require("express").Router();
const Note = require("../models/note");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { userExtractor } = require("../utils/middleware");

notesRouter.get("/", async (req, res) => {
  const notes = await Note.find({}).populate("user", { username: 1, name: 1 });
  res.json(notes);
});

notesRouter.get("/:id", async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (note) {
    res.json(note);
  } else {
    res.status(404).end();
  }
});

notesRouter.post("/", userExtractor, async (req, res, next) => {
  try {
    const body = req.body;

    if (!req.user) {
      return res.status(401).json({ error: "token invalid" });
    }
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(400).json({ error: "user id not found" });
    }

    const note = new Note({
      content: body.content,
      important: body.important || false,
      user: user._id,
    });
    const savedNote = await note.save();
    user.notes = user.notes.concat(savedNote._id);
    await user.save();
    res.status(201).json(savedNote);
  } catch (error) {
    next(error);
  }
});

notesRouter.delete("/:id", async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

notesRouter.put("/:id", async (req, res) => {
  const { content, important } = req.body;
  const note = await Note.findById(req.params.id);
  if (!note) {
    return res.status(404).end();
  }
  note.content = content;
  note.important = important;

  const updatedNote = await note.save();
  res.json(updatedNote);
});

module.exports = notesRouter;
