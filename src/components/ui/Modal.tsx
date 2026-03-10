import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose?: () => void
  title?: string
  children: ReactNode
  closable?: boolean
}

export function Modal({
  open,
  onClose,
  title,
  children,
  closable = true,
}: ModalProps) {
  const handleClose = closable ? onClose : undefined

  return (
    <Transition show={open}>
      <Dialog
        onClose={handleClose ?? (() => {})}
        className="relative z-50"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <TransitionChild
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-foreground/50" aria-hidden />
        </TransitionChild>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="mx-auto w-full max-w-lg rounded-2xl bg-background-card p-6 shadow-xl">
              {title && (
                <DialogTitle
                  id="modal-title"
                  className="text-2xl font-bold text-foreground"
                >
                  {title}
                </DialogTitle>
              )}
              {children}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
