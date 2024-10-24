import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { App as CapacitorApp } from "@capacitor/app"; // Plugin Capacitor para manipular o botão de voltar
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import { AuthProvider } from "./Contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import TabsLayout from "./components/TabsLayout";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */
import "@ionic/react/css/palettes/dark.system.css";
import "./theme/variables.css";

setupIonicReact();

const App: React.FC = () => {
  const [backPressTime, setBackPressTime] = useState(0);

  useEffect(() => {
    // Adiciona listener para o evento de botão de "voltar" no Android
    CapacitorApp.addListener("backButton", (event) => {
      if (window.location.pathname === "/tabs/tab1") {
        // Usuário está na página principal, precisa pressionar "voltar" duas vezes para sair
        if (backPressTime === 0) {
          setBackPressTime(Date.now());
          alert("Pressione novamente para sair do aplicativo");
        } else if (Date.now() - backPressTime < 2000) {
          CapacitorApp.exitApp(); // Fecha o app se o usuário pressionar duas vezes em 2 segundos
        } else {
          setBackPressTime(0); // Reseta o tempo se passar mais de 2 segundos
        }
      } else {
        // Comportamento normal de "voltar" em outras páginas
        window.history.back();
      }
    });

    return () => {
      // Remove o listener quando o componente for desmontado
      CapacitorApp.removeAllListeners();
    };
  }, [backPressTime]);

  return (
    <IonApp>
      <AuthProvider>
        <IonReactRouter>
          <IonRouterOutlet>
            {/* Rota pública para login */}
            <Route exact path="/login">
              <Login />
            </Route>

            {/* Rotas privadas com tabs */}
            <PrivateRoute path="/tabs" component={TabsLayout} />

            {/* Redireciona para login se o caminho for a raiz */}
            <Route exact path="/">
              <Redirect to="/login" />
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
      </AuthProvider>
    </IonApp>
  );
};

export default App;
