import { useState } from 'react'
import { CreatePostCard } from './components/CreatePostCard'
import { PostList } from './components/PostList'
import { ScrollToTop } from '../../components/ScrollToTop'

export function MainFeed() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="space-y-6 pb-20">
      <CreatePostCard
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <PostList searchQuery={searchQuery} />
      <ScrollToTop />
    </div>
  )
}
