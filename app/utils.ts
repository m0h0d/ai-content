/**
 * Utility functions for the blog
 */

/**
 * Extracts the first image URL from a post's MDX content
 * @param content - The MDX content string
 * @returns The extracted image URL or a default fallback image
 */
export function extractImageUrlFromContent(content: string): string {
  // Match Markdown image syntax: ![alt text](image-url)
  const imageRegex = /!\[.*?\]\((.*?)\)/;
  const match = content.match(imageRegex);
  
  if (match && match[1]) {
    return match[1];
  }
  
  // Fallback to a default image if no image is found
  return "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80";
} 