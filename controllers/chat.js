const Message = require('../models/messages');
const jwt = require('jsonwebtoken');
const User = require('../models/users')
const sequelize = require('../util/database');
const { use } = require('../routes/user');

const getMessages = async (req, res, next) => {
    const messages = await Message.findAll()
    console.log(messages)
    return res.status(200).json({ messages: messages, message: "Messages fetched successfully" })
}

const sendMessage = async (req, res, next) => {
    try {
        console.log(req.user.dataValues.name)
        const { message } = req.body
        const msg = await Message.create({ name: req.user.dataValues.name, message: message,userId: req.user.dataValues.id })
        return res.status(200).json({messages: msg, message: "message sent Successfully"})
    } catch {
        throw new Error("something went wrong while sending the message")
    }
}

const getUsers = async (req, res, next) => {
    const users = await User.findAll()
    console.log(users)
    return res.status(200).json({ you : req.user.dataValues.name, users: users, message: "Users fetched successfully" })
}
module.exports = {
    getMessages,
    sendMessage,
    getUsers
}