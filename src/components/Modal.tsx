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

  // Verifica se há conteúdo no children
  const hasContent = children && React.Children.count(children) > 0;

  return (
    <div className={`app-modal-overlay ${closing ? "fadeOut" : "fadeIn"}`}>
      <div
        className={`app-modal-content ${closing ? "slideDown" : "slideUp"} ${
          !hasContent ? "app-modal-content-compact" : ""
        }`}
      >
        <div className="app-modal-header">
          <h3 className="app-modal-title">{title}</h3>
          <button
            type="button"
            className="app-modal-close-btn"
            onClick={handleClose}
            aria-label="Fechar"
          >
            <IonIcon icon={closeSharp} />
          </button>
        </div>
        {hasContent && (
          <div className="app-modal-body">{children}</div>
        )}
        <div className="app-modal-footer">
          <button className="confirm-btn" onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
