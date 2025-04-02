import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import Login from "../pages/Login";

interface PrivateRouteProps {
  component: React.ComponentType<any>;
  path: string;
  exact?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const { user } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => (user ? <Component {...props} /> : <Login />)}
    />
  );
};

export default PrivateRoute;
