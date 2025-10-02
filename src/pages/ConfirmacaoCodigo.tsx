import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonToast,
  IonSpinner,
} from "@ionic/react";
import React, { useRef, useState, useEffect } from "react";
import "./ConfirmacaoCodigo.css";
import { useAuth } from "../Contexts/AuthContext";
import AuthService from "../Services/AuthService";
import { useHistory } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useIonRouter } from "@ionic/react";

const NUM_DIGITS = 5;

const ConfirmacaoCodigo: React.FC = () => {
  const [code, setCode] = useState<string[]>(new Array(NUM_DIGITS).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { user } = useAuth();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [reenviando, setReenviando] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(0);
  const [toastMsg, setToastMsg] = useState("");
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const identifierFromURL = queryParams.get("identifier") || "";
  const router = useIonRouter();
  if (!identifierFromURL) {
    history.goBack();
    return null;
  }

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (tempoRestante > 0) {
      interval = setInterval(() => {
        setTempoRestante((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [tempoRestante]);

  const handleEnviarCodigo = async (codigo: string[]) => {
    const codigoDigitado = codigo.join("");
    setLoading(true);
    setErro("");

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const result = await AuthService.confirmarCodigo(
      identifierFromURL || "",
      codigoDigitado
    );

    if (result.success) {
      // history.replace("/Login");
      router.push("/Login", "forward");
    } else {
      setErro("Código inválido ou expirado. Tente novamente.");
    }

    setLoading(false);
  };

  const handleReenviarCodigo = async () => {
    if (!identifierFromURL) return;
    setReenviando(true);
    setTempoRestante(60);

    const result = await AuthService.reenviarCodigo(identifierFromURL);

    if (result.success) {
      setToastMsg("Código reenviado com sucesso!");
    } else {
      setToastMsg("Erro ao reenviar código. Tente novamente.");
    }

    setReenviando(false);
  };

  const handleChange = async (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < NUM_DIGITS - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (index === NUM_DIGITS - 1 && value) {
      await handleEnviarCodigo(newCode);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="header-gradient">
          <IonTitle className="center-title">Confirmação de e-mail</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="confirmacao-content" fullscreen>
        <div className="confirmacao-container">
          <h2>Verifique seu e-mail</h2>
          <p>Digite o código de 5 dígitos que enviamos para seu e-mail.</p>

          <div className="code-inputs">
            {code.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className={`code-input`}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputRefs.current[index] = el)}
                disabled={loading}
              />
            ))}
          </div>

          {(loading || reenviando) && (
            <span style={{ marginBottom: "1rem", marginTop: "1rem" }}>
              <IonSpinner name="crescent" color="light" />
            </span>
          )}

          <p id="texto-secundario-confirmacao">
            Caso não encontre, verifique sua caixa de spam ou lixo eletrônico.
          </p>

          {erro && <p style={{ color: "red", marginTop: 10 }}>{erro}</p>}

          <p className="reenviar-codigo-texto">
            Não recebeu o código?
            <span
              className="reenviar-link"
              onClick={tempoRestante === 0 ? handleReenviarCodigo : undefined}
              style={{
                pointerEvents: tempoRestante === 0 ? "auto" : "none",
                opacity: tempoRestante === 0 ? 1 : 0.6,
              }}
            >
              {tempoRestante > 0
                ? ` Reenviar em ${tempoRestante}s`
                : " Reenviar"}
            </span>
          </p>
        </div>

        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg}
          duration={3000}
          onDidDismiss={() => setToastMsg("")}
        />
      </IonContent>
    </IonPage>
  );
};

export default ConfirmacaoCodigo;
