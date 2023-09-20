const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var fetchuser = require('../middleware/fetchuser')

// using jwt -> used for secure communication via giving a unique token to user so that person wont acces another user data by chanign the name
var jwt = require("jsonwebtoken");
const JWT_SECRET = "kartarUsingJWTForFirstTime$";

// ROUTE 1 : Creating a User using :post api "/api/auth/createuser" - no login required
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Password must be atleast 8 characters").isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    let success=false;
    // if got errors return bad request and errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }

    try {
      // Check whether the user with this email exist already
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ success, error: "Sorry a user with this email already exists" });
      }

      // creating a secure password using bcryptjs for adding extra layer of security using salt and gensalt will generate salt for you
      // we have added await because bcrypt return promise means its and async funciton and wait for the result without blocking further operations
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };
      // this will return token which will be on id basis uniquely
      const authToken = jwt.sign(data, JWT_SECRET);
      console.log(authToken);
      success=true;
      res.json({success, authToken });
      // browser will save the token and if same user came he will be able to access
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error occured");
    }

    // .then(user => res.json(user)).catch(err=> {console.log(err)
    // res.json({error:'Please enter a unique value', message: err.message})});
  }
);

// ROUTE 2 : Authenticate a user using :post api "/api/auth/login" - no login required
router.post(
  "/login",
  [
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success=false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ success,error: "Please try to login with correct credentials" });
      }

      // comapring the passwords entered by user currently i.e is password and password before entered that is user.password
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success=false
        return res.status(400).json({ success,error: "Please try to login with correct credentials" });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      success=true;
      res.json({ success,authToken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error occured");
    }
  }
);

// ROUTE 3 : Get logged in user details using :post api "/api/auth/getuser" - login required, adding fetchuser middleware
router.post("/getuser", fetchuser , async (req, res) => {
  try {
    userId = req.user.id ;
    // here selecting every data except password
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error occured");
  }
});

module.exports = router;
