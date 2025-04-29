import React, { useEffect, useState } from "react";
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
  const [showModal, setShowModal] = useState(isOpen);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      setClosing(false);
    } else {
      handleClose();
    }
  }, [isOpen]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setShowModal(false);
      onClose();
    }, 300);
  };

  if (!showModal) return null;

  return (
    <div className={`modal-overlay ${closing ? "fadeOut" : "fadeIn"}`}>
      <div className={`modal-content ${closing ? "slideDown" : "slideUp"}`}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={handleClose}>
            <IonIcon icon={closeSharp} className="close-icon" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={handleClose}>
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
