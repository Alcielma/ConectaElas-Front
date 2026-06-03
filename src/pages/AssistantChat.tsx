import React, { useState, useEffect, useRef } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFooter,
  IonInput,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonAlert,
} from "@ionic/react";
import { useChat } from "../Contexts/ChatContext";
import { useAuth } from "../Contexts/AuthContext";
import { send, closeCircleOutline } from "ionicons/icons";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";
import "./UserChat.css";
import { useParams, useHistory } from "react-router-dom";

const AssistantChat: React.FC = () => {
  const {
    activeChat,
    sendMessage,
    selectChat,
    broadcastTyping,
    isTyping,
    isSending,
    endProtocol,
  } = useChat();
  const { user } = useAuth();
  const history = useHistory();
  const [message, setMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLIonInputElement>(null);
  const contentRef = useRef<HTMLIonContentElement>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const selectChatRef = useRef(selectChat);
  const pollingInFlightRef = useRef(false);
  const { chatId } = useParams<{ chatId: string }>();
  const isSentByCurrentUser = (msg: any) => {
    const remetenteId =
      typeof msg.remetente === "number" ? msg.remetente : msg.remetente?.id;
    return user?.id === remetenteId;
  };

  useEffect(() => {
    selectChatRef.current = selectChat;
  }, [selectChat]);

  // Detectar quando o teclado abre/fecha
  useEffect(() => {
    let showListener: any;
    let hideListener: any;

    const initKeyboard = async () => {
      if (Capacitor.isNativePlatform()) {
        showListener = await Keyboard.addListener('keyboardDidShow', () => {
          setIsKeyboardOpen(true);
          if (contentRef.current) {
            contentRef.current.scrollToBottom(300);
          }
        });

        hideListener = await Keyboard.addListener('keyboardWillHide', () => {
          setIsKeyboardOpen(false);
        });
      }
    };

    initKeyboard();

    return () => {
      showListener?.remove();
      hideListener?.remove();
    };
  }, []);

  useEffect(() => {
    const messagesContainer = document.querySelector(".messages-container");

    if (isTyping && messagesContainer) {
      messagesContainer.classList.add("typing");
    } else if (messagesContainer) {
      messagesContainer.classList.remove("typing");
    }
  }, [isTyping]);

  useEffect(() => {
    if (chatId) {
      selectChat(Number(chatId));
    }
  }, [chatId]);

  useEffect(() => {
    if (contentRef.current) {
      setTimeout(() => {
        contentRef.current?.scrollToBottom(300);
      }, 100);
    }
  }, [activeChat?.mensagens?.length]);

  // Polling periódico para atualizar mensagens (fallback para o socket)
  useEffect(() => {
    if (!activeChat) return;

    // Polling a cada 1 segundo
    const chatId = activeChat.id;
    const intervalId = setInterval(async () => {
      if (pollingInFlightRef.current) return;
      pollingInFlightRef.current = true;
      try {
        await selectChatRef.current(chatId);
      } finally {
        pollingInFlightRef.current = false;
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [activeChat?.id]);

  const handleSendMessage = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!message.trim() || isSending) return;
    if (activeChat === null) return;

    const currentMessage = message;
    setMessage("");

    try {
      await sendMessage(activeChat.id, currentMessage);

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setFocus();
        }
      }, 50);

      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollToBottom(300);
        }
      }, 200);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setMessage(currentMessage);
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleInputChange = (value: string) => {
    setMessage(value);
    broadcastTyping();
  };

  return (
    <IonPage className="Chat-root">
      <IonHeader className="Chat-header">
        <IonToolbar className="header-gradient">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/assistantChats" />
          </IonButtons>
          <IonTitle className="center-title">Chat</IonTitle>
          <IonButtons slot="end">
            <div style={{ width: "44px" }} />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent 
        ref={contentRef}
        className="chat-content"
        scrollEvents={true}
      >
        <div style={{ 
          position: 'sticky', 
          top: '16px', 
          zIndex: 10,
          padding: '0 16px',
          display: 'flex', 
          justifyContent: 'center' 
        }}>
          <IonButton
            fill="solid"
            onClick={() => setShowConfirmAlert(true)}
            style={{
              '--background': '#dc3545',
              '--background-hover': '#c82333',
              '--color': '#ffffff',
              width: '80%',
            }}
          >
            <IonIcon slot="start" icon={closeCircleOutline} />
            Encerrar Chat
          </IonButton>
        </div>

        <div className={`messages-container ${isKeyboardOpen ? 'keyboard-open' : ''}`}>
          {(activeChat?.mensagens?.length ?? 0) ? (
            (activeChat?.mensagens ?? [])
              .slice()
              .sort(
                (a: any, b: any) =>
                  new Date(a.Data_Envio).getTime() -
                  new Date(b.Data_Envio).getTime()
              )
              .map((msg: any) => (
                <div
                  key={msg.id}
                  className={`message-bubble ${
                    isSentByCurrentUser(msg) ? "sent" : "received"
                  }`}
                >
                  <p>{msg.Mensagem}</p>
                  <span className="timestamp">
                    {new Date(msg.Data_Envio).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}{" "}
                    às{" "}
                    {new Date(msg.Data_Envio).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))
          ) : (
            <p className="no-messages">
              Envie uma mensagem para iniciar seu chat!
            </p>
          )}
          <div ref={chatEndRef} className="chat-end-marker" />
        </div>
      </IonContent>

      <IonFooter className="ion-no-border">
        <IonToolbar className="chat-input-toolbar">
          <div 
            className="input-container"
            style={{ 
              display: "flex", 
              alignItems: "center",
              padding: "8px 16px",
              backgroundColor: "white",
              borderRadius: "25px",
              margin: "10px"
            }}
          >
            <IonInput
              ref={inputRef}
              value={message}
              placeholder="Digite sua mensagem..."
              onIonInput={(e) => handleInputChange(e.detail.value!)}
              onIonFocus={() => {
                setTimeout(() => {
                  contentRef.current?.scrollToBottom(300);
                }, 50);
              }}
              onKeyPress={handleKeyPress}
              style={{ flex: 1 }}
              enterkeyhint="send"
              clearOnEdit={false}
              autocapitalize="sentences"
              spellcheck={true}
            />
            <IonIcon
              icon={send}
              size="large"
              className="send-icon"
              style={{ 
                cursor: (message.trim() && !isSending) ? "pointer" : "not-allowed", 
                marginLeft: "8px",
                color: (message.trim() && !isSending) ? "var(--cor-secundaria)" : "#ccc",
                transition: "color 0.3s ease",
                opacity: isSending ? 0.5 : 1
              }}
              onClick={!isSending ? handleSendMessage : undefined}
              onMouseDown={(e) => e.preventDefault()}
            />
          </div>
        </IonToolbar>
      </IonFooter>

      <IonAlert
        isOpen={showConfirmAlert}
        onDidDismiss={() => setShowConfirmAlert(false)}
        header="Confirmar encerramento"
        message="Tem certeza que deseja encerrar este chat? Esta ação não pode ser desfeita."
        buttons={[
          { text: "Cancelar", role: "cancel" },
          { 
            text: "Encerrar", 
            handler: async () => {
              if (activeChat?.id) {
                await endProtocol(activeChat.id);
                history.replace("/assistantChats");
              }
            } 
          },
        ]}
      />
    </IonPage>
  );
};

export default AssistantChat;