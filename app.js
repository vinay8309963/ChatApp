const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
var cors = require('cors')

const sequelize = require('./util/database');

const userRoutes = require('./routes/user');

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

app.use('/user', userRoutes);

app.use((req,res) => {
    res.sendFile(path.join(__dirname,`views/${req.url}`))
})

sequelize.sync()
    .then(() => {
        console.log("server running on port  3000")
        app.listen(process.env.PORT || 3000);
    })
    .catch(err => {
        console.log(err);
    })