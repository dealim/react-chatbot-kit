import React, { useEffect, useState } from 'react';
import ConditionallyRender from 'react-conditionally-render';
import Loader from '../Loader/Loader';
import './ChatbotMessage.css';
import { callIfExists } from '../Chat/chatUtils';
import { ICustomComponents } from '../../interfaces/IConfig';
import ChatbotMessageAvatar from './ChatBotMessageAvatar/ChatbotMessageAvatar';

interface IChatbotMessageProps {
  message: string | React.ReactNode;
  withAvatar?: boolean;
  loading?: boolean;
  delay?: number;
  id: number;
  customComponents?: ICustomComponents;
  customStyles?: { backgroundColor: string };
  messages?: any[];
  setState?: React.Dispatch<React.SetStateAction<any>>;
  requestFunc?: () => Promise<any>;
  onResponse?: (data: any) => React.ReactNode;
}

const ChatbotMessage = ({
  message,
  withAvatar = true,
  loading,
  delay,
  id,
  customComponents,
  customStyles,
  messages,
  setState,
  requestFunc,
  onResponse,
}: IChatbotMessageProps) => {
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(!!loading);
  const [finalMessage, setFinalMessage] = useState<string | React.ReactNode>(
    message,
  );

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (delay) {
      timer = setTimeout(() => setShow(true), delay);
    } else {
      setShow(true);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [delay]);

  useEffect(() => {
    if (requestFunc) {
      let canceled = false;
      setIsLoading(true);

      requestFunc()
        .then((res) => {
          console.log(res);
          if (!canceled) {
            const data = res?.data;
            const responseText = data?.response || '응답이 없습니다.';
            setFinalMessage(responseText);

            if (onResponse) {
              setFinalMessage(onResponse(data));
            }
          }
        })
        .catch(() => {
          if (!canceled) {
            setFinalMessage('질문을 이해하지 못했어요.');
          }
        })
        .finally(() => {
          if (!canceled) {
            setIsLoading(false);
          }
        });

      return () => {
        canceled = true;
      };
    } else {
      const defaultDisableTime = 750 + (delay || 0);
      const timeoutId = setTimeout(() => {
        setIsLoading(false);

        if (setState && messages) {
          const newMessages = [...messages].map((msg: any) => {
            if (msg.id === id) {
              return { ...msg, loading: false, delay: undefined };
            }
            return msg;
          });
          setState((prev: any) => ({ ...prev, messages: newMessages }));
        }
      }, defaultDisableTime);

      return () => clearTimeout(timeoutId);
    }
  }, [requestFunc, onResponse, delay, id]);

  // 스타일 처리
  const chatBoxCustomStyles = { backgroundColor: '' };
  const arrowCustomStyles = { borderRightColor: '' };

  if (customStyles) {
    chatBoxCustomStyles.backgroundColor = customStyles.backgroundColor;
    arrowCustomStyles.borderRightColor = customStyles.backgroundColor;
  }

  return (
    <ConditionallyRender
      condition={show}
      show={
        <div className="react-chatbot-kit-chat-bot-message-container">
          <ConditionallyRender
            condition={withAvatar}
            show={
              <ConditionallyRender
                condition={!!customComponents?.botAvatar}
                show={callIfExists(customComponents?.botAvatar)}
                elseShow={<ChatbotMessageAvatar />}
              />
            }
          />

          <ConditionallyRender
            condition={!!customComponents?.botChatMessage}
            show={callIfExists(customComponents?.botChatMessage, {
              message: finalMessage,
              loader: <Loader />,
            })}
            elseShow={
              <div
                className="react-chatbot-kit-chat-bot-message"
                style={chatBoxCustomStyles}
              >
                <ConditionallyRender
                  condition={isLoading}
                  show={<Loader />}
                  elseShow={<div>{finalMessage}</div>}
                />

                <ConditionallyRender
                  condition={withAvatar}
                  show={
                    <div
                      className="react-chatbot-kit-chat-bot-message-arrow"
                      style={arrowCustomStyles}
                    ></div>
                  }
                />
              </div>
            }
          />
        </div>
      }
    />
  );
};

export default ChatbotMessage;
