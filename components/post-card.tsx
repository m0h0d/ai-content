import Link from "next/link";
import Image from "next/image";
import { type Post } from "contentlayer/generated";
import { extractImageUrlFromContent } from "@/app/utils";

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
  // Extract image URL from post content
  const imageUrl = extractImageUrlFromContent(post.body.raw);

  return (
    <div className="group rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary hover:dark:border-primary transition-colors">
      <Link href={post.slug} className="block">
        {/* Fixed size image container */}
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
          <Image
            src={imageUrl}
            alt={`Cover image for ${post.title}`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-all group-hover:scale-105"
            priority={false}
          />
        </div>
        
        <div className="p-4">
          <h2 className="text-xl font-semibold tracking-tight text-gray-800 dark:text-gray-100 group-hover:text-primary group-hover:dark:text-primary transition-colors line-clamp-2">
            {post.title}
          </h2>
          
          {post.description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {post.description}
            </p>
          )}
          
          <div className="mt-3 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </div>
      </Link>
    </div>
  );
}; 