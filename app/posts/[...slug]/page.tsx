import { notFound } from "next/navigation"
import { allPosts } from "contentlayer/generated"
import Image from "next/image"
import { Metadata } from "next"
import { Mdx } from "@/components/mdx-components"
import { extractImageUrlFromContent } from "@/app/utils"

interface PostProps {
  params: {
    slug: string[]
  }
}

async function getPostFromParams(params: PostProps["params"]) {
  const slug = params?.slug?.join("/")
  const post = allPosts.find((post) => post.slugAsParams === slug)

  if (!post) {
    null
  }

  return post
}

export async function generateMetadata({
  params,
}: PostProps): Promise<Metadata> {
  const post = await getPostFromParams(params)

  if (!post) {
    return {}
  }

  return {
    title: post.title,
    description: post.description,
  }
}

export async function generateStaticParams(): Promise<PostProps["params"][]> {
  return allPosts.map((post) => ({
    slug: post.slugAsParams.split("/"),
  }))
}

export default async function PostPage({ params }: PostProps) {
  const post = await getPostFromParams(params)

  if (!post) {
    notFound()
  }

  // Extract image URL from the post content
  const imageUrl = extractImageUrlFromContent(post.body.raw)
  
  // We'll use the original content since our MDX component will handle hiding the first image
  const content = post.body.code

  return (
    <article className="py-6 prose dark:prose-invert max-w-3xl mx-auto">
      <h1 className="mb-2">{post.title}</h1>
      {post.description && (
        <p className="text-xl mt-0 text-slate-700 dark:text-slate-200">
          {post.description}
        </p>
      )}
      
      {/* Featured image with consistent styling */}
      <div className="relative aspect-video w-full my-6 overflow-hidden rounded-lg">
        <Image
          src={imageUrl}
          alt={`Cover image for ${post.title}`}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
          priority={true}
        />
      </div>
      
      <hr className="my-4" />
      <Mdx code={content} />
    </article>
  )
}
