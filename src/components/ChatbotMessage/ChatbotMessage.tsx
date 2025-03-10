import React, { useEffect, useState } from 'react';
import ConditionallyRender from 'react-conditionally-render';

import ChatbotMessageAvatar from './ChatBotMessageAvatar/ChatbotMessageAvatar';
import Loader from '../Loader/Loader';

const ChatbotMessage = ({
  message,
  withAvatar = true,
  loading,
  delay,
  id,
  customComponents,
  customStyles,
}) => {
  const [showMessage, setShowMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ✅ 로딩 애니메이션을 즉시 시작
    setIsLoading(true);

    // ✅ 메시지는 `delay` 후에 표시
    const messageTimer = setTimeout(() => {
      setShowMessage(true);
      setIsLoading(false);
    }, delay);

    return () => clearTimeout(messageTimer);
  }, [delay]);

  // ✅ 기존 스타일 유지
  const chatBoxCustomStyles = { backgroundColor: '' };
  const arrowCustomStyles = { borderRightColor: '' };

  if (customStyles) {
    chatBoxCustomStyles.backgroundColor = customStyles.backgroundColor;
    arrowCustomStyles.borderRightColor = customStyles.backgroundColor;
  }

  return (
    <ConditionallyRender
      condition={isLoading || showMessage}  // ✅ 로딩 중이거나 메시지를 표시할 경우 렌더링
      show={
        <div className="react-chatbot-kit-chat-bot-message-container">
          <ConditionallyRender
            condition={withAvatar}
            show={
              <ConditionallyRender
                condition={!!customComponents?.botAvatar}
                show={customComponents?.botAvatar}
                elseShow={<ChatbotMessageAvatar />}
              />
            }
          />

          <ConditionallyRender
            condition={!!customComponents?.botChatMessage}
            show={customComponents?.botChatMessage({
              message,
              loader: <Loader />,
            })}
            elseShow={
              <div
                className="react-chatbot-kit-chat-bot-message"
                style={chatBoxCustomStyles}
              >
                {/* ✅ 로딩 상태 유지 후 메시지 표시 */}
                <ConditionallyRender
                  condition={isLoading}
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

