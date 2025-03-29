import React, { useEffect, useState } from "react";
import { useAuth } from "../Contexts/AuthContext";
import { useHistory } from "react-router-dom";
import { IonIcon } from "@ionic/react";
import { eye, eyeOff } from "ionicons/icons";
import "./Login.css";
import RenderRegisterComponent from "../components/RenderRegisterComponent";

export enum LoginScreens {
  LOGIN,
  REGISTER,
}

const Login: React.FC = () => {
  const { login, user } = useAuth();
  const history = useHistory();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [screenState, setScreenState] = useState<LoginScreens>(
    LoginScreens.LOGIN
  );

  useEffect(() => {
    if (user && window.location.pathname === "/login") {
      history.push("/tabs/tab1");
    }
  }, [user, history]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const loginSuccessful = await login(identifier, password);

    if (!loginSuccessful) {
      setError("Credenciais inválidas. Tente novamente.");
    }

    setLoading(false);
  };

  const renderLoginComponent = () => {
    return (
      <>
        <h2 className="login-title">Login</h2>
        <div>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="identifier">Email ou Username</label>
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
              {loading ? "Entrando..." : "Login"}
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
