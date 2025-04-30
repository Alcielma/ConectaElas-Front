import { IonIcon } from "@ionic/react";
import { warningOutline } from "ionicons/icons";
import "./inputErrorMessage.css";

export default function InputErrorMessage({ message }: { message: string }) {
  return (
    <p className="error-message">
      <IonIcon icon={warningOutline} style={{ marginRight: "5px" }} />
      {message}
    </p>
  );
}
