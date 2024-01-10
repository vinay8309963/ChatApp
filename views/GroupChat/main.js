const token = localStorage.getItem('token');
const userName = localStorage.getItem('userName');
const userId = localStorage.getItem('userId');
let gName;
var gId;

// Function to search users based on input
function searchUsers() {
  const searchInput = document.getElementById('userSearch').value.toLowerCase();
  const users = document.querySelectorAll('#usersContainer div');
  
  users.forEach(user => {
    const username = user.textContent.toLowerCase();
    if (username.includes(searchInput)) {
      user.style.display = 'block'; // Show matching users
    } else {
      user.style.display = 'none'; // Hide non-matching users
    }
  });
}


// Function to create and show the emoji picker
function showEmojiPicker() {
  const emojiPicker = new EmojiPicker({
    // Customize the emoji picker as needed
    autoFocus: true,
    showPreview: false,
    showSearch: true,
    onSelect: (emoji) => {
      const messageInput = document.getElementById('message');
      messageInput.value += emoji.native; // Append the selected emoji to the message input field
    },
  });

  // Add the emoji picker to a specific container or element
  emojiPicker.openPicker(); // Show the emoji picker
}

// Add event listener to emoji button/icon
const emojiButton = document.getElementById('emojiButton');
emojiButton.addEventListener('click', showEmojiPicker);

// Fetch users from the backend
async function fetchUsers() {
    try {
      const response = await axios.get('/groups/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
  
  // Function to display users for selection
  async function displayUsers() {
    const usersContainer = document.getElementById('usersContainer');
    usersContainer.innerHTML = '';
  
    try {
      const users = await fetchUsers();
      users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.innerHTML = `
          <input type="checkbox" name="selectedUsers" value="${user.id}">
          <label>${user.name}</label>
        `;
        usersContainer.appendChild(userDiv);
      });
    } catch (error) {
      console.error('Failed to display users:', error);
    }
    autoSelectCurrentUser();//Autoselecting current user
  }
  
  const createGroupBtn = document.getElementById('createGroupBtn');
  const createGroupPopup = document.getElementById('createGroupPopup');

  // Function to toggle create group popup visibility
  function toggleCreateGroupPopup() {
    createGroupPopup.style.display = createGroupPopup.style.display === 'block' ? 'none' : 'block';
  }

  // Event listener for createGroupBtn click
  createGroupBtn.addEventListener('click', () => {
    createGroupPopup.style.display = 'block';
    displayUsers(); // Display users in the popup
  });
  
  // Function to submit group creation
  async function submitCreateGroup(event) {
    event.preventDefault();
    const groupName = document.getElementById('groupName').value;
    console.log(groupName);
  
    const currentUser = userId; // Function to get the current user's ID or information
  
    const selectedUsers = [currentUser]; // Add the current user as the initial selected user
  

    const checkboxes = document.querySelectorAll('input[name="selectedUsers"]');
    checkboxes.forEach(checkbox => {
      console.log(checkbox.value)
      if (checkbox.checked && checkbox.value !== currentUser) {
        selectedUsers.push(checkbox.value);
      }
      checkbox.disabled = checkbox.value === currentUser; // Disable checkboxes for the current user
      checkbox.checked = checkbox.value === currentUser; // Check checkboxes for the current user
    });
  
    try {
      const response = await axios.post('/groups/create-group', {
        currentUser,
        groupName,
        users: selectedUsers.join(',')
      });
  
      alert('Group created successfully!');
    } catch (error) {
      console.error('Failed to create group:', error);
      alert('Failed to create group. Please try again.');
    }

    toggleCreateGroupPopup();
  }

  //Auto select current user
  function autoSelectCurrentUser() {
    const currentUser = userId; // Get the current user's ID
    const currentUserCheckbox = document.querySelector(`input[name="selectedUsers"][value="${currentUser}"]`);
    
    if (currentUserCheckbox) {
      currentUserCheckbox.checked = true; // Auto-select the current user if found in the checkboxes
      currentUserCheckbox.disabled = true; // Disable the checkbox for the current user
    }
  }

  // For showing groups
  async function fetchGroups() {
    try {
      const response = await axios.get('/groups/groups');
      return response.data;
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
  }

  //Showing groups of the user in which he is present
  async function fetchGroupsForUser(userId) {
    try {
      const response = await axios.get(`/groups/users/${userId}`); // Replace the endpoint with your actual route
      const userGroups = response.data;
  
      // Process the userGroups data (e.g., display in the UI)
      console.log('Groups for user:', userGroups);
      return userGroups;
      // Add your logic to display groups for the user in the UI
    } catch (error) {
      console.error('Error fetching groups for user:', error);
      // Handle errors or display error messages in the UI
    }
  }
  
  // Call the function to fetch groups for the specified user
  fetchGroupsForUser(userId);
  
  //Deleting groups
  async function deleteGroup(groupId) {
    try {
      await axios.delete(`/groups/groups/${groupId}`);
      alert('Group deleted successfully!');
      displayGroups();
    } catch (error) {
      console.error('Failed to delete group:', error);
      alert('Failed to delete group. Please try again.');
    }
  }
  
  async function displayGroups() {
    const groupsContainer = document.getElementById('groupsContainer');
    groupsContainer.innerHTML = '';

    try {
      const groups = await fetchGroupsForUser(userId);
      
      const groupsList = document.createElement('ul');
      groupsList.classList.add('groups-list');

      groups.forEach(group => {
        const groupItem = document.createElement('div');
        groupItem.classList.add('group-item'); // Add a class for styling

        const groupButton = document.createElement('button');
        groupButton.id = group.id;
        groupButton.textContent = group.name;
        groupButton.onclick = function(e) {
            localStorage.setItem('group', new XMLSerializer().serializeToString(e.target));
            console.log(e.target);
            groupMessages(e.target);
        };
        
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'; // Font Awesome delete icon
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this group?')) {
                deleteGroup(group.id);
                groupItem.remove(); // Remove the deleted group from the list
            }
        });

        groupItem.appendChild(groupButton);
        groupItem.appendChild(deleteButton);
        groupsContainer.appendChild(groupItem);
    });
  } catch (error) {
    console.error('Failed to display groups:', error);
  }
}

//Display GroupMessages and showing users present in the group
async function groupMessages(group){
  console.log(group.id)

  const groupId = group.id;
  gId = group.id;

  let usersListVisible = false; // Track the visibility of the users' list

  try {
    const groupDetails = await axios.get(`/chat/messages/${groupId}`, {
      headers: { 'Authorization': token }
    })

    const groupname = document.getElementById('username');
    groupname.textContent = group.textContent;
    
    displayingJoinedMessage();
    
    // Add users icon beside the group name
    const usersIcon = document.createElement('i');
    usersIcon.classList.add('fas', 'fa-users'); // Font Awesome users icon class
    usersIcon.style.marginLeft = '5px'; // Adjust margin as needed

    groupname.appendChild(usersIcon); // Append the icon to the group name element
    const menuIcon = document.createElement('i');
    menuIcon.classList.add('fas', 'fa-bars', 'menu-icon'); // Add Font Awesome classes for the bars icon
    menuIcon.style.marginLeft = '10px'; 

    // Append the menu icon to the groupname container
    groupname.appendChild(menuIcon);

//     // Create a wrapper for icons to use flexbox for alignment
// const iconsWrapper = document.createElement('div');
// iconsWrapper.style.display = 'flex';
// iconsWrapper.style.alignItems = 'center'; // Align icons vertically centered

// // Create the users icon
// const usersIcon = document.createElement('i');
// usersIcon.classList.add('fas', 'fa-users'); // Font Awesome users icon class
// usersIcon.style.marginLeft = 'auto'; // Push the icon to the right by using auto margin

// // Create the menu icon
// const menuIcon = document.createElement('i');
// menuIcon.classList.add('fas', 'fa-bars', 'menu-icon'); // Font Awesome bars icon class

// // Append icons to the wrapper
// iconsWrapper.appendChild(usersIcon);
// iconsWrapper.appendChild(menuIcon);

    const messagesContainer = document.getElementById('messages');
    messagesContainer.innerHTML = '';

    groupDetails.data.messages.forEach(message => {
      const messageElement = document.createElement('div');
      messageElement.classList.add('message');
  
      if (message.name === userName) {
        messageElement.classList.add('own-message');
        messageElement.textContent = `${message.message}`;
      } else {
        messageElement.classList.add('other-message');
        messageElement.textContent = `${message.name}: ${message.message}`;
      }
  
      messagesContainer.appendChild(messageElement);
      scrollToBottom();
    });

    

   // Function to create and display the users' list
   async function displayUsersList(groupId) {
    
    try {
      const groupUsers = await axios.get(`/groups/${groupId}/users`, {
        headers: { 'Authorization': token }
      });
  
      const usersListContainer = document.createElement('div');
      usersListContainer.classList.add('users-list-container');
  
      const searchInput = document.createElement('input');
      searchInput.setAttribute('type', 'text');
      searchInput.setAttribute('placeholder', 'Search users');
      searchInput.addEventListener('input', function () {
        filterUsers(this.value.toLowerCase());
      });
  
      usersListContainer.appendChild(searchInput);

      const isAdmin = await isCurrentUserAdmin(groupId, userId);

      if (isAdmin) {
        console.log('admin')
        const addUsersButton = document.createElement('button');
        addUsersButton.textContent = 'Add Users';
        addUsersButton.classList.add('add-users-button');
        // Function to handle the "Add Users" button click event
        addUsersButton.addEventListener('click', async () => {
          const allUsers = await fetchUsers(); // Fetch all users from the backend
          const groupUsers = await axios.get(`/groups/${groupId}/users`, {
            headers: { 'Authorization': token }
          });
          const usersInGroup = groupUsers.data; // Get users already in the group

          const modalContainer = document.createElement('div');
          modalContainer.classList.add('modal-container');

          // Create a modal or a dropdown
          const modal = document.createElement('div');
          modal.classList.add('modal'); // Apply necessary CSS styles to create a modal
          modalContainer.appendChild(modal);

          // Create a header for the modal
          const modalHeader = document.createElement('div');
          modalHeader.classList.add('modal-header');
          modalHeader.textContent = 'Select Users to Add';
          modal.appendChild(modalHeader);

          // Create a close icon button to close the modal
          const closeIcon = document.createElement('i');
          closeIcon.classList.add('fas', 'fa-times', 'close-icon');
          closeIcon.addEventListener('click', () => {
            modalContainer.remove();
          });

          modalHeader.appendChild(closeIcon);
        
          // Create a search input for filtering users
          const searchInput = document.createElement('input');
          searchInput.type = 'text';
          searchInput.placeholder = 'Search users...';
          searchInput.addEventListener('input', () => {
            const searchText = searchInput.value.toLowerCase();
            const userRows = modal.querySelectorAll('.user-row');
            userRows.forEach(userRow => {
              const label = userRow.querySelector('label');
              const userName = label.textContent.toLowerCase();
              if (userName.includes(searchText)) {
                userRow.style.display = 'block';
              } else {
                userRow.style.display = 'none';
              }
            });
          });

          modalHeader.appendChild(searchInput);
          modal.appendChild(modalHeader);

          // Iterate through all users
          allUsers.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.classList.add('user-row');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = user.id;
            checkbox.id = `user_${user.id}`;
            // Check if the user is already in the group and auto-select
            if (usersInGroup.some(groupUser => groupUser.id === user.id)) {
              checkbox.checked = true;
              checkbox.disabled = true;
            }

            const label = document.createElement('label');
            label.textContent = user.name;
            label.setAttribute('for', `user_${user.id}`);

            modal.appendChild(checkbox);
            modal.appendChild(label);
            // Add line breaks, additional styling, or structure as needed

            modal.appendChild(userDiv);
          });

          // Create a button to confirm selected users
          const confirmButton = document.createElement('button');
          confirmButton.textContent = 'Add Selected Users';
          confirmButton.classList.add('confirm-button');
          confirmButton.addEventListener('click', async () => {
            const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
            const selectedUserIds = Array.from(checkboxes)
              .filter(checkbox => checkbox.checked)
              .map(checkbox => checkbox.value);

            // Logic to add selected users to the group
            if (selectedUserIds.length > 0) {
              // Perform an operation to add the selected users to the group
              // For instance, make a request to your backend API to update the group with selected users
              // Example using axios
              const newUsers = await axios.post(`/groups/${groupId}/add-users`, { userIds: selectedUserIds }, {
                headers: { 'Authorization': token }
              });
            } else {
              // Handle case where no users are selected
              console.log('No new users selected to add.');
              // Optionally display a message or take appropriate action
            }

            // Close the modal after adding users
            modalContainer.remove();
          });

          // Display the modal to select users
          // Append modal to the document body or specific container element
          document.body.appendChild(modalContainer);
          modal.appendChild(confirmButton);

          // Append the "Add Users" button to the desired container
          const usersListContainer = document.getElementById('usersListContainer');
          usersListContainer.appendChild(addUsersButton);
        });
        
  
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');
        buttonContainer.appendChild(addUsersButton);
  
        // Style to position the button to the right using Flexbox
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'flex-end';
        buttonContainer.style.marginTop = '10px'; // Add margin as needed
  
        usersListContainer.appendChild(buttonContainer);
      }
  
      const usersList = document.createElement('ul');
      usersList.classList.add('users-list');
      usersListContainer.appendChild(usersList);
  
      messagesContainer.innerHTML = '';
      messagesContainer.appendChild(usersListContainer);
  
      // Function to filter and display users
      const filterUsers = (searchTerm) => {
        const filteredUsers = groupUsers.data.filter(user => {
          return user.name.toLowerCase().includes(searchTerm);
        });
        renderUsers(filteredUsers);
      };
  
      // Function to render users
      const renderUsers = (users) => {
        usersList.innerHTML = '';
  
        users.forEach(user => {
          const userItem = document.createElement('li');
          userItem.textContent = user.name;
  
          // Display admin tag next to the user name if the user is an admin
          if (user.isAdmin) {
            const adminTag = document.createElement('span');
            adminTag.textContent = '(Admin)';
            adminTag.classList.add('admin-tag');
            userItem.appendChild(adminTag);
          }

          // Add a click event listener to each user item
          userItem.addEventListener('click', () => {
            // Check if the clicked user is an admin
            if (user.isAdmin) {
              alert('You are an admin. Cannot delete yourself from the group.');
              return; // Prevent admin from deleting themselves
            }

            // Ask for confirmation before deletion
            const confirmation = confirm(`Are you sure you want to delete ${user.name} from the group?`);

            if (confirmation) {
              // Logic to delete the user from the group
              deleteUserFromGroup(user.id);
            } else {
              // Handle cancellation
              alert('Deletion cancelled');
            }
          });

          // Function to delete the user from the group
          const deleteUserFromGroup = async (userId) => {
            try {
              // Make a DELETE request to the backend API to remove the user from the group
              const response = await fetch(`/groups/${groupId}/remove-user/${userId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  // Add other necessary headers (e.g., authorization headers if needed)
                },
              });

              const data = await response.json();

              // Handle success or error messages
              if (response.ok) {
                console.log(data.message);
                // Perform actions after successful deletion (update UI, etc.)
              } else {
                console.error(data.error);
                // Handle error messages (display error to the user or perform other actions)
              }
            } catch (error) {
              console.error('Error deleting user from the group:', error);
              // Handle network errors or other exceptions
            }
          };

          usersList.appendChild(userItem);
        });
      };
  
      console.log(groupUsers.data);
      renderUsers(groupUsers.data);
  
    } catch (error) {
      console.error('Failed to fetch group users:', error);
    }
  }

  // Logic to check if currentUser is an admin for the group
  async function isCurrentUserAdmin(groupId, userId) {
    try {
      console.log('Hi')
      const response = await axios.get(`/groups/${groupId}/users/${userId}`); // Replace with your endpoint
      console.log('hi')
      console.log(response);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  }

  
  // Toggle the users' list visibility when clicking the users icon
  usersIcon.addEventListener('click', () => {
    if (!usersListVisible) {
      displayUsersList(groupId); // Display users' list if not visible
      usersListVisible = true; // Update visibility flag
    } else {
      messagesContainer.innerHTML = ''; // Hide users' list if visible
      usersListVisible = false; // Update visibility flag
    }
  });

  } catch (error) {
    console.error('Failed to display group messages:', error);
  }
}

async function displayingJoinedMessage(){

  const storedGroup = localStorage.getItem('group');

    // Convert the string representation back to an HTML element
    const parser = new DOMParser();
    const group = parser.parseFromString(storedGroup, 'text/html').body.firstChild;
    const groupId = group.id;
  
  const groupUsers = await axios.get(`/groups/${groupId}/users`, {
    headers: { 'Authorization': token }
  });

      const usersAddedContainer = document.getElementById('users-added');
      usersAddedContainer.innerHTML = '';

      groupUsers.data.forEach(groupUser => {
        const userElement = document.createElement('div');
        userElement.classList.add('message');
    
        if (groupUser.name === userName) {
          userElement.classList.add('own-message');
          userElement.textContent = `${groupUser.name} was Added`;
        } else {
          userElement.classList.add('other-message');
          userElement.textContent = `${groupUser.name} was Added`;
        }
    
        usersAddedContainer.appendChild(userElement);
      })
}

let groupsVisible = false; // Track the visibility status

function showGroups() {
  const groupsContainer = document.getElementById('groupsContainer');

  // Toggle visibility
  groupsVisible = !groupsVisible;

  if (groupsVisible) {
    displayGroups(); // Fetch and display groups if they are not yet displayed
    groupsContainer.style.display = 'block'; // Show groups container
  } else {
    groupsContainer.style.display = 'none'; // Hide groups container
  }
}

// Function to scroll to the bottom of the messages container
function scrollToBottom() {
  const messagesContainer = document.getElementById('messages');
  const lastMessage = messagesContainer.lastElementChild;

    if (lastMessage) {
        lastMessage.scrollIntoView({
            behavior: "smooth",
            block: "end"
        });
    }
}

async function sendMessage(event) {
  event.preventDefault();
  const messageInput = document.getElementById('message');
  const messageText = messageInput.value;
  
  try {
    await axios.post('http://localhost:3000/chat/sendMessage', {
      message: messageText,
      gId : gId
    }, {
      headers: { 'Authorization': token }
    });

    messageInput.value = '';

    const storedGroup = localStorage.getItem('group');

    // Convert the string representation back to an HTML element
    const parser = new DOMParser();
    const group = parser.parseFromString(storedGroup, 'text/html').body.firstChild;
    
    console.log(group);
    await groupMessages(group);
    scrollToBottom();
    // setInterval(() => {
    //   groupMessages(group);
    // },1000);
    
  } catch (error) {
    console.error('Failed to send message:', error);
  }
}

async function displayMessages() {
  try {
    const response = await axios.get('http://localhost:3000/chat/getMessages', {
      headers: { 'Authorization': token }
    });

    const messagesContainer = document.getElementById('messages');
    messagesContainer.innerHTML = '';

    response.data.messages.forEach(message => {
      const messageElement = document.createElement('div');
      messageElement.textContent = (message.name == userName) ? `You: ${message.message}` : `${message.name}: ${message.message}`;
      messagesContainer.appendChild(messageElement);
    });

    scrollToBottom();
  } catch (error) {
    console.error('Failed to get messages:', error);
  }
}



async function getUsers() {
  try {
    const response = await axios.get('http://localhost:3000/chat/getUsers', {
      headers: { 'Authorization': token }
    });

    document.getElementById('username').innerHTML = `<strong>Hi, ${response.data.you}</strong>.<br> Welcome To Group Chat`;
    
    // response.data.users.forEach(user => {
    //   const parentElement = document.getElementById('messages');
    //   const newRow = document.createElement('tr');
    //   newRow.setAttribute('id', `user-${user.id}`);
      
    //   if (response.data.you === user.name) {
    //     newRow.innerHTML = `<td>You joined</td>`;
    //   } else {
    //     newRow.innerHTML = `<td>${user.name} joined</td>`;
    //   }
      
    //   parentElement.appendChild(newRow);
    // });

    return 1; // Resolve the promise with 1 for success
  } catch (error) {
    document.body.innerHTML += `<div style="color:red;">${error} <div>`;
    return 0; // Reject the promise with 0 for failure
  }
}

async function initChat() {
  try {
    const storedGroup = localStorage.getItem('group');

    // Convert the string representation back to an HTML element
    const parser = new DOMParser();
    const group = parser.parseFromString(storedGroup, 'text/html').body.firstChild;
    await getUsers();
    
    scrollToBottom();
  } catch (error) {
    console.error('Failed to initialize chat:', error);
  }
}



window.onload = () => {
  initChat();
}






  

  
  
  
  
  
