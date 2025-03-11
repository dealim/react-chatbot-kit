import React, { useEffect, useState } from 'react';
import ConditionallyRender from 'react-conditionally-render';
import ChatbotMessageAvatar from './ChatBotMessageAvatar/ChatbotMessageAvatar';
import Loader from '../Loader/Loader';
import './ChatbotMessage.css';
import { callIfExists } from '../Chat/chatUtils';
import { ICustomComponents } from '../../interfaces/IConfig';

interface IChatbotMessageProps {
  message: string;
  withAvatar?: boolean;
  loading?: boolean;
  delay?: number;
  id: number;
  customComponents?: ICustomComponents;
  customStyles?: { backgroundColor: string };
  messages?: any[];
  setState?: React.Dispatch<React.SetStateAction<any>>;
  requestFunc?: () => Promise<any>;
  onResponse?: (data: any) => void; // 추가된 콜백
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
  onResponse,        // onResponse 추가
}: IChatbotMessageProps) => {
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(!!loading);
  const [finalMessage, setFinalMessage] = useState(message);

  // 지연(delay) 처리
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

  // requestFunc + onResponse 처리
  useEffect(() => {
    if (requestFunc) {
      let canceled = false;
      setIsLoading(true);

      requestFunc()
        .then((res) => {
          if (!canceled) {
            const data = res?.data;
            const responseText = data?.response || '응답이 없습니다.';
            setFinalMessage(responseText);

            // onResponse가 있다면, 응답 데이터를 콜백으로 넘겨줌
            if (onResponse) {
              onResponse(data);
            }
          }
        })
        .catch(() => {
          if (!canceled) {
            setFinalMessage('오류가 발생했습니다.');
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
      // 기존 방식: 0.75초 후 로딩 해제
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
  }, [requestFunc, onResponse, delay, id, messages, setState]);

  // --- 스타일 ---
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
                  elseShow={<span>{finalMessage}</span>}
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

