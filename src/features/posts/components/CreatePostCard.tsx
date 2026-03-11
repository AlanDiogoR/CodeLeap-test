import { useState, useRef, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { createPost } from '../slice/postSlice'
import { Button, Input, Textarea } from '../../../components/ui'
import { formatErrorForUI } from '../../../utils/errorHandler'
import { isValidImageUrl } from '../../../utils/validateImageUrl'
import {
  POST_TITLE_MAX_LENGTH,
  POST_CONTENT_MAX_LENGTH,
} from '../../../constants/validation'
import type { ApiError } from '../../../types/api'

interface CreatePostCardProps {}

export function CreatePostCard(_props: CreatePostCardProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageUrlError, setImageUrlError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitLockRef = useRef(false)
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)

  const trimmedTitle = title.trim()
  const trimmedContent = content.trim()
  const trimmedImageUrl = imageUrl.trim()
  const isFormValid =
    trimmedTitle.length > 0 &&
    trimmedTitle.length <= POST_TITLE_MAX_LENGTH &&
    trimmedContent.length > 0 &&
    trimmedContent.length <= POST_CONTENT_MAX_LENGTH &&
    (!trimmedImageUrl || isValidImageUrl(trimmedImageUrl))

  function handleImageUrlChange(value: string) {
    setImageUrl(value)
    setImageUrlError(null)
    const t = value.trim()
    if (t && !isValidImageUrl(t)) {
      setImageUrlError('Enter a valid image URL (JPEG, PNG, WebP, GIF)')
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isFormValid || !user || submitLockRef.current) return
    submitLockRef.current = true
    setIsSubmitting(true)
    const result = await dispatch(
      createPost({
        username: user.displayName,
        title: trimmedTitle,
        content: trimmedContent,
        authorId:
          import.meta.env.VITE_DATA_SOURCE === 'firebase' ? user.uid : undefined,
        imageUrl: trimmedImageUrl || undefined,
      })
    )
    setIsSubmitting(false)
    submitLockRef.current = false
    if (createPost.fulfilled.match(result)) {
      setTitle('')
      setContent('')
      setImageUrl('')
      setImageUrlError(null)
      toast.success('Post created successfully!')
    }
    if (createPost.rejected.match(result)) {
      toast.error(formatErrorForUI(result.payload as ApiError))
    }
  }

  return (
    <div className="rounded-2xl border border-border-dark bg-background-card p-4 sm:p-6">
      <h2 className="mb-4 text-xl font-bold text-foreground sm:text-2xl">
        What&apos;s on your mind?
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Title"
          placeholder="Hello world"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={POST_TITLE_MAX_LENGTH}
        />
        <Textarea
          label="Content"
          placeholder="Content here"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          maxLength={POST_CONTENT_MAX_LENGTH}
        />
        <div className="flex flex-col gap-2">
          <Input
            label="Image URL (optional)"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => handleImageUrlChange(e.target.value)}
            error={imageUrlError ?? undefined}
          />
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!isFormValid}
            isLoading={isSubmitting}
          >
            Create
          </Button>
        </div>
      </form>
    </div>
  )
}
