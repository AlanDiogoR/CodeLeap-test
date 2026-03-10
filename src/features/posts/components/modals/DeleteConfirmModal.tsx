import { useState } from 'react'
import { motion } from 'framer-motion'
import { Modal, Button } from '../../../../components/ui'
import type { Post } from '../../../../types/post'

interface DeleteConfirmModalProps {
  post: Post | null
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function DeleteConfirmModal({
  post,
  onConfirm,
  onCancel,
  isLoading = false,
}: DeleteConfirmModalProps) {
  const [shake, setShake] = useState(false)

  if (!post) return null

  function handleBackdropClick() {
    setShake(true)
    setTimeout(() => setShake(false), 400)
  }

  return (
    <Modal
      open
      onClose={handleBackdropClick}
      closable
      title="Delete post"
    >
      <motion.div
        animate={
          shake
            ? { x: [0, -12, 12, -12, 12, 0] }
            : { x: 0 }
        }
        transition={{ duration: 0.4 }}
        className="mt-4 flex flex-col gap-4"
      >
        <p className="text-base text-foreground">
          Are you sure you want to delete this item?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="primary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
            Delete
          </Button>
        </div>
      </motion.div>
    </Modal>
  )
}
