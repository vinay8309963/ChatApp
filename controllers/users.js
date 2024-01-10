const bcrypt = require('bcrypt');
const User = require('../models/users');
const path = require('path')
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config();

const signup = (req, res)=>{
    console.log(req.body)
    const { name, email, password, phoneNumber } = req.body;
    const saltRounds = 10;
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            // Store hash in your password DB.
            console.log(hash)
            if(err){
                console.log('Unable to create new user')
                res.json({message: 'Unable to create new user'})
            }
            User.create({ name, email, phoneNumber, password: hash }).then(() => {
                res.status(201).json({message: 'Successfuly created new user'})
            }).catch(err => {
                res.status(403).json(err);
            })
        });
    });
}

function generateAccessToken(id) {
    return jwt.sign(id ,process.env.TOKEN_SECRET);
}

const login = (req, res) => {
    const { email, password } = req.body;
    console.log(password);
    User.findAll({ where : { email }}).then(user => {
        if(user.length > 0){
            bcrypt.compare(password, user[0].password, function(err, response) {
                if (err){
                console.log(err)
                return res.json({success: false, message: 'Something went wrong'})
                }
                if (response){
                    console.log(JSON.stringify(user))
                    const jwttoken = generateAccessToken(user[0].id);
                    console.log("web token is ")
                    console.log(jwttoken)
                    console.log(user[0].name)
                    res.status(200).json({token: jwttoken, userDetails: user[0].name, userId: user[0].id, success: true, message: 'Successfully Logged In'})
                // Send JWT
                } else {
                // response is OutgoingMessage object that server response http request
                return res.status(401).json({success: false, message: 'passwords do not match'});
                }
            });
        } else {
            return res.status(404).json({success: false, message: 'passwords do not match'})
        }
    })
}

module.exports = {
    signup,
    login
}

