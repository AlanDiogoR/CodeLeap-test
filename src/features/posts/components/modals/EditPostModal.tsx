import {
  useState,
  useRef,
  type FormEvent,
  type ChangeEvent,
  useEffect,
} from 'react'
import { Modal, Button, Input, Textarea } from '../../../../components/ui'
import {
  POST_TITLE_MAX_LENGTH,
  POST_CONTENT_MAX_LENGTH,
} from '../../../../constants/validation'
import {
  uploadPostImage,
  validateImageFile,
} from '../../../../services/firebaseStorage'
import { storage } from '../../../../services/firebase'
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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (post) {
      setTitle(post.title)
      setContent(post.content)
      setRemoveImage(false)
      setImageFile(null)
      setImageError(null)
    }
  }, [post])

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setImageError(null)
    if (!file) {
      setImageFile(null)
      return
    }
    const err = validateImageFile(file)
    if (err) {
      setImageError(err)
      setImageFile(null)
      return
    }
    setImageFile(file)
    setRemoveImage(false)
  }

  function clearNewImage() {
    setImageFile(null)
    setImageError(null)
    fileInputRef.current?.value && (fileInputRef.current.value = '')
  }

  if (!post) return null

  const trimmedTitle = title.trim()
  const trimmedContent = content.trim()
  const isFormValid =
    trimmedTitle.length > 0 &&
    trimmedTitle.length <= POST_TITLE_MAX_LENGTH &&
    trimmedContent.length > 0 &&
    trimmedContent.length <= POST_CONTENT_MAX_LENGTH

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isFormValid || !post) return
    let imageUrl: string | undefined
    if (removeImage) {
      imageUrl = ''
    } else if (imageFile && storage) {
      try {
        imageUrl = await uploadPostImage(imageFile)
      } catch {
        return
      }
    } else if (post.imageUrl) {
      imageUrl = post.imageUrl
    }
    onSave(trimmedTitle, trimmedContent, imageUrl)
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
        {storage && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              Image (optional)
            </label>
            {post.imageUrl && !removeImage && !imageFile && (
              <div className="flex items-center gap-2">
                <img
                  src={post.imageUrl}
                  alt=""
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => setRemoveImage(true)}
                  className="text-sm text-danger hover:underline"
                >
                  Remove image
                </button>
              </div>
            )}
            {(!post.imageUrl || removeImage || imageFile) && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                  className="rounded-lg border border-border bg-background-card px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-inverse"
                  aria-label="Attach image"
                />
                {imageFile && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted">{imageFile.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        clearNewImage()
                        setRemoveImage(false)
                      }}
                      className="text-sm text-danger hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            )}
            {imageError && (
              <p className="text-sm text-danger" role="alert">
                {imageError}
              </p>
            )}
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
