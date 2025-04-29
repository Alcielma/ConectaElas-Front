import React, { useState } from "react";
import { IonIcon } from "@ionic/react";
import { arrowBack, eye, eyeOff } from "ionicons/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../Contexts/AuthContext";
import { LoginScreens } from "../pages/Login";
import "./RenderRegisterComponent.css";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";

interface RenderRegisterComponentProps {
  handleChangeScreen: (screen: LoginScreens) => void;
}

const schema = z
  .object({
    email: z
      .string()
      .nonempty("E-mail não pode ser vazio")
      .email("E-mail inválido"),
    username: z
      .string()
      .min(3, "O nome não é grande o suficiente")
      .max(50, "O nome é muito grande"),
    password: z.string().min(8, "A senha deve ter pelo menos 8 digitos"),
    confirmPassword: z.string().min(8, "A senha deve ter pelo menos 8 digitos"),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "As senhas devem ser iguais",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

const RenderRegisterComponent: React.FC<RenderRegisterComponentProps> = ({
  handleChangeScreen,
}) => {
  const { register } = useAuth();
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (data: FieldValues) => {
    setLoading(true);

    const { username, email, password } = data;
    const response = await register(username, email, password);

    if (response.success) {
      handleChangeScreen(LoginScreens.LOGIN);
    } else {
      if (response.message === "Email or Username are already taken") {
        setError("root", {
          message: "Email ou nome de usuário já está em uso!",
        });
      } else {
        setError("root", {
          message: "Houve um erro ao tenta cadastrar. Tente novamente",
        });
      }
    }

    setLoading(false);
  };

  return (
    <div className="register-container">
      <div className="top-box">
        <div
          className="back-button"
          onClick={() => handleChangeScreen(LoginScreens.LOGIN)}
        >
          <IonIcon icon={arrowBack} />
        </div>
      </div>
      <div className="register-box">
        <h2 className="login-title">Criando uma conta</h2>
        <form onSubmit={handleSubmit(handleRegister)}>
          <div className="input-group">
            <label htmlFor="username">Como você prefere ser chamada?</label>
            <input
              type="text"
              placeholder="Nome de usuário"
              {...formRegister("username", { required: true, maxLength: 80 })}
            />
            {errors.username && (
              <p className="error-message">{errors.username.message}</p>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              placeholder="E-mail"
              {...formRegister("email")}
            />
            {errors.email && (
              <p className="error-message">{errors.email.message}</p>
            )}
          </div>

          <div className="input-group">
            <div className="password-label-box">
              <label htmlFor="password" className="label-password">
                Qual a senha que você deseja utilizar no aplicativo?
              </label>
              <p>para sua segurança evite usar uma senha que você já utiliza</p>
            </div>

            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                {...formRegister("password")}
              />
              <IonIcon
                icon={showPassword ? eyeOff : eye}
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password-icon"
              />
            </div>
            {errors.password && (
              <p className="error-message">{errors.password.message}</p>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Digite a senha novamente</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...formRegister("confirmPassword")}
              />
              <IonIcon
                icon={showConfirmPassword ? eyeOff : eye}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="toggle-password-icon"
              />
            </div>
            {errors.confirmPassword && (
              <p className="error-message">{errors.confirmPassword.message}</p>
            )}
          </div>

          {errors.root && (
            <p className="error-message">{errors.root.message}</p>
          )}

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>
      </div>
      <div style={{ width: "44px" }} />
    </div>
  );
};

export default RenderRegisterComponent;
