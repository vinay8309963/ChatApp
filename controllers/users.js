const bcrypt = require('bcrypt');
const User = require('../models/users');
const path = require('path')
const dotenv = require('dotenv');
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

module.exports = {
    signup
}

