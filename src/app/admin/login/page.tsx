
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { signInWithEmailAndPassword, onAuthStateChanged, browserLocalPersistence, setPersistence } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createSessionCookie } from './actions';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/admin/dashboard');
      }
    });
    return () => unsubscribe();
  }, [router]);


  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    setIsLoading(true);
    try {
      // Set persistence to local to avoid session being cleared on browser close
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const idToken = await userCredential.user.getIdToken();
      
      const result = await createSessionCookie(idToken);

      if (result.status === 'success') {
        toast({ title: "Login Successful", description: "Redirecting to dashboard..." });
        // The middleware will handle the redirect, but we can push here for a faster UX.
        router.push('/admin/dashboard');
      } else {
        throw new Error(result.message || 'Failed to create session.');
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      let errorMessage = "An unknown error occurred during login. Please try again.";
      // Firebase Auth errors have a `code` property.
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many login attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
        default:
          // Use the error message from Firebase if available
          errorMessage = error.message || errorMessage;
          break;
      }
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4">
       <Link href="/" className="absolute top-4 left-4 text-sm text-muted-foreground hover:text-primary">&larr; Back to Home</Link>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="inline-block mx-auto mb-4">
            <Image src="https://res.cloudinary.com/degsnfmco/image/upload/v1756123580/GGR_LOGO_PNG_hgwx2g.png" alt="Green's Green Retreat Logo" width={32} height={32} className="h-8 w-8 rounded-full" />
          </div>
          <CardTitle className="font-headline text-2xl">Admin Login</CardTitle>
          <CardDescription>Welcome back to Green's Green Retreat</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@sanctuary.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
