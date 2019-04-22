import React, { Component } from 'react';
import io from 'socket.io-client';
import { USER_CONNECTED, LOGOUT } from '../Events';
import Login from './Login.js';
import ChatContainer from './chats/ChatContainer';

const socketURL = 'http://localhost:3001';

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
        const socket = io(socketURL);

        socket.on('connect', () => {
            console.log('Connected!')
        })

        this.setState({
            socket: socket
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