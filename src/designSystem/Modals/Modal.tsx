'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { useGlobalStore } from 'app/stores/globalStore';
import Container from 'components/layout/Container';
import { twMerge } from 'tailwind-merge';

export const ModalBackground = ({
  isVisible,
  onClick,
  children,
}: {
  isVisible: boolean;
  onClick: () => void;
  children: ReactNode;
}) => {
  return (
    <div
      className={`${
        isVisible
          ? 'opacity-1 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
      } transition-all fixed top-0 right-0 bottom-0 w-full bg-hg-black/50 z-40 `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const Modal2 = ({
  isVisible,
  setIsVisible,
  width,
  height,
  className,
  type = 'right',
  hideModalBackground = false,
  closeOnEsc = false,
  children,
  ...rest
}: {
  isVisible: boolean;
  setIsVisible?: (value: boolean) => void;
  width?: string;
  height?: string;
  className?: string;
  type?: 'right' | 'bottom' | 'center';
  closeOnEsc?: boolean;
  children: ReactNode;
  [key: string]: any;
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [mouseDownOnBackdrop, setMouseDownOnBackdrop] = useState<boolean>(false);
  
  useEffect(() => {
    setIsModalOpen(isVisible);
  }, [isVisible]);

  const handleClose = () => {
    setIsModalOpen(false);
    if (setIsVisible) {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    if (!closeOnEsc || !isVisible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeOnEsc, isVisible]);

  let animationStyles = `
    ${type === 'right' ? 'translate-x-[105%]' : ' '}
    ${type === 'bottom' ? 'translate-y-[105%]' : ' '}
    ${type === 'center' ? 'translate-y-[200%]' : ' '}
  `;

  if (isVisible && isModalOpen) {
    animationStyles = `
      ${type === 'right' ? 'translate-x-[0%]' : ''}
      ${type === 'bottom' ? 'translate-y-[0%]' : ''}
      ${type === 'center' ? 'translate-y-[0%]' : ''}
    `;
  }

  if (type === 'center') {
    return (
      <div
        className={`transition-all fixed inset-0 z-50 ${animationStyles}`}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            setMouseDownOnBackdrop(true);
          }
        }}
        onMouseUp={(e) => {
          if (e.target === e.currentTarget && mouseDownOnBackdrop) {
            handleClose();
          }
          setMouseDownOnBackdrop(false);
        }}
      >
        <Container className="h-full relative pointer-events-none">
          <div
            className={twMerge(
              `transition-all mx-auto bg-white rounded-2xl relative top-1/2 -translate-y-1/2 pointer-events-auto
              ${width ? width : 'w-full'}
              ${height ? height : 'h-full'}
              ${className ? className : ''}`
            )}
            onMouseDown={(e) => {
              e.stopPropagation();
              setMouseDownOnBackdrop(false);
            }}
            onClick={(e) => e.stopPropagation()}
            {...rest}
          >
            {children}
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div
      className={twMerge(
        `text-hg-black transition-all fixed right-0 bottom-0 bg-white z-50 shadow-centered-black overflow-y-auto
          ${type === 'right' ? 'top-0' : ''}
          ${type === 'bottom' ? '' : ''}
          ${width ? width : 'w-full'}
          ${height ? height : 'h-full'}
          ${animationStyles}
          ${className ? className : ''}`
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export const Modal = ({
  isVisible,
  setIsVisible,
  width,
  height,
  className,
  type = 'right',
  hideModalBackground = false,
  children,
  ...rest
}: {
  isVisible: boolean;
  setIsVisible?: (value: boolean) => void;
  width?: string;
  height?: string;
  className?: string;
  type?: 'right' | 'bottom' | 'center';
  children: ReactNode;
  [key: string]: any;
}) => {
  const { isModalOpen, setIsModalOpen, setShowModalBackground } =
    useGlobalStore(state => state);

  useEffect(() => {
    if (!hideModalBackground) {
      setShowModalBackground(isVisible);
    }

    setIsModalOpen(isVisible);
  }, [isVisible]);

  let animationStyles = `
    ${type === 'right' ? 'translate-x-[105%]' : ' '}
    ${type === 'bottom' ? 'translate-y-[105%]' : ' '}
    ${type === 'center' ? 'translate-y-[200%]' : ' '}
  `;

  if (isVisible && isModalOpen) {
    animationStyles = `
      ${type === 'right' ? 'translate-x-[0%]' : ''}
      ${type === 'bottom' ? 'translate-y-[0%]' : ''}
      ${type === 'center' ? 'translate-y-[0%]' : ''}
    `;
  }

  if (type === 'center') {
    return (
      <div className={`transition-all fixed inset-0 z-50 ${animationStyles}`}>
        <div
          className={twMerge(
            `transition-all mx-auto bg-white rounded-2xl relative top-1/4 
              ${width ? width : 'w-full'}
              ${height ? height : 'h-full'}
              ${className ? className : ''}`
          )}
          {...rest}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={twMerge(
        `text-hg-black transition-all fixed right-0 bottom-0 bg-white z-50 shadow-centered-black overflow-y-auto
          ${type === 'right' ? 'top-0' : ''}
          ${type === 'bottom' ? '' : ''}
          ${width ? width : 'w-full'}
          ${height ? height : 'h-full'}
          ${animationStyles}
          ${className ? className : ''}`
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export const SwipeModal = ({
  children,
  isOpen,
  className,
  setModalVisibility,
}: {
  children: ReactNode;
  isOpen: boolean;
  className: string;
  setModalVisibility: (value: boolean) => void;
}) => {
  const [deltaYScroll, setDeltaYScroll] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const modalRef = useRef(null);

  useEffect(() => {
    if (modalRef.current) {
      if (isOpen) {
        (modalRef.current as HTMLDivElement).style.transform = 'translateY(0)';
      } else {
        (modalRef.current as HTMLDivElement).style.transform =
          'translateY(105%)';
      }
    }
  }, [isOpen]);

  const handleTouchStart = (e: any) => {
    if (!isOpen) return;
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: any) => {
    if (!isDragging) return;

    const deltaY = e.touches[0].clientY - startY;
    setDeltaYScroll(deltaY);

    if (modalRef.current) {
      if (deltaY > 0) {
        (
          modalRef.current as HTMLDivElement
        ).style.transform = `translateY(${deltaY}px)`;
      }
    }

    if (deltaY > 100) {
      setIsDragging(false);
      setModalVisibility(false);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (deltaYScroll < 100 && modalRef.current) {
      (modalRef.current as HTMLDivElement).style.transform = 'translateY(0)';
    }
  };

  return (
    <div
      className={twMerge(`transition-all z-50 translate-y-[105%] rounded-t-2xl fixed w-full overflow-hidden bg-white bottom-0 left-0 right-0 swipe-modal 
        ${isOpen ? 'translate-y-0' : ''}
        ${className ? className : ''}
      `)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      ref={modalRef}
    >
      {children}
    </div>
  );
};
