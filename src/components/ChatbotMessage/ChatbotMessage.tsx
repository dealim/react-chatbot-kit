import React, { useEffect, useState } from 'react';
import ConditionallyRender from 'react-conditionally-render';

import ChatbotMessageAvatar from './ChatBotMessageAvatar/ChatbotMessageAvatar';
import Loader from '../Loader/Loader';
import './ChatbotMessage.css';
import { callIfExists } from '../Chat/chatUtils';

interface IChatbotMessageProps {
  message: string;
  withAvatar?: boolean;
  loading?: boolean;
  messages: any[];
  delay?: number;
  id: number;
  setState?: React.Dispatch<React.SetStateAction<any>>;
  customComponents?: any;
  customStyles: { backgroundColor: string };

  // **부모에서 "요청이 끝났는지 여부"를 알려주는 props (추가)**
  requestDone?: boolean;
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
  requestDone,
}: IChatbotMessageProps) => {
  const [show, toggleShow] = useState(false);

  // ------------------------
  // 1) 기존의 "3초 후 로딩 해제" 타이머 로직 삭제
  //    (또는 주석 처리)
  // ------------------------
  // useEffect(() => {
  //   let timeoutId: any;
  //   const disableLoading = (
  //     messages: any[],
  //     setState: React.Dispatch<React.SetStateAction<any>>
  //   ) => {
  //     let defaultDisableTime = 3000;
  //     if (delay) defaultDisableTime += delay;

  //     timeoutId = setTimeout(() => {
  //       const newMessages = [...messages].map(m => {
  //         if (m.id === id) {
  //           return { ...m, loading: false, delay: undefined };
  //         }
  //         return m;
  //       });
  //       setState((state: any) => ({ ...state, messages: newMessages }));
  //     }, defaultDisableTime);
  //   };
  //   disableLoading(messages, setState);
  //   return () => {
  //     clearTimeout(timeoutId);
  //   };
  // }, [delay, id]);

  // 2) 단순히 "딜레이가 있으면 일정 시간 후 메시지를 보여주는" 정도만 유지
  useEffect(() => {
    if (delay) {
      setTimeout(() => toggleShow(true), delay);
    } else {
      toggleShow(true);
    }
  }, [delay]);

  // 3) 스타일 관련 로직 그대로 유지
  const chatBoxCustomStyles = { backgroundColor: '' };
  const arrowCustomStyles = { borderRightColor: '' };
  if (customStyles) {
    chatBoxCustomStyles.backgroundColor = customStyles.backgroundColor;
    arrowCustomStyles.borderRightColor = customStyles.backgroundColor;
  }

  // 4) 렌더링 시 "loading이 true냐 false냐" 에만 의존 => 
  //    loading이 true면 <Loader />, false면 실제 message 표시
  //    requestDone은 부모(혹은 상위)에서 loading을 false로 바꿀 때 사용
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
              message,
              loader: <Loader />,
            })}
            elseShow={
              <div
                className="react-chatbot-kit-chat-bot-message"
                style={chatBoxCustomStyles}
              >
                <ConditionallyRender
                  condition={loading}
                  show={<Loader />}
                  elseShow={<span>{message}</span>}
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

