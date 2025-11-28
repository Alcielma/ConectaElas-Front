import React, { Suspense, useTransition } from "react";
import {
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonSpinner,
} from "@ionic/react";
import { Redirect, Route, RouteComponentProps, useLocation } from "react-router-dom";
import {
  homeSharp,
  personSharp,
  radioSharp,
  informationCircleSharp,
  gameControllerSharp,
} from "ionicons/icons";
import Tab1 from "../pages/Tab1";
import Tab2 from "../pages/Tab2";
import Tab3 from "../pages/Tab3";
import UserChat from "../pages/UserChat";
import ReportChannels from "../pages/ReportChannels";
import AngelContact from "../pages/AngelContact";
import PrivateRoute from "./PrivateRoute";
import Sobre from "../pages/Sobre";
import QuizList from "../pages/QuizList";
import QuizDetail from "../pages/QuizDetail";
import QuizProgress from "../pages/QuizProgress";
import TestLocalStorage from "../pages/TestLocalStorage";
import QuizManagement from "../pages/QuizManagement";
import Games from "../pages/Games";
import MemoryThemeList from "../pages/MemoryThemeList";
import MemoryThemeGame from "../pages/MemoryThemeGame";
const QuizResult = React.lazy(() => import("../pages/QuizResult"));

const TabsLayout: React.FC = () => {
  const [isPending, startTransition] = useTransition();
  const location = useLocation();

  const path = location.pathname;
  let selectedTab: string = "tab2";
  if (path.startsWith("/tabs/tab1")) selectedTab = "tab1";
  else if (
    path.startsWith("/tabs/tab2") ||
    path.startsWith("/tabs/chat") ||
    path.startsWith("/tabs/ReportChannels") ||
    path.startsWith("/tabs/AngelContact")
  ) selectedTab = "tab2";
  else if (
    path.startsWith("/tabs/games") ||
    path.startsWith("/tabs/quiz") ||
    path.startsWith("/tabs/quiz-detail") ||
    path.startsWith("/tabs/quiz-result") ||
    path.startsWith("/tabs/quiz-progress") ||
    path.startsWith("/tabs/quiz-management")
  ) selectedTab = "games";
  else if (path.startsWith("/tabs/sobre")) selectedTab = "sobre";
  else if (path.startsWith("/tabs/tab3")) selectedTab = "tab3";
  
  return (
    <IonTabs>
      <IonRouterOutlet>
        <PrivateRoute exact path="/tabs/tab1" component={Tab1} />
        <PrivateRoute exact path="/tabs/tab2" component={Tab2} />
        <PrivateRoute exact path="/tabs/tab3" component={Tab3} />
        <PrivateRoute exact path="/tabs/chat" component={UserChat} />
        <Route exact path="/tabs/sobre" component={Sobre} />

        <PrivateRoute
          exact
          path="/tabs/ReportChannels"
          component={ReportChannels}
        />
        <PrivateRoute
          exact
          path="/tabs/AngelContact"
          component={AngelContact}
        />
        <PrivateRoute exact path="/tabs/quiz" component={QuizList} />
        <PrivateRoute exact path="/tabs/quiz-detail/:id" component={QuizDetail} />
        <PrivateRoute exact path="/tabs/quiz-progress" component={QuizProgress} />
        <PrivateRoute exact path="/tabs/quiz-management" component={QuizManagement} />
        <PrivateRoute exact path="/tabs/games" component={Games} />
        <PrivateRoute exact path="/tabs/games/memory" component={MemoryThemeList} />
        <PrivateRoute exact path="/tabs/games/memory/:id" component={MemoryThemeGame} />
        <PrivateRoute 
          exact 
          path="/tabs/quiz-result/:id" 
          render={(props: RouteComponentProps) => (
            <Suspense fallback={
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
                <IonSpinner name="crescent" />
                <p>Carregando resultado...</p>
              </div>
            }>
             <QuizResult />
            </Suspense>
          )}
        />
        <Route exact path="/tabs/test-localstorage" component={TestLocalStorage} />
      </IonRouterOutlet>

      <IonTabBar slot="bottom" selectedTab={selectedTab}>
        <IonTabButton tab="tab1" href="/tabs/tab1">
          <IonIcon aria-hidden="true" icon={homeSharp} />
          <IonLabel>Início</IonLabel>
        </IonTabButton>
        <IonTabButton tab="tab2" href="/tabs/tab2">
          <IonIcon aria-hidden="true" icon={radioSharp} />
          <IonLabel>Conexões</IonLabel>
        </IonTabButton>
        <IonTabButton tab="games" href="/tabs/games">
          <IonIcon aria-hidden="true" icon={gameControllerSharp} />
          <IonLabel>Jogos</IonLabel>
        </IonTabButton>
        <IonTabButton tab="sobre" href="/tabs/sobre">
          <IonIcon aria-hidden="true" icon={informationCircleSharp} />
          <IonLabel>Sobre</IonLabel>
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
