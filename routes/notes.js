const express = require('express');
const router = express.Router();
var fetchuser = require('../middleware/fetchuser');
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

//  ROUTE 1 : Get all the notes using: GET "/api/notes/fetchallnotes" . Login required
router.get('/fetchallnotes',fetchuser, async (req,res)=>{
    try {
        const notes = await Note.find({user: req.user.id})
        res.json(notes)
    } catch (error) { 
      console.log(error.message);
      res.status(500).send("Internal Server Error occured");
    }

})

//  ROUTE 2 : Create/Add notes using: Post "/api/notes/addnote" . Login required
router.post('/addnote',fetchuser,[
    body("title", "Enter a valid name").isLength({ min: 3 }),
    body("description", "Description must be atleast 8 characters").isLength({min: 8}),
], async (req,res)=>{
    try{
    const {title, description, tag} = req.body;
    // if there are any errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Creating a new note if there is no error
    const note = new Note({
        title, description, tag, user: req.user.id
    })
    // saving note using .save()
    const savedNote = await note.save();
    res.json(savedNote);
    }
    catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error occured");
    }
})

module.exports = router;