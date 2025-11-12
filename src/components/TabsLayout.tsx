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
import { Redirect, Route, RouteComponentProps } from "react-router-dom";
import {
  homeSharp,
  personSharp,
  radioSharp,
  informationCircleSharp,
  clipboardSharp,
} from "ionicons/icons";
import Tab1 from "../pages/Tab1";
import Tab2 from "../pages/Tab2";
import Tab3 from "../pages/Tab3";
import UserChat from "../pages/UserChat";
import ReportChannels from "../pages/ReportChannels";
import AssistantChatList from "../pages/AssistantChatList";
import Teste from "../pages/teste";
import AngelContact from "../pages/AngelContact";
import PrivateRoute from "./PrivateRoute";
import Sobre from "../pages/Sobre";
import QuizList from "../pages/QuizList";
import QuizDetail from "../pages/QuizDetail";
import QuizProgress from "../pages/QuizProgress";
import TestLocalStorage from "../pages/TestLocalStorage";
import QuizManagement from "../pages/QuizManagement";
const QuizResult = React.lazy(() => import("../pages/QuizResult"));

const TabsLayout: React.FC = () => {
  const [isPending, startTransition] = useTransition();
  
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

      <IonTabBar slot="bottom" selectedTab="tab2">
        <IonTabButton tab="tab1" href="/tabs/tab1">
          <IonIcon aria-hidden="true" icon={homeSharp} />
          <IonLabel>Início</IonLabel>
        </IonTabButton>
        <IonTabButton tab="tab2" href="/tabs/tab2">
          <IonIcon aria-hidden="true" icon={radioSharp} />
          <IonLabel>Conexões</IonLabel>
        </IonTabButton>
        <IonTabButton tab="quiz" href="/tabs/quiz">
          <IonIcon aria-hidden="true" icon={clipboardSharp} />
          <IonLabel>Quiz</IonLabel>
        </IonTabButton>
        <IonTabButton tab="tab3" href="/tabs/sobre">
          <IonIcon aria-hidden="true" icon={informationCircleSharp} />
          <IonLabel>Sobre</IonLabel>
        </IonTabButton>
        <IonTabButton tab="tab4" href="/tabs/tab3">
          <IonIcon aria-hidden="true" icon={personSharp} />
          <IonLabel>Perfil</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default TabsLayout;
