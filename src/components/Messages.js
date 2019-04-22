import React, { Component } from 'react'

export default class Messages extends Component {

    scrollDown = () => {
		const container = this.refs.container
		container.scrollTop = container.scrollHeight
	}

	componentDidMount() {
		this.scrollDown()
	}

	componentDidUpdate(prevProps, prevState) {
		this.scrollDown()
    }
    
    render() {
        return (
            <div ref="container" className="thread-container">
                <div className="thread">
                    {/* Message population */}
                    {this.props.messages.map( item => {
                        return (
                            <div key={item.id} className={`message-container ${item.sender === this.props.user.name && 'right'}` }>
                                <div className="time">{item.time}</div>
                                <div className="data">
                                    <div className="message">{item.message}</div>
                                    <div className="sender">{item.sender}</div>
                                </div>
                            </div>
                        )
                    })}
                    {/* Is user typing */}
                    {this.props.typingUsers.map(name => {
                        return (
                            <div key={name} className="typing-user">
                                {`${name} is typing...`}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}