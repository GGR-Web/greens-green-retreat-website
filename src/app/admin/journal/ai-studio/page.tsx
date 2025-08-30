
"use client";

import { useState } from 'react';
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { generateBlogArticle, saveArticleAsDraft } from './actions';


const reviewSchema = z.object({
    review: z.string().min(50, "Please provide a review of at least 50 characters."),
});

export default function AIStudioPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [generatedArticle, setGeneratedArticle] = useState<{ title: string; content: string } | null>(null);

    const form = useForm<z.infer<typeof reviewSchema>>({
        resolver: zodResolver(reviewSchema),
        defaultValues: { review: "" },
    });

    async function onGenerate(values: z.infer<typeof reviewSchema>) {
        setIsGenerating(true);
        setGeneratedArticle(null);

        const result = await generateBlogArticle({ customerReview: values.review });
        setIsGenerating(false);
        
        if (result.error) {
            toast({ title: "Generation Failed", description: result.error, variant: 'destructive' });
        } else if (result.title && result.content) {
            setGeneratedArticle({ title: result.title, content: result.content });
            toast({ title: "Article Generated", description: "The draft has been created below." });
        }
    }

    async function handleSaveDraft() {
        if (!generatedArticle) return;
        setIsSaving(true);
        
        const result = await saveArticleAsDraft(generatedArticle.title, generatedArticle.content);
        setIsSaving(false);

        if (result.success && result.postId) {
            toast({ title: "Draft Saved!", description: "Redirecting to the post editor..." });
            router.push(`/admin/journal/edit/${result.postId}`);
        } else {
            toast({ title: "Save Failed", description: result.error, variant: 'destructive'});
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-accent" />
                        AI Content Studio
                    </CardTitle>
                    <CardDescription>Transform a customer review into an engaging journal article.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onGenerate)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="review"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base">Paste a customer review here</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="e.g., 'We had an amazing time at the retreat! The cottage was beautiful and the views were stunning...'"
                                                className="min-h-[150px] resize-y"
                                                {...field}
                                                disabled={isGenerating}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isGenerating}>
                                {isGenerating ? "Generating..." : "Generate Article"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {(isGenerating || generatedArticle) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Generated Article</CardTitle>
                        <CardDescription>Review and edit the generated draft below. You can save it to continue editing and add media.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {isGenerating ? (
                            <div className="space-y-4">
                                <Skeleton className="h-8 w-1/2" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-[80%]" />
                            </div>
                        ) : generatedArticle && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="article-title" className="text-base">Title</Label>
                                    <Input
                                        id="article-title"
                                        value={generatedArticle.title}
                                        onChange={(e) => setGeneratedArticle({ ...generatedArticle, title: e.target.value })}
                                        disabled={isSaving}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="article-content" className="text-base">Content</Label>
                                    <Textarea
                                        id="article-content"
                                        value={generatedArticle.content}
                                        onChange={(e) => setGeneratedArticle({ ...generatedArticle, content: e.target.value })}
                                        className="min-h-[250px] resize-y"
                                        disabled={isSaving}
                                    />
                                </div>
                                <Button onClick={handleSaveDraft} disabled={isSaving}>
                                    {isSaving ? "Saving..." : "Save and Edit"}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
