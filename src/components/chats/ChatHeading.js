import React from  'react';
import { createChatFromUsers } from '../../Factories';

const ChatHeading = ({users, name}) => {
    return (
        <div className="chat-header">
            <div className="user-info">
                <div className="user-name">{users.length === 0 ? 'Global' : createChatFromUsers(users, name) + ', You'}</div>
            </div>
        </div>
    )
}

export default ChatHeading