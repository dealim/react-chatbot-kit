import React, { useEffect, useState } from 'react';
import ConditionallyRender from 'react-conditionally-render';

import ChatbotMessageAvatar from './ChatBotMessageAvatar/ChatbotMessageAvatar';
import Loader from '../Loader/Loader';
import './ChatbotMessage.css';
import { callIfExists } from '../Chat/chatUtils';
import { ICustomComponents, ICustomStyles } from '../../interfaces/IConfig';

interface IChatbotMessageProps {
  /** 기본 출력할 메시지 */
  message: string;

  /** 메시지에 아바타(봇 아이콘) 표시 여부 (기본값 true) */
  withAvatar?: boolean;

  /** 로딩 표시 여부 (초기값) */
  loading?: boolean;

  /** 전체 메시지 목록 (타이머 해제 시, setState를 통해 업데이트 가능) */
  messages: any[];

  /** (ms) 메시지 자체를 지연 표시할 시간 */
  delay?: number;

  /** 이 메시지의 고유 id */
  id: number;

  /** 상위 setState 함수 (타이머로 loading을 해제할 때 사용) */
  setState?: React.Dispatch<React.SetStateAction<any>>;

  /** 커스텀 아바타/메시지 컴포넌트 */
  customComponents?: ICustomComponents;

  /** 스타일(배경색 등) */
  customStyles?: { backgroundColor: string };

  // ---------------------------------------------
  // 추가: ChatbotMessage 내부에서 직접 비동기 요청을 수행하고 싶을 때
  //       requestFunc가 있으면 => 타이머로 해제하지 않고, 요청이 끝날 때 로딩 해제
  // ---------------------------------------------
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
  // 메시지 보이기 여부 (delay로 지연)
  const [show, setShow] = useState(false);

  // 내부 로딩 상태
  // 초기값을 props.loading으로 설정하되, 이후 로직(타이머 or requestFunc)에서 바뀔 수 있음
  const [isLoading, setIsLoading] = useState(!!loading);

  // 최종적으로 표시할 메시지 (비동기 로직 결과 등으로 변할 수 있음)
  const [finalMessage, setFinalMessage] = useState(message);

  // 1) delay만큼 지난 후 메시지를 보이도록 처리
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

  // 2) requestFunc가 있으면 -> 내부에서 비동기 요청. 
  //    없으면 -> 기존처럼 0.75초 + delay 후 자동으로 로딩 해제.
  useEffect(() => {
    if (requestFunc) {
      // (A) 비동기 요청 로직
      let canceled = false;
      setIsLoading(true); // 로딩 시작

      requestFunc()
        .then((res) => {
          if (canceled) return;
          // 서버 응답을 받아 메시지를 교체(예: res.data.message)
          setFinalMessage(res?.data?.message || '응답이 없습니다.');
        })
        .catch(() => {
          if (canceled) return;
          setFinalMessage('오류가 발생했습니다.');
        })
        .finally(() => {
          if (!canceled) {
            setIsLoading(false); // 요청 완료 후 로딩 해제
          }
        });

      return () => {
        canceled = true; // 컴포넌트 언마운트 등 대비
      };
    } else {
      // (B) requestFunc가 없으면 => 0.75초 + delay 후에 로딩 자동 해제
      let timeoutId: any;
      const defaultDisableTime = 750 + (delay || 0);

      timeoutId = setTimeout(() => {
        // 1) 상위 setState로 messages[]를 갱신해 loading을 false로 만들 수도 있고
        if (setState) {
          const newMessages = [...messages].map((msg) => {
            if (msg.id === id) {
              return { ...msg, loading: false, delay: undefined };
            }
            return msg;
          });
          setState((state: any) => ({ ...state, messages: newMessages }));
        }
        // 2) 내부 로딩 상태도 false로
        setIsLoading(false);
      }, defaultDisableTime);

      return () => clearTimeout(timeoutId);
    }
  }, [delay, id, messages, requestFunc, setState]);

  // 3) 스타일 처리
  const chatBoxCustomStyles = { backgroundColor: '' };
  const arrowCustomStyles = { borderRightColor: '' };

  if (customStyles) {
    chatBoxCustomStyles.backgroundColor = customStyles.backgroundColor;
    arrowCustomStyles.borderRightColor = customStyles.backgroundColor;
  }

  // 4) 실제 렌더링
  return (
    <ConditionallyRender
      condition={show}
      show={
        <div className="react-chatbot-kit-chat-bot-message-container">
          {/* 봇 아바타 표시 */}
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

          {/* 실제 메시지/로딩 표시 */}
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
                {/* 꼬리 화살표 */}
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

