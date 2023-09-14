const jwt = require('jsonwebtoken');
const JWT_SECRET = "kartarUsingJWTForFirstTime$";

// basically middleware is helpers between web server and web application
const fetchuser = (req,res,next) =>{
    // get the user from jwt token and id to req object

    const token = req.header('auth-token');
    // console.log(req.header('auth-token'));
    if(!token){
        res.status(401).send({error: "Please authenticate with proper token"})
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
    // pass control to next middleware or route handler
        next();
    } catch (error) {
        res.status(401).send({error: "Please authenticate with proper token"})
    }
}

module.exports = fetchuser;