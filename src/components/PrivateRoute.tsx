import React from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";

interface PrivateRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const { authToken } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) =>
        authToken ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
};

export default PrivateRoute;
