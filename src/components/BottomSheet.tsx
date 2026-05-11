import { type ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'

type BottomSheetProps = {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  closeLabel?: string
  containerClassName?: string
  backdropClassName?: string
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  closeLabel = 'Close',
  containerClassName = 'fixed inset-0 z-[90] flex items-end',
  backdropClassName = 'absolute inset-0 h-full w-full bg-black/50 backdrop-blur-[1px]',
}: BottomSheetProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className={containerClassName} role="presentation">
      <button
        type="button"
        aria-label={closeLabel}
        className={backdropClassName}
        onClick={onClose}
      />
      {children}
    </div>,
    document.body,
  )
}
