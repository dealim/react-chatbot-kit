import React from 'react';
import './ChatbotError.css';
interface IChatbotErrorProps {
    message: string;
}
declare const ChatbotError: ({ message }: IChatbotErrorProps) => React.JSX.Element;
export default ChatbotError;
