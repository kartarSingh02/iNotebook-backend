const express = require("express");
const router = express.Router();
var fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

//  ROUTE 1 : Get all the notes using: GET "/api/notes/fetchallnotes" . Login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error occured");
  }
});

//  ROUTE 2 : Create/Add notes using: Post "/api/notes/addnote" . Login required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid name").isLength({ min: 3 }),
    body("description", "Description must be atleast 8 characters").isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      // if there are any errors, return Bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      // Creating a new note if there is no error
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      // saving note using .save()
      const savedNote = await note.save();
      res.json(savedNote);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error occured");
    }
  }
);

//  ROUTE 3 : Update an existing notes using: Put "/api/notes/updatenote" . Login required
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
    try{
  // Create a newNote object
  const newNote = {};
  if (title) {
    newNote.title = title;
  }
  if (description) {
    newNote.description = description;
  }
  if (tag) {
    newNote.tag = tag;
  }

  // Find the note to be updated and update it
  let note = await Note.findById(req.params.id);
  if (!note) {
    return res.status(404).send("Not Found");
  }

  if (note.user.toString() !== req.user.id) {
    return res.status(401).send("Not Allowed");
  }

  // finding the note and updating it
  note = await Note.findByIdAndUpdate(
    req.params.id,
    { $set: newNote },
    { new: true }
  );
  res.json({ note });
  }
  catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error occured");
    }
});


//  ROUTE 4 : Delete an existing notes using: Delete "/api/notes/deletenote" . Login required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
    try{
  // Find the note to be deleted and delete it
  let note = await Note.findById(req.params.id);
  if (!note) {
    return res.status(404).send("Not Found");
  }
    //  Allow deletion only if user owns this note
  if (note.user.toString() !== req.user.id) {
    return res.status(401).send("Not Allowed");
  }

  // finding the note and deleting it
  note = await Note.findByIdAndDelete(req.params.id);

  res.json({ "Success": "Note has been deleted", note:note});
    }
    catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error occured");
    }
});
module.exports = router;
