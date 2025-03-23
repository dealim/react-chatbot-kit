import React from 'react';
import './ChatbotMessage.css';
import { ICustomComponents } from '../../interfaces/IConfig';
interface IChatbotMessageProps {
    message: string | React.ReactNode;
    withAvatar?: boolean;
    loading?: boolean;
    delay?: number;
    id: number;
    customComponents?: ICustomComponents;
    customStyles?: {
        backgroundColor: string;
    };
    messages?: any[];
    setState?: React.Dispatch<React.SetStateAction<any>>;
    requestFunc?: () => Promise<any>;
    onResponse?: (data: any) => React.ReactNode;
}
declare const ChatbotMessage: ({ message, withAvatar, loading, delay, id, customComponents, customStyles, messages, setState, requestFunc, onResponse, }: IChatbotMessageProps) => JSX.Element;
export default ChatbotMessage;
