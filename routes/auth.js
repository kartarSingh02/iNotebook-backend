const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const { body, validationResult } = require('express-validator');

// Creating a User using :post api "/api/auth/createuser" - no auth required
router.post('/createuser',[
    body('name','Enter a valid name').isLength({min:3}),
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Password must be atleast 8 characters').isLength({min:8}),
    ],
    async (req,res)=>{
        // if got errors return bad request and errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    try{
    // Check whether the user with this email exist already
    let user = await User.findOne({email: req.body.email});
    if(user){
        return res.status(400).json({error: "Sorry a user with this email already exists"})
    }
    user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    })

    res.json(user)
    } catch(error){
        console.log(error.message);
        res.status(500).send("Some Error Occured");
    }
    
    // .then(user => res.json(user)).catch(err=> {console.log(err)
    // res.json({error:'Please enter a unique value', message: err.message})});
})

module.exports = router;