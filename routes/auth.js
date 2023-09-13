const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// using jwt -> used for secure communication via giving a unique token to user so that person wont acces another user data by chanign the name
var jwt = require('jsonwebtoken');
const JWT_SECRET = 'kartarUsingJWTForFirstTime$'

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

    // creating a secure password using bcryptjs for adding extra layer of security using salt and gensalt will generate salt for you
    // we have added await because bcrypt return promise means its and async funciton and wait for the result without blocking further operations
    const salt = await bcrypt.genSalt(10);
    const secPass= await bcrypt.hash(req.body.password,salt);

    user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
    })

    const data = {
        user:{
            id:user.id
        }
    }
    // this will return token which will be on id basis uniquely
    const authToken = jwt.sign(data,JWT_SECRET);
    console.log(authToken);
    res.json({authToken})
    // browser will save the token and if same user came he will be able to access

    } catch(error){
        console.log(error.message);
        res.status(500).send("Some Error Occured");
    }
    
    // .then(user => res.json(user)).catch(err=> {console.log(err)
    // res.json({error:'Please enter a unique value', message: err.message})});
})

module.exports = router;