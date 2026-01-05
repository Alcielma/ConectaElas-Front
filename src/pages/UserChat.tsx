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
} from "@ionic/react";
import { useChat } from "../Contexts/ChatContext";
import { useAuth } from "../Contexts/AuthContext";
import "./UserChat.css";
import { IonIcon } from "@ionic/react";
import { send } from "ionicons/icons";
import { Keyboard } from "@capacitor/keyboard";

const UserChat: React.FC = () => {
  const {
    activeChat,
    startChat,
    sendMessage,
    selectChat,
    broadcastTyping,
    isTyping,
  } = useChat();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLIonInputElement>(null);
  const contentRef = useRef<HTMLIonContentElement>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const isSentByCurrentUser = (msg: any) => {
    const remetenteId =
      typeof msg.remetente === "number" ? msg.remetente : msg.remetente?.id;
    return user?.id === remetenteId;
  };

  // Detectar quando o teclado abre/fecha
  useEffect(() => {
    const onKeyboardShow = () => {
      setIsKeyboardOpen(true);
      if (contentRef.current) {
        contentRef.current.scrollToBottom(300);
      }
    };

    const onKeyboardHide = () => {
      setIsKeyboardOpen(false);
    };

    // Listeners do Capacitor Keyboard
    Keyboard.addListener('keyboardDidShow', onKeyboardShow);
    Keyboard.addListener('keyboardWillHide', onKeyboardHide);

    return () => {
      Keyboard.removeAllListeners();
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
    if (!activeChat) {
      startChat("");
    } else {
      selectChat(activeChat.id);
    }
  }, []);

  useEffect(() => {
    if (!activeChat) return;
  }, [activeChat]);

  // Scroll automático quando mensagens mudam
  useEffect(() => {
    if (contentRef.current) {
      setTimeout(() => {
        contentRef.current?.scrollToBottom(300);
      }, 100);
    }
  }, [activeChat?.mensagens?.length]);

  const handleSendMessage = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!message.trim()) return;

    // Manter o foco no input para não fechar o teclado
    const currentMessage = message;
    setMessage("");

    try {
      if (!activeChat) {
        await startChat(currentMessage);
      } else {
        await sendMessage(activeChat.id, currentMessage);
      }

      // Refocus no input para manter o teclado aberto
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setFocus();
        }
      }, 50);

      // Scroll para o final após enviar
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollToBottom(300);
        }
      }, 200);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setMessage(currentMessage); // Restaurar mensagem em caso de erro
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
            <IonBackButton defaultHref="/tabs/tab1" />
          </IonButtons>
          <IonTitle className="center-title">Secretaria das Mulheres</IonTitle>
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
              Envie uma mensagem para iniciar seu chat com a Secretaria da
              Mulher!
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
                cursor: "pointer", 
                marginLeft: "8px",
                color: message.trim() ? "var(--cor-secundaria)" : "#ccc",
                transition: "color 0.3s ease"
              }}
              onClick={handleSendMessage}
              onMouseDown={(e) => e.preventDefault()}
            />
          </div>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default UserChat;
