import { Route, Redirect, RouteComponentProps } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import Login from "../pages/Login";

interface PrivateRouteProps {
  component?: React.ComponentType<RouteComponentProps>;
  render?: (props: RouteComponentProps) => JSX.Element;
  path: string;
  exact?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component: Component,
  render,
  ...rest
}) => {
  const { user } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!user) return <Login />;
        if (Component) return <Component {...props} />;
        if (render) return render(props);
        return null;
      }}
    />
  );
};

export default PrivateRoute;
