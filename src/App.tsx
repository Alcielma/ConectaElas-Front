import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { App as CapacitorApp } from "@capacitor/app";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import { AuthProvider } from "./Contexts/AuthContext";
import { ChatProvider } from "./Contexts/ChatContext";
import PrivateRoute from "./components/PrivateRoute";
import TabsLayout from "./components/TabsLayout";
import Register from "./pages/Register";
import AssistantChat from "./pages/AssistantChat";
import AssistantChatList from "./pages/AssistantChatList";
import UserChat from "./pages/UserChat";

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
import Teste from "./pages/teste";

setupIonicReact();

const App: React.FC = () => {
  const [backPressTime, setBackPressTime] = useState(0);

  useEffect(() => {
    CapacitorApp.addListener("backButton", (event) => {
      if (window.location.pathname === "/tabs/tab1") {
        if (backPressTime === 0) {
          setBackPressTime(Date.now());
          alert("Pressione novamente para sair do aplicativo");
        } else if (Date.now() - backPressTime < 2000) {
          CapacitorApp.exitApp();
        } else {
          setBackPressTime(0);
        }
      } else {
        window.history.back();
      }
    });

    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, [backPressTime]);

  return (
    <IonApp>
      <AuthProvider>
        <ChatProvider>
          {" "}
          <IonReactRouter>
            <IonRouterOutlet>
              <Route exact path="/login" component={Login} />
              <Route exact path="/register" component={Register} />
              <PrivateRoute path="/tabs" component={TabsLayout} />
              <Route
                exact
                path="/assistantChats"
                component={AssistantChatList}
              />
              <PrivateRoute
                path="/assistantChats/:chatId"
                component={AssistantChat}
              />

              <Route exact path="/">
                <Redirect to="/login" />
              </Route>
            </IonRouterOutlet>
          </IonReactRouter>
        </ChatProvider>
      </AuthProvider>
    </IonApp>
  );
};

export default App;
