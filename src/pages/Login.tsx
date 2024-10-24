import React, { useEffect, useState } from "react";
import { useAuth } from "../Contexts/AuthContext";
import { useHistory } from "react-router-dom";
import "./Login.css";

const Login: React.FC = () => {
  const { login, user } = useAuth(); // Obtém o estado do usuário autenticado
  const history = useHistory();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verifica se o usuário já está autenticado
  useEffect(() => {
    if (user) {
      history.push("/tabs/tab1"); // Redireciona para a Tab1 se o usuário já estiver autenticado
    }
  }, [user, history]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const loginSuccessful = await login(identifier, password);

    if (loginSuccessful) {
      history.push("/tabs/tab1"); // Redireciona após login bem-sucedido
    } else {
      setError("Credenciais inválidas. Tente novamente.");
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="identifier">Email ou Username</label>
            <input
              type="text"
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Entrando..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
