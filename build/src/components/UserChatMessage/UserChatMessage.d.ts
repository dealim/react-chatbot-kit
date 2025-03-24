import React from 'react';
import './UserChatMessage.css';
import { ICustomComponents } from '../../interfaces/IConfig';
interface IUserChatMessageProps {
    message: string;
    customComponents: ICustomComponents;
}
declare const UserChatMessage: ({ message, customComponents, }: IUserChatMessageProps) => React.JSX.Element;
export default UserChatMessage;
