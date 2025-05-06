import { IonButton, IonIcon, IonSpinner } from "@ionic/react";
import { mail } from "ionicons/icons";
import { useState } from "react";
import { ToastItem } from "../../../utils/utils";
import AuthService from "../../../Services/AuthService";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import InputErrorMessage from "../../inputErrorMessage";

interface props {
  handleChange: (value: string) => void;
  handleToNextSlide: () => void;
  handleToastMessage: (toastItem: ToastItem) => void;
}

const schema = z.object({
  email: z.string().email("E-mail inválido"),
});

type FormData = z.infer<typeof schema>;

export default function SlideSendEmail({
  handleChange,
  handleToNextSlide,
  handleToastMessage,
}: props) {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (data: FieldValues) => {
    const { email } = data;

    if (!email) {
      handleToastMessage({
        message: "Por favor, insira seu e-mail",
        color: "danger",
      });
      return;
    }

    setLoading(true);
    const response = await AuthService.enviarCodigoSenha(email);

    if (response.success) {
      handleChange(email);
      handleToastMessage({
        message: "Código de verificação enviado para seu e-mail",
        color: "success",
      });
      handleToNextSlide();
    } else {
      handleToastMessage({
        message:
          response.message ??
          "Não foi possível enviar o código. Verifique se você digitou seu e-mail corretamente.",
        color: "danger",
      });
    }

    setLoading(false);
  };

  return (
    <div className="ion-text-center ion-padding">
      <IonIcon
        icon={mail}
        color="primary"
        style={{ fontSize: "4rem", marginBottom: "20px" }}
      />
      <h2>Recuperar senha</h2>
      <p>Digite seu e-mail cadastrado para receber um código de verificação</p>

      <div>
        <form onSubmit={handleSubmit(handleEmailSubmit)}>
          <div className="input-group">
            <label htmlFor="identifier">E-mail</label>
            <input
              type="text"
              className="Input-Login"
              placeholder="Email ou CPF"
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && errors.email.message && (
              <InputErrorMessage message={errors.email.message} />
            )}
          </div>

          <IonButton
            expand="block"
            className="ion-margin-top"
            type="submit"
            disabled={loading}
          >
            {loading ? <IonSpinner name="crescent" /> : "Enviar Código"}
          </IonButton>
        </form>
      </div>
    </div>
  );
}
