import React, { Component } from 'react';
import io from 'socket.io-client';
import { USER_CONNECTED, LOGOUT, VERIFY_USER } from '../Events';
import Login from './Login.js';
import ChatContainer from './chats/ChatContainer';

const socketURL = '/';

export default class Layout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            socket: null,
            user: null
        }
    }
    
    componentWillMount() {
        this.initSocket();
    }

    // Connect and initialize socket
    initSocket = () => {
        const socket = io(socketURL)

        socket.on('connect', ()=>{
            if(this.state.user){
                this.reconnect(socket)
            }else{
                console.log("connected")
            }
        })
        
        this.setState({socket})
    }

    // Verfies user on reconnect
    reconnect = socket => {
		socket.emit(VERIFY_USER, this.state.user.name, ({ isUser, user })=>{
			if (isUser) {
				this.setState({ user: null })
			} else {
				this.setUser(user)
			}
		})
	}

    // Set User
    setUser = user => {
        const socket = this.state.socket
        socket.emit(USER_CONNECTED, user);
        this.setState({
            user: user
        })
    }

    // Logout
    logout = () => {
        const socket = this.state.socket;
        socket.emit(LOGOUT);
        this.setState({
            user: null
        })
    }

    render() {
        return (
            <React.Fragment>
            {
                !this.state.user ?
                <Login socket={this.state.socket} setUser={this.setUser} /> :
                <ChatContainer title={this.props.title} socket={this.state.socket} user={this.state.user} logout={this.logout} />
            }
            </React.Fragment>
        )
    }
}