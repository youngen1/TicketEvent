import React, { createContext, useContext, useState } from 'react';

type ModalContextType = {
  openLoginModal: () => void;
  openSignupModal: () => void;
  openCreateEventModal: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ 
  children, 
  setIsLoginModalOpen, 
  setIsSignupModalOpen, 
  setIsCreateModalOpen 
}: { 
  children: React.ReactNode;
  setIsLoginModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSignupModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsCreateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const openSignupModal = () => {
    setIsSignupModalOpen(true);
  };

  const openCreateEventModal = () => {
    setIsCreateModalOpen(true);
  };

  return (
    <ModalContext.Provider 
      value={{
        openLoginModal,
        openSignupModal,
        openCreateEventModal
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
