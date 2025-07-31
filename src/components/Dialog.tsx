import { ReactNode, useRef, useState } from 'react';
import * as DialogModal from '@radix-ui/react-dialog';
import { SvgCross } from 'app/icons/designSystem/SvgCross';
import { usePathname } from 'next/navigation';
import { twMerge } from 'tailwind-merge';

export function Dialog({
  open,
  onOpenChange,
  modal = false,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  children: ReactNode;
}) {
  return (
    <DialogModal.Root open={open} onOpenChange={onOpenChange} modal={modal}>
      {children}
    </DialogModal.Root>
  );
}

export function DialogTrigger({ children }: { children: ReactNode }) {
  return <DialogModal.Trigger>{children}</DialogModal.Trigger>;
}

export function DialogContent({
  portalContainer = document.getElementById('body') || document.body,
  type = 'default',
  children,
  className,
  hideClose = false,
  dragToClose = false,
  modalVisibility,
  setModalVisibility,
  onInteractOutside,
  forceOverlay = false,
}: {
  portalContainer?: HTMLElement;
  type?: 'default' | 'bottom' | 'center';
  children: ReactNode;
  className?: string;
  hideClose?: boolean;
  dragToClose?: boolean;
  modalVisibility?: boolean;
  setModalVisibility?: (value: boolean) => void;
  onInteractOutside?: (event: Event) => void;
  forceOverlay?: boolean;
}) {
  const pathName = usePathname();

  const animationStyles =
    type === 'default'
      ? 'data-[state=open]:animate-contentShow top-0 bottom-0 data-[state=closed]:animate-contentHide'
      : type === 'bottom'
      ? 'data-[state=open]:animate-contentShowBottom data-[state=closed]:animate-contentHideBottom top-auto left-0 right-0 bottom-0'
      : 'data-[state=open]:animate-contentShowCenter data-[state=closed]:animate-contentHideCenter left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2';

  const [deltaYScroll, setDeltaYScroll] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const modalRef = useRef(null);

  const handleTouchStart = (e: any) => {
    if (!modalVisibility) return;
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: any) => {
    if (!isDragging || !dragToClose) return;

    const deltaY = e.touches[0].clientY - startY;
    setDeltaYScroll(deltaY);

    if (modalRef.current) {
      if (deltaY > 0) {
        (
          modalRef.current as HTMLDivElement
        ).style.transform = `translateY(${deltaY}px)`;
      }
    }

    if (deltaY > 150) {
      setIsDragging(false);
      if (setModalVisibility) setModalVisibility(false);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (deltaYScroll < 150 && modalRef.current && dragToClose) {
      (modalRef.current as HTMLDivElement).style.transform = 'translateY(0)';
    }
  };

  return (
    <DialogModal.Portal container={portalContainer}>
      {forceOverlay && (
        <div
          id="fakeOverlay"
          className="bg-hg-black/20 backdrop-blur-sm data-[state=open]:animate-overlayShow data-[state=closed]:animate-overlayHide fixed inset-0 z-40"
        />
      )}
      <DialogModal.Overlay className="bg-black/20 backdrop-blur-sm data-[state=open]:animate-overlayShow fixed inset-0 z-40" />
      <DialogModal.Content
        aria-describedby={undefined}
        className={twMerge(
          `${animationStyles} outline-none fixed z-50 shadow-centered-black overflow-y-auto border-l border-okron-400 ${className}`
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onInteractOutside={onInteractOutside}
        ref={modalRef}
      >
        <DialogModal.Title className="sr-only">
          Modal en {pathName}
        </DialogModal.Title>
        <div className="sticky flex top-0 justify-end z-50">
          {!hideClose && !dragToClose && (
            <DialogModal.Close asChild className="modal-close">
              <div className="p-2 bg-white/80 absolute mt-3 mr-3 cursor-pointer rounded-full">
                <SvgCross
                  className="h-4 w-4 text-hg-black500 appearance-none"
                  onClick={() =>
                    setModalVisibility && setModalVisibility(false)
                  }
                  aria-label="Close"
                />
              </div>
            </DialogModal.Close>
          )}
        </div>
        {dragToClose && (
          <div className="w-full p-4 justify-center">
            <div className="h-1.5 bg-hg-black300/50 rounded-full w-20 cursor-pointer" />
          </div>
        )}
        {children}
      </DialogModal.Content>
    </DialogModal.Portal>
  );
}
