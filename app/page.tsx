import { allPosts } from "contentlayer/generated";
import { PostCard } from "@/components/post-card";

export default function Home() {
  // Sort posts by date (most recent first)
  const posts = allPosts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Blog Posts</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
}
