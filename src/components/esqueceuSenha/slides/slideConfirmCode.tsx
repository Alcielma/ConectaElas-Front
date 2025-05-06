import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonRow,
  IonSpinner,
} from "@ionic/react";
import { key } from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import { ToastItem } from "../../../utils/utils";
import AuthService from "../../../Services/AuthService";

interface props {
  email: string;
  code: string[];
  handleToNextSlide: () => void;
  handleToastMessage: (toastItem: ToastItem) => void;
  handleCodeChange: (value: string, index: number) => void;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
}

export default function SlideConfirmCode({
  email,
  code,
  handleToNextSlide,
  handleToastMessage,
  handleCodeChange,
  inputRefs,
}: props) {
  const [tempoRestante, setTempoRestante] = useState(0);
  const [loading, setLoading] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  const handleCodeSubmit = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 5) {
      handleToastMessage({
        message: "Por favor, preencha todos os dígitos",
        color: "danger",
      });
      return;
    }

    setLoading(true);

    const response = await AuthService.confirmarCodigoSenha(
      email,
      code.join("")
    );
    if (response.success) {
      handleToastMessage({
        message: "Código verificado com sucesso!",
        color: "success",
      });
      handleToNextSlide();
    } else {
      handleToastMessage({
        message: response.message ?? "Código inválido. Tente novamente.",
        color: "danger",
      });
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (
      e.key === "Backspace" &&
      !code[index] &&
      index > 0 &&
      inputRefs.current[index - 1]
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const resendCode = async () => {
    if (tempoRestante > 0) return;
    setReenviando(true);
    const response = await AuthService.reenviarCodigoSenha(email);
    if (response.success) {
      handleToastMessage({
        message: "Código reenviado com sucesso!",
        color: "success",
      });
      setTempoRestante(60);
    } else {
      handleToastMessage({
        message: response.message ?? "Erro ao reenviar código",
        color: "danger",
      });
    }
    setReenviando(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (tempoRestante > 0) {
      interval = setInterval(() => {
        setTempoRestante((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [tempoRestante]);

  useEffect(() => {
    const onlyNumbers = code.join("").replace(/\D/g, "");
    if (onlyNumbers.length >= 5) {
      handleCodeSubmit();
    }
  }, [code]);

  return (
    <div className="ion-text-center ion-padding ">
      <IonIcon
        icon={key}
        color="primary"
        style={{ fontSize: "4rem", marginBottom: "20px" }}
      />
      <h2>Verificação</h2>
      <p>
        Digite o código de 5 dígitos enviado para <b>{email}</b>
      </p>

      <IonGrid>
        <IonRow className="ion-justify-content-center">
          {code.map((digit, index) => (
            <IonCol size="auto" key={index}>
              <input
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="code-input"
                disabled={loading}
              />
            </IonCol>
          ))}
        </IonRow>
        <p>{loading && <IonSpinner name="crescent" />}</p>
      </IonGrid>

      <IonButton
        fill="clear"
        onClick={resendCode}
        disabled={tempoRestante > 0 || reenviando}
      >
        {reenviando ? (
          <IonSpinner name="crescent" />
        ) : tempoRestante > 0 ? (
          `Reenviar em ${tempoRestante}s`
        ) : (
          "Reenviar código"
        )}
      </IonButton>
    </div>
  );
}
