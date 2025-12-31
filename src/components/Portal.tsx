// src/components/Portal.tsx
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  wrapperId?: string; // Opcional: ID para o elemento onde o portal será montado
}

const Portal: React.FC<PortalProps> = ({ children, wrapperId = "portal-wrapper" }) => {
  const [wrapperElement, setWrapperElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let element = document.getElementById(wrapperId);
    let systemCreated = false;

    if (!element) {
      systemCreated = true;
      element = document.createElement('div');
      element.setAttribute('id', wrapperId);
      document.body.appendChild(element);
    }
    setWrapperElement(element);

    return () => {
      // Limpa se o elemento foi criado pelo sistema
      if (systemCreated && element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, [wrapperId]);

  if (wrapperElement === null) return null;

  return createPortal(children, wrapperElement);
};

export default Portal;