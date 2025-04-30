import React, { useEffect, useState } from "react";
import { IonIcon, IonSpinner } from "@ionic/react";
import { arrowBack, eye, eyeOff } from "ionicons/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../Contexts/AuthContext";
import { LoginScreens } from "../pages/Login";
import "./RenderRegisterComponent.css";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import { isValidCPF } from "../utils/utils";
import InputErrorMessage from "./inputErrorMessage";
import { maskCpf, unMaskNumbers } from "../utils/mask";

interface RenderRegisterComponentProps {
  handleChangeScreen: (screen: LoginScreens) => void;
}

const schema = z
  .object({
    email: z
      .string()
      .nonempty("E-mail não pode ser vazio")
      .email("E-mail inválido"),
    password: z.string().min(8, "A senha deve ter pelo menos 8 digitos"),
    username: z
      .string()
      .nonempty("CPF não pode ser vazio")
      .refine((cpf) => isValidCPF(cpf), {
        message: "CPF inválido",
      }),
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
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const usernameValue = watch("username");

  useEffect(() => {
    if (usernameValue) setValue("username", maskCpf(usernameValue));
  }, [usernameValue]);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (data: FieldValues) => {
    setLoading(true);

    let { username, email, password } = data;
    username = unMaskNumbers(username);
    const response = await register(username, email, password);

    if (response.success) {
      handleChangeScreen(LoginScreens.LOGIN);
    } else {
      if (response.message === "Email or Username are already taken") {
        setError("root", {
          message: "Email ou CPF já cadastrado!",
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
            <label htmlFor="username">CPF</label>
            <input
              type="text"
              placeholder="CPF"
              {...formRegister("username")}
            />
            {errors.username && errors.username.message && (
              <InputErrorMessage message={errors.username.message} />
            )}
          </div>

          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              placeholder="E-mail"
              {...formRegister("email")}
            />
            {errors.email && errors.email.message && (
              <InputErrorMessage message={errors.email.message} />
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
                placeholder="Digite sua senha"
                type={showPassword ? "text" : "password"}
                {...formRegister("password")}
              />
              <IonIcon
                icon={showPassword ? eyeOff : eye}
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password-icon"
              />
            </div>
            {errors.password && errors.password.message && (
              <InputErrorMessage message={errors.password.message} />
            )}
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Digite a senha novamente</label>
            <div className="password-input-container">
              <input
                placeholder="Digite sua senha novamente"
                type={showConfirmPassword ? "text" : "password"}
                {...formRegister("confirmPassword")}
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

          {errors.root && errors.root.message && (
            <InputErrorMessage message={errors.root.message} />
          )}

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? (
              <IonSpinner name="crescent" color="light" />
            ) : (
              "Cadastrar"
            )}
          </button>
        </form>
      </div>
      <div style={{ width: "44px" }} />
    </div>
  );
};

export default RenderRegisterComponent;
