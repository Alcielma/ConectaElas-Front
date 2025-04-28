import React, { useEffect, useState } from "react";
import { useAuth } from "../Contexts/AuthContext";
import { useHistory } from "react-router-dom";
import { IonIcon } from "@ionic/react";
import { eye, eyeOff } from "ionicons/icons";
import "./Login.css";
import RenderRegisterComponent from "../components/RenderRegisterComponent";
// import { useIonRouter } from "@ionic/react";
import { Redirect } from "react-router-dom";
import { useIonRouter } from "@ionic/react";
import LmtsLogo from "../Assets/LmtsLogo.png";
import SECRETARIA_MUNICIPAL_DAS_MULHERES from "../Assets/SECRETARIA_MUNICIPAL_DAS_MULHERES.png";
import ACS from "../Assets/ACS.png";

export enum LoginScreens {
  LOGIN,
  REGISTER,
}

const Login: React.FC = () => {
  const { login, user } = useAuth();
  const history = useHistory();
  const ionRouter = useIonRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [screenState, setScreenState] = useState<LoginScreens>(
    LoginScreens.LOGIN
  );

  // useEffect(() => {
  //   if (user) {
  //      history.replace("/tabs/tab1");
  //   }
  // }, [user, history]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const loginSuccessful = await login(identifier, password);

    if (loginSuccessful) {
      // ionRouter.push("/tabs/tab1", "forward", "replace");
      history.replace("/tabs/tab1");
    } else {
      setError("Credenciais inválidas. Tente novamente.");
    }

    setLoading(false);
  };

  const renderLoginComponent = () => {
    return (
      <>
        <h2 className="login-title">Entrar na sua conta</h2>
        <div>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="identifier">E-mail ou Telefone</label>
              <input
                type="text"
                id="identifier"
                className="Input-Login"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Senha</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="Input-Login"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <IonIcon
                  icon={showPassword ? eyeOff : eye}
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password-icon"
                />
              </div>
            </div>

            {error && <p className="error-message">{error}</p>}

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
