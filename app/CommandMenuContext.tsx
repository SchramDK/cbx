'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CommandMenuContextType {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  toggle: () => void;
}

const CommandMenuContext = createContext<CommandMenuContextType | undefined>(undefined);

export function CommandMenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const toggle = () => setIsOpen((v) => !v);

  return (
    <CommandMenuContext.Provider value={{ isOpen, onOpen, onClose, toggle }}>
      {children}
    </CommandMenuContext.Provider>
  );
}

export function useCommandMenu() {
  const ctx = useContext(CommandMenuContext);
  if (!ctx) throw new Error('useCommandMenu must be used within CommandMenuProvider');
  return ctx;
}