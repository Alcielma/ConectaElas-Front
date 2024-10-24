import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";

interface PrivateRouteProps {
  component: React.ComponentType<any>;
  path: string;
  exact?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const { user } = useAuth(); // Obtém o estado do usuário autenticado

  return (
    <Route
      {...rest}
      render={(props) =>
        user ? ( // Se o usuário está autenticado, renderiza o componente da rota
          <Component {...props} />
        ) : (
          // Se não estiver autenticado, redireciona para a tela de login
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default PrivateRoute;
