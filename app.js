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
const groupRoutes = require('./routes/group');

const app = express();


// app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use('/user', userRoutes);

app.use('/groups', groupRoutes);


const multer = require('multer');

const authenticatemiddleware = require('./middleware/auth');

const s3Services = require('./services/s3Services');

const storage = multer.memoryStorage(); // Store the file in memory

const upload = multer({ storage: storage });
const Message = require('./models/messages');

app.post('/chat/sendMessage', authenticatemiddleware.authenticate, upload.single('file'),  async (req, res) => {
  try {
      const userName = req.user.name;
      const userId = req.user.id;
      const groupId = req.body.groupId;
      
      const newmessage = req.body.message;

      console.log('Hi')
      console.log(req.body)
      console.log(userName)
      console.log(userId)
      // console.log(req.file)
      console.log(newmessage)
      console.log(groupId);

      // Use req.file.buffer to access the file buffer
      const file = req.file;

      // Generate a unique filename based on userId and timestamp
      // const filename = `file${userId}/${new Date().getTime()}_${req.file.originalname}`;
      // const fileURL = await s3Services.uploadToS3(fileBuffer, filename);

      let msg = null;
      console.log(file);
      if (newmessage) {
          console.log("Got Message")
          msg = await Message.create({
              name: req.user.name,
              message: newmessage,
              userId: req.user.id,
              groupId: groupId,
              type: 'msg'
          });
      }



      let fileURL = null;
      // console.log(file.size)
      // console.log("mmmkkkk")
      // console.log(file.mimetype)
      if (file && file !== undefined && file.size>0) {
          console.log("Got file")
          const userId = req.user.id;
          console.log(userId)
          const filename = `chatImage${userId}/${new Date()}.jpg`;
          console.log(filename)
          fileURL = await s3Services.uploadToS3(file, filename);
          console.log(fileURL)
          msg = await Message.create({
              name: req.user.name,
              message: fileURL,
              userId: req.user.id,
              groupId: groupId,
              type: file.mimetype
          });
      }

      console.log('hey');
      console.log(msg);
      
      // Create message in your database (you might need to adjust this part)
      // const msg = await Message.create({ name: userName, message: message, userId: userId, groupId: groupId });
      
      return res.status(200).json({ messages: msg, message: "Message sent successfully" });
  } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: "Internal Server Error" });
  }
})

app.use('/chat', chatRoutes);

app.use((req,res)=> {
    res.sendFile(path.join(__dirname, `views/${req.url}`))
})

const Group = require('./models/group');
const User = require('./models/users');
const Messages = require('./models/messages');
const UserGroup = require('./models/usergroup');

User.hasMany(Messages);
Messages.belongsTo(User);

Group.belongsToMany(User, { through: UserGroup });
User.belongsToMany(Group, { through: UserGroup });

Group.hasMany(Messages);
Messages.belongsTo(Group);


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