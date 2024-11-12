import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import { arrowBack } from "ionicons/icons";
import { IonIcon } from "@ionic/react";
import "./Register.css";

const Register: React.FC = () => {
  const { register } = useAuth();
  const history = useHistory();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const success = await register(username, email, password);
    if (success) {
      history.push("/login");
    } else {
      setError("Erro ao cadastrar usuário. Tente novamente.");
    }

    setLoading(false);
  };

  return (
    <div className="register-container">
      <div className="back-button" onClick={() => history.push("/login")}>
        <IonIcon icon={arrowBack} />
      </div>
      <div className="register-box">
        <h2>Cadastro</h2>
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
