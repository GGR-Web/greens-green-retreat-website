
"use client";

import { useEffect, useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from "lucide-react";
import { getPost, updatePost } from '../../actions';
import { Separator } from '@/components/ui/separator';

const postFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  slug: z.string().min(3, { message: "Slug must be at least 3 characters." }).regex(/^[a-z0-9-]+$/, { message: "Slug can only contain lowercase letters, numbers, and hyphens."}),
  featuredImageUrl: z.string().url({ message: "Please enter a valid image URL." }),
  excerpt: z.string().min(20, { message: "Excerpt must be at least 20 characters." }).max(200, { message: "Excerpt cannot be longer than 200 characters."}),
  content: z.string().min(10, { message: "Content must be at least 10 characters." }),
  author: z.string().min(2, { message: "Author name is required." }),
  status: z.enum(['draft', 'published']),
});

export default function AdminEditPostPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const postId = params.postId as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  const form = useForm<z.infer<typeof postFormSchema>>({
    resolver: zodResolver(postFormSchema),
  });
  
  useEffect(() => {
    async function fetchPostData() {
        setIsDataLoading(true);
        if (!postId) return;
        
        const result = await getPost(postId);
        if (result.post) {
            form.reset({
                title: result.post.title,
                slug: result.post.slug,
                featuredImageUrl: result.post.featuredImageUrl,
                excerpt: result.post.excerpt,
                content: result.post.content,
                author: result.post.author,
                status: result.post.status as 'draft' | 'published',
            });
        } else if (result.error) {
            toast({ title: "Error", description: `Could not load post data: ${result.error}`, variant: 'destructive' });
            router.push('/admin/journal');
        }
        setIsDataLoading(false);
    }
    fetchPostData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, form, toast, router]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('title', e.target.value);
    const slug = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    form.setValue('slug', slug);
  };

 async function onSubmit(values: z.infer<typeof postFormSchema>) {
    setIsLoading(true);
    const result = await updatePost(postId, values);
    setIsLoading(false);

    if (result.success) {
      toast({
          title: "Post Updated",
          description: "Your journal post has been successfully updated.",
      });
      router.push(`/admin/journal`);
    } else {
      toast({
        title: "Update Failed",
        description: result.error,
        variant: "destructive",
      });
    }
  }
  
  if (isDataLoading) {
    return <div className="text-center p-8">Loading post...</div>
  }

  return (
    <>
      <div className="mb-4">
        <Button asChild variant="outline" size="sm">
            <Link href="/admin/journal">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Journal
            </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Edit Post</CardTitle>
          <CardDescription>Update the details for your journal post.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post Title</FormLabel>
                      <FormControl>
                        <Input placeholder="A beautiful day at the retreat" {...field} onChange={handleTitleChange} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="a-beautiful-day" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormDescription>This is the URL-friendly version of the title.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="featuredImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://placehold.co/1200x600.png" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormDescription>The main image for the article display and social sharing.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                         <Textarea
                            placeholder="A short summary of the post..."
                            className="resize-y"
                            {...field}
                            disabled={isLoading}
                          />
                      </FormControl>
                       <FormDescription>A brief preview of the article for list pages and SEO.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                         <Textarea
                            placeholder="Start writing your journal entry here..."
                            className="resize-y min-h-[200px]"
                            {...field}
                            disabled={isLoading}
                          />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <FormField
                      control={form.control}
                      name="author"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Author</FormLabel>
                          <FormControl>
                            <Input placeholder="Jane Doe" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                           <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Set status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                               <SelectItem value="draft">Draft</SelectItem>
                               <SelectItem value="published">Published</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
               
                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Saving Changes...' : 'Save Changes'}
                </Button>
              </form>
            </Form>
        </CardContent>
      </Card>
    </>
  );
}
