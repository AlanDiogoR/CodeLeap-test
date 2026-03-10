import { CreatePostCard } from './CreatePostCard'
import { PostList } from './PostList'

export function MainFeed() {
  return (
    <div className="space-y-6">
      <CreatePostCard />
      <PostList />
    </div>
  )
}
