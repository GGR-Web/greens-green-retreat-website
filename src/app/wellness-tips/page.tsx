
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Sparkles } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateWellnessPlan } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";

const wellnessFormSchema = z.object({
  userRequest: z.string().min(10, { message: "Please tell us a little more about your goals (at least 10 characters)." }),
});

export default function WellnessTipsPage() {
  const { toast } = useToast();
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof wellnessFormSchema>>({
    resolver: zodResolver(wellnessFormSchema),
    defaultValues: {
      userRequest: "I'm staying for 3 days and want to relax and de-stress.",
    },
  });

  async function onSubmit(values: z.infer<typeof wellnessFormSchema>) {
    setIsLoading(true);
    setGeneratedPlan(null);
    const result = await generateWellnessPlan(values);
    setIsLoading(false);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else if (result.wellnessPlan) {
      setGeneratedPlan(result.wellnessPlan);
    }
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Craft Your Personal Retreat Experience</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Let our AI wellness expert craft a personalized plan to help you make the most of your stay.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generate Your Wellness Plan</CardTitle>
            <CardDescription>Describe your goals for your stay below.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="userRequest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>My goals are...</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., I'm looking for a peaceful weekend to de-stress and reconnect with nature."
                          className="resize-y"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The more you share, the more personalized your plan will be.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    "Generating..."
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Generate My Wellness Plan
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {(isLoading || generatedPlan) && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="text-accent" />
                Your Personalized Wellness Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[80%]" />
                </div>
              ) : (
                <div className="prose prose-stone dark:prose-invert max-w-none whitespace-pre-wrap font-body">
                  {generatedPlan}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
