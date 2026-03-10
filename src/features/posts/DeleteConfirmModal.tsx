import { Modal, Button } from '../../components/ui'
import type { Post } from '../../types/post'

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
  if (!post) return null

  return (
    <Modal open onClose={onCancel} closable>
      <div className="mt-4 flex flex-col gap-4">
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
      </div>
    </Modal>
  )
}
