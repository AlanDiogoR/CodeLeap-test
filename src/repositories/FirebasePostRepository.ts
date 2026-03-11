import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  doc,
  startAfter,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '../services/firebase'
import type { IPostRepository, PaginatedResult } from './IPostRepository'
import type { Post, CreatePostPayload, UpdatePostPayload } from '../types/post'
import { postSchema } from '../schemas/postSchema'

const POSTS_COLLECTION = 'posts'
const PAGE_SIZE = 10

function firestorePostToPost(docId: string, data: DocumentData): Post {
  const d = data
  const createdAt =
    d.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString()
  const parsed = postSchema.safeParse({
    id: docId,
    username: d.authorDisplayName ?? d.username ?? 'Anonymous',
    created_datetime: createdAt,
    title: d.title ?? '',
    content: d.content ?? '',
    authorId: d.authorId,
    imageUrl: d.imageUrl,
  })
  if (!parsed.success) {
    throw new Error('Invalid Firestore post data')
  }
  const p = parsed.data
  return {
    ...p,
    authorId: p.authorId ?? undefined,
    imageUrl: p.imageUrl ?? undefined,
  }
}

export class FirebasePostRepository implements IPostRepository {
  async getAll(): Promise<PaginatedResult> {
    if (!db) throw new Error('Firestore not configured')

    const q = query(
      collection(db, POSTS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE)
    )
    const snapshot = await getDocs(q)
    const results = snapshot.docs.map((d) =>
      firestorePostToPost(d.id, d.data())
    )
    const last = snapshot.docs[snapshot.docs.length - 1]
    return {
      results,
      next: last ? JSON.stringify({ lastDocId: last.id }) : null,
    }
  }

  async getNextPage(cursor: string): Promise<PaginatedResult> {
    if (!db) throw new Error('Firestore not configured')

    let parsed: { lastDocId: string }
    try {
      parsed = JSON.parse(cursor) as { lastDocId: string }
    } catch {
      return { results: [], next: null }
    }

    const lastDocRef = doc(db, POSTS_COLLECTION, parsed.lastDocId)
    const lastDocSnap = await getDoc(lastDocRef)
    if (!lastDocSnap.exists()) return { results: [], next: null }

    const q = query(
      collection(db, POSTS_COLLECTION),
      orderBy('createdAt', 'desc'),
      startAfter(lastDocSnap),
      limit(PAGE_SIZE)
    )
    const snapshot = await getDocs(q)
    const results = snapshot.docs.map((d) =>
      firestorePostToPost(d.id, d.data())
    )
    const last = snapshot.docs[snapshot.docs.length - 1]
    return {
      results,
      next: last ? JSON.stringify({ lastDocId: last.id }) : null,
    }
  }

  async create(payload: CreatePostPayload): Promise<Post> {
    if (!db) throw new Error('Firestore not configured')

    const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
      authorId: payload.authorId ?? null,
      authorDisplayName: payload.username,
      title: payload.title,
      content: payload.content,
      imageUrl: payload.imageUrl ?? null,
      createdAt: serverTimestamp(),
      likesCount: 0,
      commentsCount: 0,
    })
    const snap = await getDoc(docRef)
    const data = snap.data() ?? {}
    const createdAt =
      data.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString()
    const post: Post = {
      id: docRef.id,
      username: payload.username,
      created_datetime: createdAt,
      title: payload.title,
      content: payload.content,
      authorId: payload.authorId,
      imageUrl: payload.imageUrl,
    }
    return post
  }

  async update(
    id: number | string,
    payload: UpdatePostPayload
  ): Promise<Post> {
    if (!db) throw new Error('Firestore not configured')

    const docRef = doc(db, POSTS_COLLECTION, String(id))
    const updatePayload: Record<string, unknown> = {
      title: payload.title,
      content: payload.content,
      updatedAt: serverTimestamp(),
    }
    if (payload.imageUrl === '') {
      updatePayload.imageUrl = deleteField()
    } else if (payload.imageUrl != null) {
      updatePayload.imageUrl = payload.imageUrl
    }
    await updateDoc(docRef, updatePayload)

    const snap = await getDoc(docRef)
    if (!snap.exists()) throw new Error('Post not found after update')
    return firestorePostToPost(snap.id, snap.data() ?? {})
  }

  async delete(id: number | string): Promise<void> {
    if (!db) throw new Error('Firestore not configured')
    await deleteDoc(doc(db, POSTS_COLLECTION, String(id)))
  }
}
