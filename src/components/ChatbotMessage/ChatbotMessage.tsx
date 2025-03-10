import React, { useEffect, useState } from 'react';
import ConditionallyRender from 'react-conditionally-render';
import ChatbotMessageAvatar from './ChatBotMessageAvatar/ChatbotMessageAvatar';
import Loader from '../Loader/Loader';
import './ChatbotMessage.css';
import { callIfExists } from '../Chat/chatUtils';
import { ICustomComponents, ICustomStyles } from '../../interfaces/IConfig';

interface IChatbotMessageProps {
  message: string;
  withAvatar?: boolean;
  loading?: boolean;
  delay?: number;
  id: number;
  customComponents?: ICustomComponents;
  customStyles?: { backgroundColor: string };

  // 아래 2개가 "무한 루프"의 원인이 되기 쉬움.
  // 필요 없는 경우엔 굳이 props로 전달받지 않고, 내부에서만 관리 가능.
  messages?: any[];
  setState?: React.Dispatch<React.SetStateAction<any>>;

  // requestFunc가 있으면 내부에서 비동기 요청 -> 완료 시 로딩 해제
  requestFunc?: () => Promise<any>;
}

const ChatbotMessage = ({
  message,
  withAvatar = true,
  loading,
  delay,
  id,
  customComponents,
  customStyles,
  messages,      // 가능하면 빼거나, 필요하면 쓰되 의존성 배열에서 제외
  setState,      // 필요 없다면 빼는 게 좋음
  requestFunc,
}: IChatbotMessageProps) => {
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(!!loading);
  const [finalMessage, setFinalMessage] = useState(message);

  // (A) delay 후 메시지를 보이기
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

  // (B) requestFunc 있으면 -> 비동기 로직, 없으면 -> 타이머 로딩 해제
  //     **의존성 배열에 messages / setState 포함하지 말기**
  useEffect(() => {
    if (requestFunc) {
      // 비동기 요청
      let canceled = false;
      setIsLoading(true);

      requestFunc()
        .then((res) => {
          if (!canceled) {
            setFinalMessage(res?.data?.message || '응답이 없습니다.');
          }
        })
        .catch(() => {
          if (!canceled) {
            setFinalMessage('오류가 발생했습니다.');
          }
        })
        .finally(() => {
          if (!canceled) setIsLoading(false);
        });

      return () => {
        canceled = true;
      };
    } else {
      // 기존 방식: 0.75초 후 로딩 해제
      const defaultDisableTime = 750 + (delay || 0);
      const timeoutId = setTimeout(() => {
        // 내부 isLoading만 끄거나, 필요하다면 setState로 messages를 갱신.
        // → "여기서 messages 바뀌어도 useEffect 의존성에 안 넣었으므로 재호출X"
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
  // 여기서 의존성 배열에는 (requestFunc, delay, id) 정도만 넣음
  }, [requestFunc, delay, id]);

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

