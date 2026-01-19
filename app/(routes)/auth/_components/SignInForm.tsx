'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { z } from "zod"
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { RiLoader2Line } from '@remixicon/react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthToken } from '@/store/useAuthToken';

const signInFormSchema = z.object({
  email: z.email('Invalid email').min(1, 'Email is required'),
  password: z.string().min(6, 'Password is required')
})

type SignInFormValues = z.infer<typeof signInFormSchema>

const SignInForm = () => {
  const router = useRouter()
  const { setBearerToken } = useAuthToken()
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "youke@gmail.com",
      password: "123456789"
    },
  })

  async function onSubmit(values: SignInFormValues) {
    console.log(values)
    await authClient.signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: "/home"
    }, {
      onRequest: (ctx) => {
        setIsLoading(true)
      },
      onSuccess: (ctx) => {
        const token = ctx.response.headers.get("set-auth-token");
        if (token) {
          setBearerToken(token);
        }
        setIsLoading(false)
        router.replace('/home')
      },
      onError: (ctx) => {
        toast.error(ctx.error.message)
        setIsLoading(false)
      },
    });
  }


  return (
    <div className="flex flex-col gap-6">
      <Card className="!bg-transparent border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Sign in to toto.ai</CardTitle>
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
                      <Input
                        placeholder="toto@example.com"
                        type="email"
                        {...field}
                      />
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
                      <Input placeholder="*****" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full text-white"
              >
                {isLoading && (
                  <RiLoader2Line className="w-4 h-4 animate-spin" />
                )}
                Sign In (u can sign in directly)
              </Button>
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link
                  href="/auth/sign-up"
                  className="underline underline-offset-4"
                >
                  Sign Up
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default SignInForm

