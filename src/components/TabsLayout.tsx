import React from "react";
import {
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from "@ionic/react";
import { Redirect, Route } from "react-router-dom";
import { chatboxSharp, homeSharp, personSharp } from "ionicons/icons";
import Tab1 from "../pages/Tab1";
import Tab2 from "../pages/Tab2";
import Tab3 from "../pages/Tab3";

const TabsLayout: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/tabs/tab1" component={Tab1} />
        <Route exact path="/tabs/tab2" component={Tab2} />
        <Route path="/tabs/tab3" component={Tab3} />

        {/* Redireciona "/tabs" para a primeira tab */}
        <Route exact path="/tabs">
          <Redirect to="/tabs/tab1" />
        </Route>
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="tab1" href="/tabs/tab1">
          <IonIcon aria-hidden="true" icon={homeSharp} />
          <IonLabel>Início</IonLabel>
        </IonTabButton>
        {/* <IonTabButton tab="tab2" href="/tabs/tab2">
          <IonIcon aria-hidden="true" icon={alertCircleSharp} />
          <IonLabel>Emergência</IonLabel>
        </IonTabButton> */}
        <IonTabButton tab="tab2" href="/tabs/tab2">
          <IonIcon aria-hidden="true" icon={chatboxSharp} />
          <IonLabel>Comunicação</IonLabel>
        </IonTabButton>
        <IonTabButton tab="tab3" href="/tabs/tab3">
          <IonIcon aria-hidden="true" icon={personSharp} />
          <IonLabel>Perfil</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default TabsLayout;
