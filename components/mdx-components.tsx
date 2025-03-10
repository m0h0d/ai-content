import Image from "next/image"
import { useMDXComponent } from "next-contentlayer/hooks"

// Custom components for MDX
const components = {
  Image,
  // Custom image component to override default markdown image behavior
  img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // Skip the first image encountered in MDX content as it's shown as the featured image already
    if (src && src.includes("unsplash.com")) {
      return null;
    }
    
    // For other images in the content
    return (
      <div className="relative w-full aspect-video my-6 overflow-hidden rounded-lg">
        {src && (
          <Image
            src={src}
            alt={alt || 'Blog image'}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        )}
      </div>
    )
  },
}

interface MdxProps {
  code: string
}

export function Mdx({ code }: MdxProps) {
  const Component = useMDXComponent(code)

  return <Component components={components} />
}
