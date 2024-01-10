const Group = require('../models/group');
const User = require('../models/users');
const UserGroup = require('../models/usergroup');

exports.getUsers = async (req, res, next) => {
    try {
      const users = await User.findAll();
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  };

exports.createGroup = async (req, res, next) => {
  const { groupName, users, currentUser } = req.body;

  try {
    const group = await Group.create({ name: groupName });
    const usersToAdd = await User.findAll({ where: { id: users.split(',') } });
    const user = currentUser;

    const userConnectGroup = await UserGroup.create({
      userId: user,
      groupId: group.id,
      isAdmin: true // Set the user as admin for this group
    });

    console.log(userConnectGroup);

    await group.addUsers(usersToAdd);

    res.status(201).json({ message: 'Group created successfully' , createdGroup : group, usergroupDetails: userConnectGroup });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create group' });
  }
};

exports.getGroups = async (req, res, next) => {
  try {
    const groups = await Group.findAll();
    res.status(200).json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch groups' });
  }
};

exports.deleteGroup = async (req, res, next) => {
  const groupId = req.params.groupId;

  try {
    const group = await Group.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    await group.destroy();

    res.status(200).json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete group' });
  }
};

exports.getGroupsForUser = async (req, res, next) => {
  const userId = req.params.userId; // Assuming you receive the user ID from the request

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const groupsNames = [];
    const userGroups = await user.getGroups(); // Retrieve groups associated with the user
    userGroups.forEach(userGroup => {
      const name = userGroup.name;
      const id = userGroup.id;
      groupsNames.push({name,id});
    })
    res.status(200).json(groupsNames);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch groups for the user' });
  }
};

// exports.getUsersInGroup = async (req, res, next) => {
//   const groupId = req.params.groupId; // Assuming you receive the group ID from the request

//   try {
//     const group = await Group.findByPk(groupId, {
//       include: [{
//         model: User,
//         attributes: [ 'name' ] // Fetch only necessary user attributes
//       }]
//     });

//     if (!group) {
//       return res.status(404).json({ message: 'Group not found' });
//     }

//     const usersInGroup = group.Users;
//     console.log(usersInGroup)
//     res.status(200).json(usersInGroup);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Failed to fetch users in the group' });
//   }
// };

// exports.getUsersInGroups = async (req, res, next) => {
//   const  groupId  = req.params.groupId; // Extract groupId from request parameters

//   try {
//     // Find the group by ID including associated users
//     const group = await Group.findByPk(groupId, {
//       include: {
//         model: User,
//         through: 'UserGroup' // Make sure this matches your association name in your model definition
//       }
//     });

//     if (!group) {
//       console.log('Group not found');
//       return res.status(404).json({ message: 'Group not found' });
//     }

//     // Access the users associated with the group
//     const usersInGroup = await group.getUsers(); // Assuming you've defined the association as 'Users'
//     console.log(usersInGroup)
//     return res.status(200).json(usersInGroup);
//   } catch (error) {
//     console.error('Error fetching users in group:', error);
//     return res.status(500).json({ message: 'Error fetching users in group' });
//   }
// };

exports.getUsersInGroups = async (req, res, next) => {
  const groupId = req.params.groupId; // Extract groupId from request parameters

  try {
    // Find the group by ID including associated users with their admin status
    const group = await Group.findByPk(groupId, {
      include: [
        {
          model: User,
          through: {
            model: UserGroup,
            attributes: ['isAdmin'] // Include 'isAdmin' attribute from the UserGroup association
          },
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!group) {
      console.log('Group not found');
      return res.status(404).json({ message: 'Group not found' });
    }

    const groupUsers = await group.getUsers();
    // console.log('Group users')
    // console.log(groupUsers)

    // Check if group.Users is defined before trying to access it
    if (!groupUsers || !Array.isArray(groupUsers)) {
      console.log('Users not found in the group');
      return res.status(404).json({ message: 'Users not found in the group' });
    }

    // Access the users associated with the group along with their admin status
    const usersInGroup = groupUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      // Add the 'isAdmin' property obtained from the UserGroup association
      isAdmin: user.usergroup ? user.usergroup.isAdmin : false 
    }));

    // console.log('Admin')
    // console.log( usersInGroup[0]);
    return res.status(200).json(usersInGroup);
  } catch (error) {
    console.error('Error fetching users in group:', error);
    return res.status(500).json({ message: 'Error fetching users in group' });
  }
};

exports.isCurrentUserAdmin = async (req,res,next) => {
  const groupId = req.params.groupId;
  const userId = req.params.userId;

  try{
    const isAdmin = await UserGroup.findOne({
      where: {
        userId: userId,
        groupId: groupId,
        isAdmin: true // Check if the user is an admin for this group
      }
    });
  
    if (isAdmin) {
      console.log(`User with ID ${userId} is an admin for Group ID ${groupId}`);
      // Return true or perform desired action if the user is an admin
      return res.status(200).json(true);
    } else {
      console.log(`User with ID ${userId} is not an admin for Group ID ${groupId}`);
      // Return false or perform desired action if the user is not an admin
      return res.status(200).json(false);
    }
  }catch(error){
    console.error('Error checking user admin status:', error);
    return res.status(500).json({ message: 'Error Detecting if user is admin or not' });
  }
}

exports.addNewsUserToGroup = async (req,res,next) => {
  try {
    const { groupId } = req.params;
    const { userIds } = req.body;
    console.log('NewUsersIds')
    console.log(userIds)

    // Find the group by ID
    const group = await Group.findByPk(groupId);

    console.log(group);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Find users by their IDs
    const usersToAdd = await User.findAll({ where: { id: userIds } });
    console.log('NewUsers')
    console.log(usersToAdd);
    if (!usersToAdd || usersToAdd.length === 0) {
      return res.status(404).json({ error: 'Users not found' });
    }

    // Add users to the group using the association defined in your models
    await group.addUsers(usersToAdd);

    res.status(200).json({ message: 'Users added to the group successfully' });
  } catch (error) {
    console.error('Error adding users to the group:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

exports.removeUserfromGroup = async (req,res,next) => {
  try {
    const { groupId, userId } = req.params;

    // Check if the group and user exist
    const group = await Group.findByPk(groupId);
    const user = await User.findByPk(userId);

    if (!group || !user) {
      return res.status(404).json({ error: 'Group or user not found' });
    }

    // Check if the user belongs to the group
    const userToRemove = await UserGroup.findOne({
      where: {
        groupId: groupId,
        userId: userId,
      },
    });

    if (!userToRemove) {
      return res.status(404).json({ error: 'User is not part of the group' });
    }

    // Remove the user from the group
    await userToRemove.destroy();

    res.status(200).json({ message: 'User removed from the group successfully' });
  } catch (error) {
    console.error('Error removing user from the group:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}



