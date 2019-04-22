import React, { Component } from 'react';
import { FaSistrix, FaDoorOpen } from 'react-icons/fa';
import { createChatFromUsers } from '../Factories';
import { USER_SEARCH } from '../Events'

import { Button } from 'reactstrap'

export default class Sidebar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            searchResults: []
        }
    }

    componentDidMount() {
        const socket = this.props.socket
        socket.on(USER_SEARCH, this.userFilter)
    }

    handleSubmit = name => {
        this.props.onSendPrivateMessage(name)
        this.setState({
            name: '',
            searchResults: []
        })
    }

    searchTyping = (e) => {
        this.setState({
            name: e.target.value.trim()
        })
        this.sendFilter()
    }
    
    sendFilter = () => {
        const socket = this.props.socket;
        socket.emit(USER_SEARCH, {name: this.state.name, exclude: this.props.user.name})
    }

    userFilter = (array) => {
        this.setState({
            searchResults: array
        })
    }

    render() {
        let search = (
            (this.state.name.length > 0) ? 
                        (
                            <div className="user-suggest">
                                <h3>User Suggestions:</h3>
                                {
                                    (this.state.searchResults.length > 0) ?
                                    (
                                        this.state.searchResults.map((user, index) => (
                                            (<div key={user + index}>
                                                <div className="user-photo">{user}</div>
                                                <div className="user-info">
                                                    <Button color="secondary" size="sm" onClick={() => this.handleSubmit(user)}>Chat!</Button>
                                                </div>
                                            </div>)
                                        ))
                                    ) : 
                                    <span>No users online with that name!</span>
                                }
                            </div>
                        ) :
                        null
        )
        return (
            <div id="side-bar">
                {/* Heading */}
                <div className="heading">
                    <div className="title">{this.props.title}</div>
                </div>
                {/* Search */}
                <form className="search">
                    <i className="search-icon"><FaSistrix /></i>
                    <input onChange={this.searchTyping} placeholder="Search for user..." type="text" value={this.state.name} />
                </form>
                {/* Chats */}
                <div className="users">
                    {/* User suggestions */}
                    {search}
                    
                    {/* Show individual chats (previews) */}
                    { this.props.chats.map( chat => {
                        if(chat.name) {
                            const lastMessage = chat.messages[chat.messages.length - 1];
                            const chatName = chat.isGlobal ? chat.name : createChatFromUsers(chat.users, this.props.user.name)
                            const classNames = (this.props.activeChat && this.props.activeChat.id === chat.id) ? 'active' : ''
                            
                            return (
                                <div 
                                    key={chat.id} 
                                    className={`user ${classNames}`}
                                    onClick={ ()=>{ this.props.setActiveChat(chat) } }
                                    >
                                    <div className="user-photo">{chatName[0].toUpperCase()}</div>
                                    <div className="user-info">
                                        <div className="name">{chatName}</div>
                                        {lastMessage && <div className="last-message">
                                            {lastMessage.sender === this.props.user.name ? "You" : lastMessage.sender}: {lastMessage.message.substring(0, 27)}...
                                        </div>}
                                    </div>
                                </div>
                            )
                        } else {
                            return null
                        }
                    }) }
                    
                </div>
                {/* Logout */}
                <div className="current-user">
                    <span>{this.props.user.name}</span>
                    <div onClick={()=>{this.props.logout()}} title="Logout" className="logout">
                        <FaDoorOpen/>	
                    </div>
                </div>
			</div>
        )
    }
}