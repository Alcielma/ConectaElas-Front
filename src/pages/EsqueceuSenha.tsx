import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonToast,
  IonButtons,
  IonBackButton,
  useIonRouter,
} from "@ionic/react";
import React, { useRef, useState } from "react";
import "./ConfirmacaoCodigo.css";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import SlideSendEmail from "../components/esqueceuSenha/slides/slideSendEmail";
import SlideConfirmPassword from "../components/esqueceuSenha/slides/slideConfirmPassword";
import SlideConfirmCode from "../components/esqueceuSenha/slides/slideConfirmCode";
import { ToastItem } from "../utils/utils";

enum FORGOT_PASSWORD_SCREENS {
  SLIDE_EMAIL,
  SLIDE_CODE,
  SLIDE_PASSWORD,
}

const NUM_DIGITS = 5;

const EsqueceuSenha: React.FC = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState<string[]>(new Array(NUM_DIGITS).fill(""));
  const [toastMsg, setToastMsg] = useState<ToastItem>({
    message: "",
    color: "primary",
  } as ToastItem);
  const [SCREEN_STATE, setScreenState] = useState<FORGOT_PASSWORD_SCREENS>(
    FORGOT_PASSWORD_SCREENS.SLIDE_EMAIL
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleEmailChange = (newValue: string) => setEmail(newValue);
  const handleToNextSlide = () => {
    if (SCREEN_STATE === FORGOT_PASSWORD_SCREENS.SLIDE_PASSWORD) {
      return;
    }
    setScreenState((prev) => prev + 1);
  };

  const handleCodeChange = (value: string, index: number) => {
    if (!/^[0-9]*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto avançar para próximo campo
    if (value && index < 4 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleToastMessage = (toastItem: ToastItem) => {
    setToastMsg(toastItem);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" />
          </IonButtons>
          <IonTitle className="center-title">Recuperação de senha</IonTitle>
          <IonButtons slot="end">
            <div style={{ width: "44px" }}></div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="confirmacao-content center-content">
        <div className="confirmacao-container">
          {SCREEN_STATE === FORGOT_PASSWORD_SCREENS.SLIDE_EMAIL && (
            <SlideSendEmail
              handleChange={handleEmailChange}
              handleToNextSlide={handleToNextSlide}
              handleToastMessage={handleToastMessage}
            />
          )}
          {SCREEN_STATE === FORGOT_PASSWORD_SCREENS.SLIDE_CODE && (
            <SlideConfirmCode
              email={email}
              handleToNextSlide={handleToNextSlide}
              handleToastMessage={handleToastMessage}
              inputRefs={inputRefs}
              handleCodeChange={handleCodeChange}
              code={code}
            />
          )}
          {SCREEN_STATE === FORGOT_PASSWORD_SCREENS.SLIDE_PASSWORD && (
            <SlideConfirmPassword
              code={code}
              handleToastMessage={handleToastMessage}
            />
          )}
        </div>
        <IonToast
          isOpen={toastMsg.message !== ""}
          message={toastMsg.message}
          duration={3000}
          onDidDismiss={() => setToastMsg({ message: "", color: "primary" })}
          color={toastMsg.color}
        />
      </IonContent>
    </IonPage>
  );
};

export default EsqueceuSenha;
