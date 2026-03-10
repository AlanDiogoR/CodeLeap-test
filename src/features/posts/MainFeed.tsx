import { CreatePostCard } from './components/CreatePostCard'
import { PostList } from './components/PostList'

export function MainFeed() {
  return (
    <div className="space-y-6">
      <CreatePostCard />
      <PostList />
    </div>
  )
}
