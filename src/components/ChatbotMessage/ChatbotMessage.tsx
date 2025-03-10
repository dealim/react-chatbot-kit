import React, { useEffect, useState } from 'react';
import ConditionallyRender from 'react-conditionally-render';

import ChatbotMessageAvatar from './ChatBotMessageAvatar/ChatbotMessageAvatar';
import Loader from '../Loader/Loader';

import './ChatbotMessage.css';
import { callIfExists } from '../Chat/chatUtils';
import { ICustomComponents, ICustomStyles } from '../../interfaces/IConfig';

export interface IChatbotMessageProps {
  message: string;
  withAvatar?: boolean;
  loading?: boolean;
  messages: any[];
  delay?: number;
  id: number;
  setState?: React.Dispatch<React.SetStateAction<any>>;
  customComponents?: ICustomComponents;
  customStyles?: { backgroundColor: string };

  /** 선택적으로, ChatbotMessage 내부에서 비동기 요청을 수행하고 싶을 때 사용 */
  requestFunc?: () => Promise<any>;
}

const ChatbotMessage = ({
  message,
  withAvatar = true,
  loading,
  messages,
  customComponents,
  setState,
  customStyles,
  delay,
  id,
  requestFunc,
}: IChatbotMessageProps) => {
  const [show, toggleShow] = useState(false);        // 메시지를 화면에 표시할지 여부 (delay 지연용)
  const [isLoading, setIsLoading] = useState(!!loading); // 내부 로딩 상태 (초기값: props.loading)
  const [finalMessage, setFinalMessage] = useState(message); // 최종적으로 보여줄 메시지

  // 1) (등장 지연) delay가 있다면, delay ms 뒤에 메시지를 표시
  useEffect(() => {
    let timer: any;
    if (delay) {
      timer = setTimeout(() => toggleShow(true), delay);
    } else {
      toggleShow(true);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [delay]);

  // 2) requestFunc가 "없는" 경우 => 기존 로직: 0.75초 + delay 후 자동으로 로딩 해제
  //    requestFunc가 "있는" 경우 => 이 타이머를 동작시키지 않고,
  //                                아래 비동기 호출 로직에 따라 로딩을 제어
  useEffect(() => {
    if (requestFunc) {
      // 2-1) 비동기 로직 수행
      let canceled = false;
      setIsLoading(true); // 로딩 시작
      requestFunc()
        .then((res) => {
          if (canceled) return;
          // 서버 응답(res)에 따라 메시지를 변경할 수 있음
          // 예: res.data.message라 가정
          setFinalMessage(res?.data?.message || "응답이 없습니다.");
        })
        .catch((error) => {
          if (canceled) return;
          setFinalMessage("오류가 발생했습니다.");
        })
        .finally(() => {
          if (!canceled) setIsLoading(false);
        });

      return () => {
        canceled = true;
      };
    } else {
      // 2-2) requestFunc가 없으면 => 타이머로 로딩 해제
      let timeoutId: any;
      const defaultDisableTime = 750 + (delay || 0);

      timeoutId = setTimeout(() => {
        // 만약 setState가 없으면 그냥 내부 isLoading만 꺼줘도 됨
        if (setState) {
          const newMessages = [...messages].map((msg) => {
            if (msg.id === id) {
              return { ...msg, loading: false, delay: undefined };
            }
            return msg;
          });
          setState((state: any) => ({ ...state, messages: newMessages }));
        }
        setIsLoading(false);
      }, defaultDisableTime);

      return () => clearTimeout(timeoutId);
    }
  }, [delay, id, messages, requestFunc, setState]);

  // 3) 스타일
  const chatBoxCustomStyles = { backgroundColor: '' };
  const arrowCustomStyles = { borderRightColor: '' };

  if (customStyles) {
    chatBoxCustomStyles.backgroundColor = customStyles.backgroundColor;
    arrowCustomStyles.borderRightColor = customStyles.backgroundColor;
  }

  // 4) 렌더링
  return (
    <ConditionallyRender
      condition={show}
      show={
        <div className="react-chatbot-kit-chat-bot-message-container">
          {/* 아바타 표시 */}
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

          {/* 메시지 내용 */}
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
                {/* 로딩 중이면 Loader, 아니면 finalMessage */}
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

