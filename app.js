const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
var cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = require('./util/database');

const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

app.use('/user', userRoutes);
app.use('/chat', chatRoutes);

app.use((req,res)=> {
    res.sendFile(path.join(__dirname, `views/${req.url}`))
})

// Sync Sequelize models with the database
sequelize.sync({ force: false })
  .then(() => {
    console.log('Database synced');
  })
  .catch(err => {
    console.error('Unable to sync database:', err);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});