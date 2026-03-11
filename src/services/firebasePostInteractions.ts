import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'

const POSTS_COLLECTION = 'posts'
const LIKES_SUBCOLLECTION = 'likes'
const COMMENTS_SUBCOLLECTION = 'comments'

export interface FirestoreComment {
  id: string
  author: string
  authorId: string | null
  text: string
  timestamp: number
}

function likesRef(postId: string) {
  if (!db) throw new Error('Firestore not configured')
  return collection(db, POSTS_COLLECTION, postId, LIKES_SUBCOLLECTION)
}

function commentsRef(postId: string) {
  if (!db) throw new Error('Firestore not configured')
  return collection(db, POSTS_COLLECTION, postId, COMMENTS_SUBCOLLECTION)
}

function docToComment(id: string, data: { author?: string; authorId?: string; text?: string; createdAt?: { toDate: () => Date } }): FirestoreComment {
  const createdAt = data.createdAt?.toDate?.()
  return {
    id,
    author: data.author ?? 'Anonymous',
    authorId: data.authorId ?? null,
    text: data.text ?? '',
    timestamp: createdAt ? createdAt.getTime() : Date.now(),
  }
}

export async function getLikeCount(postId: string): Promise<number> {
  if (!db) return 0
  const snapshot = await getDocs(likesRef(postId))
  return snapshot.size
}

export async function isLikedByUser(
  postId: string,
  userId: string
): Promise<boolean> {
  if (!db) return false
  const likeRef = doc(db, POSTS_COLLECTION, postId, LIKES_SUBCOLLECTION, userId)
  const snap = await getDoc(likeRef)
  return snap.exists()
}

export async function toggleLike(
  postId: string,
  userId: string
): Promise<boolean> {
  if (!db) throw new Error('Firestore not configured')
  const likeRef = doc(db, POSTS_COLLECTION, postId, LIKES_SUBCOLLECTION, userId)
  const snap = await getDoc(likeRef)
  if (snap.exists()) {
    await deleteDoc(likeRef)
    return false
  }
  await setDoc(likeRef, { userId })
  return true
}

export async function addComment(
  postId: string,
  payload: { author: string; authorId?: string; text: string }
): Promise<FirestoreComment> {
  if (!db) throw new Error('Firestore not configured')
  const ref = collection(db, POSTS_COLLECTION, postId, COMMENTS_SUBCOLLECTION)
  const docRef = await addDoc(ref, {
    author: payload.author,
    authorId: payload.authorId ?? null,
    text: payload.text,
    createdAt: serverTimestamp(),
  })
  const snap = await getDoc(docRef)
  const data = snap.data() ?? {}
  return docToComment(docRef.id, data)
}

export function subscribeToComments(
  postId: string,
  onUpdate: (comments: FirestoreComment[]) => void
): Unsubscribe {
  if (!db) return () => {}
  const q = query(
    commentsRef(postId),
    orderBy('createdAt', 'asc')
  )
  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map((d) =>
      docToComment(d.id, d.data() as Parameters<typeof docToComment>[1])
    )
    onUpdate(comments)
  })
}

export function subscribeToLikes(
  postId: string,
  userId: string | null,
  onUpdate: (count: number, isLiked: boolean) => void
): Unsubscribe {
  if (!db) return () => {}
  const unsubCount = onSnapshot(likesRef(postId), (snapshot) => {
    const count = snapshot.size
    if (!userId) {
      onUpdate(count, false)
      return
    }
    const liked = snapshot.docs.some((d) => d.id === userId)
    onUpdate(count, liked)
  })
  return unsubCount
}
