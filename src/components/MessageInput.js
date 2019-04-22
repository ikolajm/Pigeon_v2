import React, { Component } from 'react';

export default class MessageInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message:"",
            isTyping:false
        }
      }
      
      handleSubmit = (e) => {
          e.preventDefault()
          this.sendMessage()
          this.setState({ message: "" })
      }
  
      sendMessage = () => {
          this.props.sendMessage(this.state.message)
      }
  
      componentWillUnmount() {
        this.stopCheckingTyping()
      }

      // Begin typing   
      sendTyping = () => {
          this.lastUpdateTime = Date.now()
          if(!this.state.isTyping){
              this.setState({isTyping:true})
              this.props.sendTyping(true)
              this.startCheckingTyping()
          }
      }
  
      // Say user is typing   
      startCheckingTyping = () => {
          this.typingInterval = setInterval( () => {
              if ( (Date.now() - this.lastUpdateTime) > 300 ) {
                  this.setState({isTyping:false})
                  this.stopCheckingTyping()
              }
          }, 300)
      }
      
      // Stop user typing
      stopCheckingTyping = () => {
          if (this.typingInterval) {
              clearInterval(this.typingInterval)
              this.props.sendTyping(false)
              this.setState({
                  isTyping: false
              })
          }
      }
  
      render() {
          return (
              <div className="message-input">
                  <form 
                      onSubmit={ this.handleSubmit }
                      className="message-form">
  
                      <input 
                          id="message"
                          type="text"
                          className="form-control"
                          value={this.state.message}
                          autoComplete={'off'}
                          placeholder="Type something interesting"
                          onKeyUp={ e => { e.keyCode !== 13 && this.sendTyping() } }
                          onChange = {
                              e => {
                                  this.setState({message: e.target.value})
                              }
                          }
                          />
                      <button
                          disabled={ this.state.message.length < 1 }
                          type="submit"
                          className="send"
                      > Send </button>
                  </form>
              </div>
          );
      }
}