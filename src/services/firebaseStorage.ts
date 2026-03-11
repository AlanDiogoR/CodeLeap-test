import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

const POSTS_FOLDER = 'posts'

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only JPEG, PNG, WebP and GIF images are allowed'
  }
  if (file.size > MAX_SIZE_BYTES) {
    return 'Image must be smaller than 5MB'
  }
  return null
}

export async function uploadPostImage(
  file: File
): Promise<string> {
  if (!storage) throw new Error('Firebase Storage not configured')

  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const path = `${POSTS_FOLDER}/${filename}`
  const storageRef = ref(storage, path)

  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)
  return url
}
