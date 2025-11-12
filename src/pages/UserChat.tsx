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

const UserChat: React.FC = () => {
  const {
    activeChat,
    startChat,
    sendMessage,
    selectChat,
    fetchMessages,
    broadcastTyping,
    isTyping,
  } = useChat();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<[]>([]);
  const inputRef = useRef<HTMLIonInputElement>(null);
  const contentRef = useRef<HTMLIonContentElement>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Detectar quando o teclado abre/fecha
  useEffect(() => {
    const handleKeyboardShow = () => {
      setIsKeyboardOpen(true);
      // Scroll para baixo quando o teclado abrir
      setTimeout(() => {
        if (chatEndRef.current) {
          chatEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      }, 150);
    };

    const handleKeyboardHide = () => {
      setIsKeyboardOpen(false);
    };

    // Listeners para detectar mudanças na viewport (teclado)
    const handleResize = () => {
      const viewport = window.visualViewport;
      if (viewport) {
        const isOpen = viewport.height < window.innerHeight * 0.8;
        if (isOpen) {
          handleKeyboardShow();
        } else {
          handleKeyboardHide();
        }
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    
    // Fallback para dispositivos que não suportam visualViewport
    window.addEventListener('resize', handleResize);

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResize);
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

    const fetchMessageActiveChat = async () => {
      const messages = await fetchMessages(activeChat.id);
      setMessages(messages);
    };

    fetchMessageActiveChat();
  }, [activeChat]);

  // Scroll automático quando mensagens mudam
  useEffect(() => {
    if (chatEndRef.current) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ 
          behavior: "smooth", 
          block: "end",
          inline: "nearest"
        });
      }, 100);
    }
  }, [messages]);

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
        if (chatEndRef.current) {
          chatEndRef.current.scrollIntoView({ 
            behavior: "smooth", 
            block: "end"
          });
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

  const handleTouchStart = (e: React.TouchEvent) => {
    // Prevenir comportamentos indesejados no touch
    e.stopPropagation();
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
          {messages.length ? (
            messages
              .sort(
                (a: any, b: any) =>
                  new Date(a.Data_Envio).getTime() -
                  new Date(b.Data_Envio).getTime()
              )
              .map((msg: any) => (
                <div
                  key={msg.id}
                  className={`message-bubble ${
                    user?.id === msg.remetente.id ? "sent" : "received"
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
              onTouchStart={handleTouchStart}
            />
          </div>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default UserChat;