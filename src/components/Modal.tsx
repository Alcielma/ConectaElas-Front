import React from "react";
import "./Modal.css";
import { closeSharp } from "ionicons/icons";
import { IonIcon } from "@ionic/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}>
            <IonIcon icon={closeSharp} className="close-icon" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="confirm-btn" onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
