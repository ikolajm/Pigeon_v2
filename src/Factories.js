const uuid = require('uuid');
const moment = require('moment');

// Create User
const createUser = ({name = '', socketId = null}) => ({
    id: uuid(),
    name,
    socketId
})

// Create Message
const createMessage = ({message = '', sender = ''}) => ({
    id: uuid(),
    time: moment(new Date(Date.now())).format('LT'),
    message,
    sender
})

// Create Chat
const createChat = ( {messages = [], name = 'Global', users = [], isGlobal = false } = {} ) => ({
    id: uuid(),
    name,
    messages,
    users,
    typingUsers: [],
    isGlobal
})

const createChatFromUsers = (users, excludedUser = "") => {
    return users.filter(u => u !== excludedUser).join(', ') || "Global";
}

module.exports = {
    createUser,
    createMessage,
    createChat,
    createChatFromUsers
}