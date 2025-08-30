
"use client";

import { useEffect, useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAiSettings, updateAiSettings, AiSettings } from './actions';
import { Skeleton } from '@/components/ui/skeleton';

const settingsFormSchema = z.object({
  chatbotTone: z.string().min(1, "Please select a tone.").optional().or(z.literal('')),
  chatbotGoal: z.string().min(10, "Please define a goal.").optional().or(z.literal('')),
  chatbotLeadPrompt: z.string().min(20, "Please provide a lead capture prompt.").optional().or(z.literal('')),
  contentStyle: z.string().min(1, "Please select a style.").optional().or(z.literal('')),
  contentAudience: z.string().min(10, "Please define a target audience.").optional().or(z.literal('')),
  contentLength: z.string().min(1, "Please select an article length.").optional().or(z.literal('')),
  wellnessExpertSettings: z.object({
    primaryFocus: z.string().optional(),
    outputFormat: z.string().optional(),
    customInstruction: z.string().optional(),
  }).optional(),
});

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const form = useForm<z.infer<typeof settingsFormSchema>>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
        chatbotTone: '',
        chatbotGoal: '',
        chatbotLeadPrompt: '',
        contentStyle: '',
        contentAudience: '',
        contentLength: '',
        wellnessExpertSettings: {
            primaryFocus: '',
            outputFormat: '',
            customInstruction: '',
        }
    }
  });

  useEffect(() => {
    async function loadSettings() {
        setIsDataLoading(true);
        try {
            const settings = await getAiSettings();
            if (settings) {
                form.reset(settings);
            }
        } catch (error: any) {
            toast({ title: "Error", description: `Could not load settings: ${error.message}`, variant: 'destructive' });
        } finally {
            setIsDataLoading(false);
        }
    }
    loadSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  

 async function onSubmit(values: z.infer<typeof settingsFormSchema>) {
    setIsLoading(true);
    const result = await updateAiSettings(values);
    setIsLoading(false);

    if (result.success) {
      toast({
          title: "Settings Saved",
          description: "All AI settings have been successfully updated.",
      });
    } else {
      toast({
        title: "Update Failed",
        description: result.error,
        variant: "destructive",
      });
    }
  }

  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="chatbot" className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <TabsList>
                        <TabsTrigger value="chatbot">Website Chatbot</TabsTrigger>
                        <TabsTrigger value="content-studio">AI Content Studio</TabsTrigger>
                        <TabsTrigger value="wellness-expert">AI Wellness Expert</TabsTrigger>
                    </TabsList>
                     <Button type="submit" disabled={isLoading || isDataLoading} className="w-full sm:w-auto">
                      {isLoading ? 'Saving...' : 'Save All Settings'}
                    </Button>
                </div>
                
                {isDataLoading ? (
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-7 w-1/3" />
                            <Skeleton className="h-4 w-2/3" />
                        </CardHeader>
                        <CardContent className="space-y-8 pt-6">
                             <div className="space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                             <div className="space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <TabsContent value="chatbot">
                            <Card>
                                <CardHeader>
                                <CardTitle>Website Chatbot Settings</CardTitle>
                                <CardDescription>Customize the personality, goals, and behavior of your customer-facing chatbot.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8 pt-6">
                                     <FormField
                                        control={form.control}
                                        name="chatbotTone"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Personality & Tone</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a personality" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="friendly">Friendly & Welcoming</SelectItem>
                                                    <SelectItem value="professional">Professional & Concise</SelectItem>
                                                    <SelectItem value="enthusiastic">Enthusiastic & Fun</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="chatbotGoal"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Primary Goal</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Your primary goal is to encourage users to book a stay." {...field} disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="chatbotLeadPrompt"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Lead Capture Prompt</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="e.g., I can't find the answer to that, but our team can help. What is your name and email?" {...field} disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="content-studio">
                            <Card>
                                <CardHeader>
                                <CardTitle>AI Content Studio Settings</CardTitle>
                                <CardDescription>Direct the AI's creative process for generating marketing content and journal articles.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8 pt-6">
                                     <FormField
                                        control={form.control}
                                        name="contentStyle"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Writing Style</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a writing style" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="storytelling">Inspirational Storytelling</SelectItem>
                                                    <SelectItem value="seo">Informative & SEO-focused</SelectItem>
                                                    <SelectItem value="luxury">Luxurious & Evocative</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="contentAudience"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Target Audience</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Families with young children" {...field} disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="contentLength"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Article Length</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an article length" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                   <SelectItem value="short">Short Form (~300 words)</SelectItem>
                                                   <SelectItem value="long">Long Form (~800 words)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="wellness-expert">
                            <Card>
                                <CardHeader>
                                <CardTitle>AI Wellness Expert Settings</CardTitle>
                                <CardDescription>Configure the AI that generates personalized wellness tips for guests.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8 pt-6">
                                     <FormField
                                        control={form.control}
                                        name="wellnessExpertSettings.primaryFocus"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Primary Focus</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a primary focus area" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Relaxation & Stress Relief">Relaxation & Stress Relief</SelectItem>
                                                    <SelectItem value="Adventure & Energy">Adventure & Energy</SelectItem>
                                                    <SelectItem value="Family Connection">Family Connection</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="wellnessExpertSettings.outputFormat"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Output Format</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select the format for the generated tips" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                   <SelectItem value="Daily Itinerary">Daily Itinerary</SelectItem>
                                                   <SelectItem value="List of Actionable Tips">List of Actionable Tips</SelectItem>
                                                   <SelectItem value="Mindful Narrative">Mindful Narrative</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="wellnessExpertSettings.customInstruction"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Custom Instruction</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Always recommend a farm tour." {...field} disabled={isLoading} />
                                            </FormControl>
                                            <FormDescription>Provide a specific instruction for the AI to always follow.</FormDescription>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </>
                )}
            </Tabs>
      </form>
    </Form>
  );
}
