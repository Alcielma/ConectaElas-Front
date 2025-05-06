import {
  IonButton,
  IonIcon,
  IonItem,
  IonSpinner,
  useIonRouter,
} from "@ionic/react";
import { eye, eyeOff, lockClosed } from "ionicons/icons";
import { useState } from "react";
import { ToastItem } from "../../../utils/utils";
import AuthService from "../../../Services/AuthService";
import { z } from "zod";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputErrorMessage from "../../inputErrorMessage";
import "./styles.css";

interface props {
  code: string[];
  handleToastMessage: (toastItem: ToastItem) => void;
}

const schema = z
  .object({
    newPassword: z.string().min(8, "A senha deve ter pelo menos 8 digitos"),
    confirmPassword: z.string().min(8, "A senha deve ter pelo menos 8 digitos"),
  })
  .refine(
    ({ newPassword, confirmPassword }) => newPassword === confirmPassword,
    {
      message: "As senhas devem ser iguais",
      path: ["confirmPassword"],
    }
  );

type FormData = z.infer<typeof schema>;

export default function SlideConfirmPassword({
  code,
  handleToastMessage,
}: props) {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const ionRouter = useIonRouter();

  const handlePasswordSubmit = async (data: FieldValues) => {
    const { newPassword, confirmPassword } = data;

    if (newPassword.length < 6) {
      handleToastMessage({
        message: "A senha deve ter pelo menos 6 caracteres",
        color: "danger",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      handleToastMessage({
        message: "As senhas não coincidem",
        color: "danger",
      });
      return;
    }

    setLoading(true);
    const response = await AuthService.recuperarSenha(
      code.join(""),
      newPassword
    );

    if (response.success) {
      handleToastMessage({
        message: "Senha alterada com sucesso!",
        color: "success",
      });
      ionRouter.push("/login");
    } else {
      handleToastMessage({
        message: response.message ?? "Erro ao alterar senha. Tente novamente.",
        color: "danger",
      });
    }

    setLoading(false);
  };

  return (
    <div className="ion-text-center ion-padding">
      <IonIcon
        icon={lockClosed}
        color="primary"
        style={{ fontSize: "4rem", marginBottom: "20px" }}
      />
      <h2>Nova Senha</h2>
      <p>Crie uma nova senha para sua conta</p>

      <form onSubmit={handleSubmit(handlePasswordSubmit)}>
        <div className="input-group">
          <label htmlFor="confirmPassword">Digite a senha novamente</label>
          <div className="password-input-container">
            <input
              placeholder="Digite sua senha"
              type={showPassword ? "text" : "password"}
              {...register("newPassword")}
            />
            <IonIcon
              icon={showPassword ? eyeOff : eye}
              onClick={() => setShowPassword(!showPassword)}
              className="toggle-password-icon"
            />
          </div>
          {errors.newPassword && errors.newPassword.message && (
            <InputErrorMessage message={errors.newPassword.message} />
          )}
        </div>

        <div className="input-group">
          <label htmlFor="confirmPassword">Digite a senha novamente</label>
          <div className="password-input-container">
            <input
              placeholder="Digite sua senha novamente"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
            />
            <IonIcon
              icon={showConfirmPassword ? eyeOff : eye}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="toggle-password-icon"
            />
          </div>
          {errors.confirmPassword && errors.confirmPassword.message && (
            <InputErrorMessage message={errors.confirmPassword.message} />
          )}
        </div>

        <IonButton
          expand="block"
          className="ion-margin-top"
          type="submit"
          disabled={loading}
        >
          {loading ? <IonSpinner name="crescent" /> : "Alterar Senha"}
        </IonButton>
      </form>
    </div>
  );
}
