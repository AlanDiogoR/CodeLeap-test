import { useState, type FormEvent, type ChangeEvent, useEffect } from 'react'
import { Modal, Button, Input, Textarea } from '../../../../components/ui'
import type { Post } from '../../../../types/post'

interface EditPostModalProps {
  post: Post | null
  onSave: (title: string, content: string) => void
  onCancel: () => void
  isLoading?: boolean
}

export function EditPostModal({
  post,
  onSave,
  onCancel,
  isLoading = false,
}: EditPostModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    if (post) {
      setTitle(post.title)
      setContent(post.content)
    }
  }, [post])

  if (!post) return null

  const isFormValid = title.trim().length > 0 && content.trim().length > 0

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isFormValid) return
    onSave(title.trim(), content.trim())
  }

  return (
    <Modal open onClose={onCancel} closable title="Edit item">
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <Input
          label="Title"
          placeholder="Hello world"
          value={title}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setTitle(e.target.value)
          }
        />
        <Textarea
          label="Content"
          placeholder="Content here"
          value={content}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setContent(e.target.value)
          }
          rows={4}
        />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="primary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isFormValid} isLoading={isLoading}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  )
}
