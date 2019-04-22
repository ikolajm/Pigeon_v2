import React, { Component } from 'react'; 
import Sidebar from '../Sidebar';
import { COMMUNITY_CHAT, MESSAGE_SENT, MESSAGE_RECEIVED, TYPING, PRIVATE_MESSAGE, NEW_CHAT_USER } from '../../Events';
import ChatHeading from './ChatHeading';
import Messages from '../Messages';
import MessageInput from '../MessageInput';

export default class ChatComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chats: [],
            activeChat: null
        }
    }

    componentDidMount() {
        const socket = this.props.socket;
        this.initSocket(socket);
    }

    componentWillUnmount() {
        const socket = this.props.socket
        socket.off(PRIVATE_MESSAGE)
        socket.off(NEW_CHAT_USER)
    }
    
    initSocket = (socket) => {
        socket.emit(COMMUNITY_CHAT, this.resetChat)
		socket.on(PRIVATE_MESSAGE, this.addChat)
        socket.on(NEW_CHAT_USER, this.addUserToChat)
    }

    sendOpenPrivateMessage = (reciever) => {
        const socket = this.props.socket;
        const activeChat = this.state.activeChat
        socket.emit(PRIVATE_MESSAGE, {reciever, sender: this.props.user.name, activeChat})
    }

    addUserToChat = ({chatId, newUser}) => {
        const chats = this.state.chats;
        const newChats = chats.map(chat => {
            if (chat.id === chatId) {
                return {...chat, users: [...chat.users, newUser] }
            }
            return chat;
        })
        this.setState({
            chats: newChats
        })
    }

    resetChat = (chat) => {
        return this.addChat(chat, true);
    }

    addChat = (chat, reset = false) => {
        const socket = this.props.socket;
        const chats = this.state.chats;
        const newChats = reset ? [chat] : [...chats, chat];
        this.setState({
            chats: newChats,
            activeChat: reset ? chat : this.state.activeChat
        });

        const typingEvent = `${TYPING} - ${chat.id}`;
        const messageEvent = `${MESSAGE_RECEIVED} - ${chat.id}`;

        socket.on(typingEvent, this.updateTypingInChat(chat.id))
        socket.on(messageEvent, this.addMessageToChat(chat.id))
    }

    updateTypingInChat = chatId => {
        return ({isTyping, user}) => {
            if (user !== this.props.user.name) {
                const chats = this.state.chats;

                let newChats = chats.map(chat => {
                    if (chat.id === chatId) {
                        if (isTyping && !chat.typingUsers.includes(user)) {
                            chat.typingUsers.push(user)
                        } else if (!isTyping && chat.typingUsers.includes(user)) {
                            chat.typingUsers = chat.typingUsers.filter(u => u !== user)
                        }
                    }
                    return chat
                })
                this.setState({
                    chats: newChats
                })
            }
        }
    }

    addMessageToChat = chatId => {
        return message => {
            const chats = this.state.chats;
            let newChats = chats.map(chat => {
                if (chat.id === chatId) {
                    chat.messages.push(message)
                }
                return chat
            })
            this.setState({
                chats: newChats
            })
        }
    }

    setActiveChat = activeChat => {
        this.setState({
            activeChat: activeChat
        })
    }

    sendMessage = (chatId, message) => {
        const socket = this.props.socket;
        socket.emit(MESSAGE_SENT, {chatId, message})
    }

    sendTyping = (chatId, isTyping) => {
        const socket = this.props.socket;
        socket.emit(TYPING, {chatId, isTyping})
    }

    render() {
        let messageInput = (this.state.activeChat !== null) ? (
            <MessageInput sendMessage={ message => {
                this.sendMessage(this.state.activeChat.id, message)
            }} 
            sendTyping={ isTyping => {
                this.sendTyping(this.state.activeChat.id, isTyping)
            }}/>
            ) : (
            <MessageInput sendMessage={ message => {
                this.sendMessage(this.state.activeChat.id, message)
            }}/> )
        
        return (
            <div className="contain">
                <Sidebar title={this.props.title} logout={this.props.logout} chats={this.state.chats} activeChat={this.state.activeChat} setActiveChat={this.setActiveChat} user={this.props.user} onSendPrivateMessage={this.sendOpenPrivateMessage} socket={this.props.socket} />
                <div className="chat-room-container">
                {
                    this.state.activeChat !== null ? (
                        <div className="chat-room">
                            <ChatHeading name={this.props.user.name} users={this.state.activeChat.users} />
                            <Messages messages={this.state.activeChat.messages} user={this.props.user} typingUsers={this.state.activeChat.typingUsers} />
                            {messageInput}
                        </div>
                    ) 
                    : <div className="chat-room-choose"><h3>Choose a chat!</h3></div>
                }
                </div>
            </div>
        )
    }
}