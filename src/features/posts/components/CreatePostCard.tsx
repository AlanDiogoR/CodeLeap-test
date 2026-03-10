import { useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { createPost } from '../slice/postSlice'
import { Button, Input, Textarea } from '../../../components/ui'
import { formatErrorForUI } from '../../../utils/errorHandler'
import type { ApiError } from '../../../types/api'

interface CreatePostCardProps {
  searchQuery?: string
  onSearchChange?: (value: string) => void
}

export function CreatePostCard({
  searchQuery = '',
  onSearchChange,
}: CreatePostCardProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dispatch = useAppDispatch()
  const username = useAppSelector((state) => state.auth.username)

  const isFormValid = title.trim().length > 0 && content.trim().length > 0

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isFormValid || !username) return
    setIsSubmitting(true)
    const result = await dispatch(
      createPost({ username, title: title.trim(), content: content.trim() })
    )
    setIsSubmitting(false)
    if (createPost.fulfilled.match(result)) {
      setTitle('')
      setContent('')
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
        />
        <Textarea
          label="Content"
          placeholder="Content here"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {onSearchChange && (
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="sm:max-w-xs"
            />
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
        </div>
      </form>
    </div>
  )
}
