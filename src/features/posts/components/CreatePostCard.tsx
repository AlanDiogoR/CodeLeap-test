import { useState, useRef, type FormEvent, type ChangeEvent } from 'react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { createPost } from '../slice/postSlice'
import { Button, Input, Textarea } from '../../../components/ui'
import { formatErrorForUI } from '../../../utils/errorHandler'
import {
  POST_TITLE_MAX_LENGTH,
  POST_CONTENT_MAX_LENGTH,
} from '../../../constants/validation'
import {
  uploadPostImage,
  validateImageFile,
} from '../../../services/firebaseStorage'
import { storage } from '../../../services/firebase'
import type { ApiError } from '../../../types/api'

interface CreatePostCardProps {}

export function CreatePostCard(_props: CreatePostCardProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitLockRef = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)

  const trimmedTitle = title.trim()
  const trimmedContent = content.trim()
  const isFormValid =
    trimmedTitle.length > 0 &&
    trimmedTitle.length <= POST_TITLE_MAX_LENGTH &&
    trimmedContent.length > 0 &&
    trimmedContent.length <= POST_CONTENT_MAX_LENGTH

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
  }

  function clearImage() {
    setImageFile(null)
    setImageError(null)
    fileInputRef.current?.value && (fileInputRef.current.value = '')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isFormValid || !user || submitLockRef.current) return
    submitLockRef.current = true
    setIsSubmitting(true)
    let imageUrl: string | undefined
    if (imageFile && storage) {
      try {
        imageUrl = await uploadPostImage(imageFile)
      } catch {
        toast.error('Failed to upload image')
        setIsSubmitting(false)
        submitLockRef.current = false
        return
      }
    }
    const result = await dispatch(
      createPost({
        username: user.displayName,
        title: trimmedTitle,
        content: trimmedContent,
        authorId: user.uid === 'local' ? undefined : user.uid,
        imageUrl,
      })
    )
    setIsSubmitting(false)
    submitLockRef.current = false
    if (createPost.fulfilled.match(result)) {
      setTitle('')
      setContent('')
      clearImage()
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
        {storage && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              Image (optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              className="rounded-lg border border-border bg-background-card px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-inverse file:hover:bg-primary-hover"
              aria-label="Attach image"
            />
            {imageFile && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">{imageFile.name}</span>
                <button
                  type="button"
                  onClick={clearImage}
                  className="text-sm text-danger hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
            {imageError && (
              <p className="text-sm text-danger" role="alert">
                {imageError}
              </p>
            )}
          </div>
        )}
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
