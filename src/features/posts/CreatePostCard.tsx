import { useState, type FormEvent } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { createPost } from './postSlice'
import { Button, Input, Textarea } from '../../components/ui'

export function CreatePostCard() {
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
    }
  }

  return (
    <div className="rounded-2xl border border-border-dark bg-background-card p-6">
      <h2 className="mb-4 text-2xl font-bold text-foreground">
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
