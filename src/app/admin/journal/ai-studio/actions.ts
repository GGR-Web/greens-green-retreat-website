
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

export async function saveArticleAsDraft(title: string, content: string): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
        const slug = title.toLowerCase().replace(/\s+/g, '-').slice(0, 50);
        const excerpt = content.substring(0, 150);
        const result = await createPost({
            title,
            content,
            author: "AI Assistant",
            status: "draft",
            slug,
            excerpt,
            featuredImageUrl: "",
        });

        return { success: result.success, postId: result.postId, error: result.error };

    } catch (e: any) {
        console.error(e);
        return { success: false, error: e.message || "Failed to save draft." };
    }
}
