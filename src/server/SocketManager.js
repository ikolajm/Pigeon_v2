
const { VERIFY_USER, USER_CONNECTED, LOGOUT, USER_DISCONNECTED, COMMUNITY_CHAT, MESSAGE_RECEIVED, MESSAGE_SENT, TYPING, PRIVATE_MESSAGE, NEW_CHAT_USER, USER_SEARCH } = require('../Events');
const { createUser, createMessage, createChat } = require('../Factories');
const io = require('./index').io

let connectedUsers = {};

let globalChat = createChat({ isGlobal: true })

module.exports = socket => {
    let sendTypingFromUser;
    let sendMessageToChatFromUser;

    // Verify username
    socket.on(VERIFY_USER, (name, callback) => {
        if (isUser(connectedUsers, name)) {
            callback({ isUser: true, user: null })
        } else {
            callback({isUser: false, user: createUser({name, socketId: socket.id})})
        }
    })

    // User connect with username
    socket.on(USER_CONNECTED, user => {
        user.socketId = socket.id;
        connectedUsers = addUser(connectedUsers, user)
        socket.user = user
        sendMessageToChatFromUser = sendMessageToChat(user.name)
        sendTypingFromUser = sendTypingToChat(user.name)
        io.emit(USER_CONNECTED, connectedUsers);
    })

    // User disconnect
    socket.on('disconnect', () => {
        if ("user" in socket) {
            connectedUsers = removeUser(connectedUsers, socket.user.name)
            io.emit(USER_DISCONNECTED, connectedUsers)
        }
    })

    // User logout
    socket.on(LOGOUT, () => {
        console.log(socket.user.name + ' has disconnected!')
        connectedUsers = removeUser(connectedUsers, socket.user.name)
        io.emit(USER_DISCONNECTED, connectedUsers)
    })

    // Get global chat
    socket.on(COMMUNITY_CHAT, callback => {
        callback(globalChat)
    })

    // Message Sent 
    socket.on(MESSAGE_SENT, ({chatId, message}) => {
        sendMessageToChatFromUser(chatId, message)
    }) 

    // User typing
    socket.on(TYPING, ({chatId, isTyping}) => {
        sendTypingFromUser(chatId, isTyping);
    })

    // On private message
    socket.on(PRIVATE_MESSAGE, ({reciever, sender, activeChat}) => {
        if (reciever in connectedUsers) {
            const recieverSocket = connectedUsers[reciever].socketId;
            if (activeChat === null || activeChat.id === globalChat.id) {
                const newChat = createChat({name: `${reciever}, ${sender}`, users: [reciever, sender]})
                socket.to(recieverSocket).emit(PRIVATE_MESSAGE, newChat);
                socket.emit(PRIVATE_MESSAGE, newChat);
            } else {
                if (!(reciever in activeChat.users)){
                    activeChat.users
                        .filter(user => user in connectedUsers)
                        .map(user => connectedUsers[user])
                        .map(user => {
                            socket.to(user.socketId).emit(NEW_CHAT_USER, { chatId: activeChat.id, newUser: reciever })
                        })
                        socket.emit(NEW_CHAT_USER, { chatId: activeChat.id, newUser: reciever })
                }
                socket.to(recieverSocket).emit(PRIVATE_MESSAGE, activeChat)
            }
        }
    })

    // On search for user
    socket.on(USER_SEARCH, ({name, exclude}) => {
        filterUsers(name, exclude)
    })

    // Check if username is currently taken
    isUser = (userList, username) => {
        return username in userList
    }

    // Remove user from current users
    removeUser = (userList, username) => {
        let newList = Object.assign({}, userList);
        delete newList[username];
        return newList;
    }

    // Add user to current users
    addUser = (userlist, user) => {
        let newList = Object.assign({}, userlist);
        newList[user.name] = user;
        return newList;
    }

    // Send message to chat
    sendMessageToChat = sender => {
        return (chatId, message) => {
            io.emit(`${MESSAGE_RECEIVED} - ${chatId}`, createMessage({message, sender}))
        }
    }

    // Show all in chat that user is typing
    sendTypingToChat = user => {
        return (chatId, isTyping) => {
            io.emit(`${TYPING} - ${chatId}`, {user, isTyping})
        }
    }

    // Filter connected users to search term
    filterUsers = (name, exclude) => {
        let filter = [];
        let searchArr = removeUser(connectedUsers, exclude)
        for (user in searchArr) {
            if (user.toUpperCase().indexOf(name.toUpperCase()) === 0) {
                filter.push(user);
            }
        }
        filter = filter.slice(0,5);
        io.emit(USER_SEARCH, filter);
    }
}