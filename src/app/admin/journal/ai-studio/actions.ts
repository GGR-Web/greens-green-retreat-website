
"use server";

import { generateBlogArticle as generateBlogArticleFlow, GenerateBlogArticleInput } from "@/ai/flows/generate-blog-article-flow";
import { createPost } from "../actions";

export async function generateBlogArticle(input: GenerateBlogArticleInput): Promise<{ title?: string; content?: string; error?: string }> {
  try {
    const result = await generateBlogArticleFlow(input);
    return { title: result.title, content: result.content };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "Failed to generate article." };
  }
}

export async function saveArticleAsDraft(title: string, content: string) {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);

  const excerpt = content.replace(/\s+/g, " ").slice(0, 150).trim();

  const result = await createPost({
    title,
    content,
    author: "AI Assistant",
    status: "draft",
    slug,
    excerpt,
    featuredImageUrl: "", // optional: later wire Cloudinary
  });
  return result;
}
