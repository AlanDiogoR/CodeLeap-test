import {
  useState,
  type FormEvent,
  type ChangeEvent,
  useEffect,
} from 'react'
import { Modal, Button, Input, Textarea } from '../../../../components/ui'
import {
  POST_TITLE_MAX_LENGTH,
  POST_CONTENT_MAX_LENGTH,
} from '../../../../constants/validation'
import { isValidImageUrl } from '../../../../utils/validateImageUrl'
import type { Post } from '../../../../types/post'

interface EditPostModalProps {
  post: Post | null
  onSave: (title: string, content: string, imageUrl?: string) => void
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
  const [imageUrl, setImageUrl] = useState('')
  const [imageUrlError, setImageUrlError] = useState<string | null>(null)

  useEffect(() => {
    if (post) {
      setTitle(post.title)
      setContent(post.content)
      setImageUrl(post.imageUrl ?? '')
      setImageUrlError(null)
    }
  }, [post])

  function handleImageUrlChange(value: string) {
    setImageUrl(value)
    setImageUrlError(null)
    if (value.trim() && !isValidImageUrl(value.trim())) {
      setImageUrlError('Enter a valid image URL (JPEG, PNG, WebP, GIF)')
    }
  }

  if (!post) return null

  const trimmedTitle = title.trim()
  const trimmedContent = content.trim()
  const trimmedImageUrl = imageUrl.trim()
  const isFormValid =
    trimmedTitle.length > 0 &&
    trimmedTitle.length <= POST_TITLE_MAX_LENGTH &&
    trimmedContent.length > 0 &&
    trimmedContent.length <= POST_CONTENT_MAX_LENGTH &&
    (trimmedImageUrl === '' || isValidImageUrl(trimmedImageUrl))

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isFormValid) return
    onSave(trimmedTitle, trimmedContent, trimmedImageUrl || '')
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
          maxLength={POST_TITLE_MAX_LENGTH}
        />
        <Textarea
          label="Content"
          placeholder="Content here"
          value={content}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setContent(e.target.value)
          }
          rows={4}
          maxLength={POST_CONTENT_MAX_LENGTH}
        />
        <Input
          label="Image URL (optional)"
          placeholder="https://example.com/image.jpg"
          value={imageUrl}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleImageUrlChange(e.target.value)
          }
          error={imageUrlError ?? undefined}
        />
        {post.imageUrl && (
          <div className="flex items-center gap-2">
            <img
              src={post.imageUrl}
              alt=""
              className="h-20 w-20 rounded-lg object-cover"
            />
          </div>
        )}
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
