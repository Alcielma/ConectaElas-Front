import React, { useEffect, useState } from 'react';
import { IonToast } from '@ionic/react';
import './Toast.css';

interface ToastProps {
  isOpen: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onDidDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({
  isOpen,
  message,
  type,
  duration = 2000,
  onDidDismiss
}) => {
  const getColor = () => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      case 'info':
        return 'primary';
      default:
        return 'dark';
    }
  };

  return (
    <IonToast
      isOpen={isOpen}
      message={message}
      duration={duration}
      color={getColor()}
      onDidDismiss={onDidDismiss}
      position="top"
      cssClass={`custom-toast toast-${type}`}
    />
  );
};

export default Toast;