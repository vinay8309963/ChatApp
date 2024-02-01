const Message = require('../models/messages');
const User = require('../models/users');

const Archive = require('../models/archieve')
const { Op } = require('sequelize');

process.env.TZ = 'Asia/Kolkata';

////////// Cron job //////////
const cron = require('node-cron');
// Schedule a task to run every minute
cron.schedule('0 0 * * *', () => {
    console.log('Running a task every minute');
    const istDate = new Date();
    const oneDayAgo = new Date(istDate.getTime() + (5.5 * 60 * 60 * 1000));
    console.log(istDate)
    oneDayAgo.setDate(oneDayAgo.getDate() -1);
    console.log(oneDayAgo)

    Message.findAll({
        where: {
          createdAt: {
            // [Op.between]: [oneDayAgo, new Date()] // Find rows created between one day ago and now
            [Op.lt]: oneDayAgo // Find rows created before one day ago
          }
        }
      })
      .then(async messages => {
        console.log("heheheheheheheheh")
        console.log(messages); // Messages created before one day ago

        for (const message of messages) {
            console.log(message.updatedAt)
            await Archive.create({
              name: message.name,
              message: message.message,
              type: message.type,
              userId: message.userId,
              groupId: message.groupId,
              createdAt: message.createdAt,
              updatedAt: message.updatedAt
            });
      
            // Delete the message from the original table
            await message.destroy();
          }

      })
      .catch(error => {
        console.error('Error retrieving messages:', error);
      });
},
null, // onComplete
true, // start
'Asia/Kolkata');

const getMessages = async (req, res, next) => {
    const messages = await Message.findAll()
    // console.log(messages)
    return res.status(200).json({ messages: messages, message: "Messages fetched successfully" })
}

// const sendMessage = async (req, res, next) => {
//   console.log(req.file);
//   console.log(req.body);
//     try {
//         const userName = req.user.name
//         const userId = req.user.id
//         const groupId = req.body.gId
//         // console.log(userName)
//         const message  = req.body.message
//         // console.log(message)
//         const msg = await Message.create({ name: userName, message: message, userId: userId, groupId: groupId })
//         return res.status(200).json({messages: msg, message: "message sent Successfully"})
//     } catch {
//         throw new Error("something went wrong while sending the message")
//     }
// }

const getUsers = async (req, res, next) => {
    const users = await User.findAll()
    // console.log(users)
    return res.status(200).json({ you : req.user.dataValues.name, users: users, message: "Users fetched successfully" })
}

// const getGroupMessages = async (req,res,next) => {
//     console.log('Groups messages called')
//     const id = req.params.id;
//     console.log(id)
//     const messages = await Message.findAll({
//         where: { groupId },
//       include: [{
//         model: User, // Assuming there is a User model associated with messages
//         attributes: ['id', 'name'], // Fetch only necessary user attributes
//       }],
//     })
//     console.log(messages)
//     return res.status(200).json({ messages: messages, message: "Messages fetched successfully" })
// }

const getGroupMessages = async (req, res, next) => {
    // console.log('Groups messages called');
    const id = req.params.id;
    // console.log(id);
  
    try {
      // Find messages for the specific group along with associated users
      // console.log('I am called')
      const groupMessages = await Message.findAll({
        where: { groupId: id },
        include: [
          {
            model: User,
            // through: 'UserGroup' // Assuming the through table name is 'UserGroup'
          }
        ]
      });
  
      // console.log(groupMessages);
  
      return res.status(200).json({
        messages: groupMessages,
        message: 'Messages fetched successfully'
      });
    } catch (error) {
      console.error('Failed to fetch group messages:', error);
      return res.status(500).json({ error: 'Failed to fetch group messages' });
    }
  };
  

const getGroupUsers = async (req,res,next) => {
    try {
        const groupId = req.params.id; // Assuming the group ID is passed in the request params
        // Fetch users associated with the group using Sequelize associations
        const usersInGroup = await User.findAll({
            include: [{
                model: Message,
                where: { groupId },
                attributes: [], // Fetch users only, no attributes from Message model
                through: { attributes: [] } // If using a many-to-many association
            }]
        });

        // If using a direct association between User and Group
        // const usersInGroup = await User.findAll({
        //     where: { groupId },
        // });

        console.log(usersInGroup);
        return res.status(200).json({ users: usersInGroup, message: "Users in group fetched successfully" });
    } catch (error) {
        console.error('Failed to fetch users in group:', error);
        return res.status(500).json({ error: 'Failed to fetch users in group' });
    }
}



module.exports = {
    getMessages,
    // sendMessage,
    getUsers,
    getGroupMessages,
    getGroupUsers
}