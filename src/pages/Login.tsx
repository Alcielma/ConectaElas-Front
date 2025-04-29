import React, { useState } from "react";
import { useAuth } from "../Contexts/AuthContext";
import { useHistory } from "react-router-dom";
import { IonIcon } from "@ionic/react";
import { eye, eyeOff } from "ionicons/icons";
import "./Login.css";
import RenderRegisterComponent from "../components/RenderRegisterComponent";
import { useIonRouter } from "@ionic/react";
import LmtsLogo from "../Assets/LmtsLogo.png";
import SECRETARIA_MUNICIPAL_DAS_MULHERES from "../Assets/SECRETARIA_MUNICIPAL_DAS_MULHERES.png";
import ACS from "../Assets/ACS.png";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export enum LoginScreens {
  LOGIN,
  REGISTER,
}

const schema = z.object({
  identifier: z.union([
    z.string().email("Email ou CPF inválido."),
    z
      .string()
      .regex(/^[0-9]+$/, "Email ou CPF inválido.")
      .length(11, "CPF inválido."),
  ]),
  password: z
    .string()
    .nonempty("A senha não pode ficar vazia.")
    .min(8, "A senha deve ter pelo menos 8 dígitos."),
});

type FormData = z.infer<typeof schema>;

const Login: React.FC = () => {
  const { login } = useAuth();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [screenState, setScreenState] = useState<LoginScreens>(
    LoginScreens.LOGIN
  );
  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  // useEffect(() => {
  //   if (user) {
  //      history.replace("/tabs/tab1");
  //   }
  // }, [user, history]);

  const handleLogin = async (data: FieldValues) => {
    setLoading(true);

    const { identifier, password } = data;
    const response = await login(identifier, password);

    if (response.success) {
      const firstLogin = localStorage.getItem("onboardingComplete");
      if (!firstLogin) {
        history.replace("/onboarding");
      } else {
        history.replace("/tabs/tab1");
      }
    } else {
      setError("root", { message: "Credenciais inválidas. Tente novamente." });
    }

    setLoading(false);
  };

  const renderLoginComponent = () => {
    return (
      <>
        <h2 className="login-title">Entrar na sua conta</h2>
        <div>
          <form onSubmit={handleSubmit(handleLogin)}>
            <div className="input-group">
              <label htmlFor="identifier">E-mail ou CPF</label>
              <input
                type="text"
                className="Input-Login"
                {...register("identifier")}
              />
              {errors.identifier && (
                <p className="error-message">{errors.identifier.message}</p>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="password">Senha</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  className="Input-Login"
                  {...register("password")}
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

            {errors.root && (
              <p className="error-message">{errors.root.message}</p>
            )}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
          <p className="signup-prompt">
            Ainda não tem uma conta?{" "}
            <span
              className="signup-link"
              onClick={() => handleChangeScreen(LoginScreens.REGISTER)}
            >
              Cadastre-se aqui
            </span>
          </p>
          <div className="parceiros-box">
            <p className="parceiros-tittle">Parceiros:</p>
            <div className="parceiros">
              <div className="parceiro">
                <img src={LmtsLogo} alt="" className="lmts" />
                {/* <div className="caption">Legenda</div> */}
              </div>
              <div className="parceiro">
                <img
                  src={SECRETARIA_MUNICIPAL_DAS_MULHERES}
                  alt=""
                  className="secretaria"
                />
                {/* <div className="caption">Legenda</div> */}
              </div>
              <div className="parceiro">
                <img src={ACS} alt="" className="ACS" />
                {/* <div className="caption">Legenda</div> */}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const handleChangeScreen = (screen: LoginScreens) => {
    setScreenState(screen);
  };

  return (
    <div className="login-container">
      <div
        className={`login-box ${
          screenState === LoginScreens.REGISTER && "full"
        }`}
      >
        {screenState === LoginScreens.LOGIN && renderLoginComponent()}
        {screenState === LoginScreens.REGISTER && (
          <RenderRegisterComponent handleChangeScreen={handleChangeScreen} />
        )}
      </div>
    </div>
  );
};

export default Login;
