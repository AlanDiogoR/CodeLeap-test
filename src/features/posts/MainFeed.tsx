import { useState } from 'react'
import { CreatePostCard } from './components/CreatePostCard'
import { PostList } from './components/PostList'
import { SearchBar } from '../../components/SearchBar'
import { ScrollToTop } from '../../components/ScrollToTop'

export function MainFeed() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="space-y-6 pb-20">
      <CreatePostCard />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>
      <PostList searchQuery={searchQuery} />
      <ScrollToTop />
    </div>
  )
}
