"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff, Mail, Lock, User, CircleCheck, CircleX } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authService } from "@/services/authService"

const getAuthSchema = (isSignUp: boolean) => z.object({
    name: isSignUp
        ? z.string().min(2, { message: "Name must be at least 2 characters" })
        : z.string().optional(),
    email: z.email("Please enter a valid email address"),
    password: isSignUp
        ? z
            .string()
            .min(8, { message: "Password must be at least 8 characters" })
            .regex(/[a-z]/, { message: "Password must include at least one lowercase letter" })
            .regex(/[A-Z]/, { message: "Password must include at least one uppercase letter" })
        : z.string().min(8, { message: "Password must be at least 8 characters" }),
})

type AuthFormData = z.infer<ReturnType<typeof getAuthSchema>>

interface AuthFormProps {
    mode: "signin" | "signup"
}

export function AuthForm({ mode }: AuthFormProps) {
    const isSignUp = mode === "signup"
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const form = useForm<AuthFormData>({
        resolver: zodResolver(getAuthSchema(isSignUp)),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    })
    const passwordValue = form.watch("password") || ""
    const hasMinLength = passwordValue.length >= 8
    const hasUpperAndLowerCase = /[a-z]/.test(passwordValue) && /[A-Z]/.test(passwordValue)
    const allRequirementsMet = hasMinLength && hasUpperAndLowerCase

    const onSubmit = async (data: AuthFormData) => {
        setIsLoading(true)
        setError(null)
        setSuccess(null)

        try {
            const result = isSignUp
                ? await authService.signUp(data as { name: string; email: string; password: string })
                : await authService.login({ email: data.email, password: data.password })

            if (isSignUp) {
                setSuccess("Account created successfully! Please sign in to continue.")
                // Navigate to sign-in page after successful registration
                setTimeout(() => {
                    navigate('/auth/sign-in')
                }, 1500)
            } else {
                authService.setToken(result.token)
                authService.setUser(result.user)

                setSuccess("Welcome back!")

                // Navigate to dashboard after successful sign-in
                setTimeout(() => {
                    navigate('/dashboard')
                }, 1000)
            }

        } catch (err: unknown) {
            let errorMessage = "An unexpected error occurred"

            if (err instanceof Error) {
                errorMessage = err.message
            }

            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="flex w-full flex-col gap-6 rounded-xl border border-transparent bg-card px-4 py-8 text-card-foreground shadow-xs ring-0 dark:border-border">
            <CardHeader className="space-y-1 px-6 gap-1.5">
                <CardTitle className="font-semibold text-base lg:text-lg">
                    {isSignUp ? "Create your account" : "Sign in to your account"}
                </CardTitle>
                <CardDescription className="text-left text-sm text-muted-foreground">
                    {isSignUp ? "Enter your details to create your account." : "Welcome back! Please sign in to continue."}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 px-6">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                        data-testid={isSignUp ? "signup-form" : "signin-form"}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                                e.preventDefault()
                                if (!isLoading) {
                                    form.handleSubmit(onSubmit)()
                                }
                            }
                        }}
                    >
                        {isSignUp && (
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-foreground">Name</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Your full name"
                                                    className="h-10 rounded-md pl-10 text-sm"
                                                    disabled={isLoading}
                                                    data-testid="name-input"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-foreground">Email</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                {...field}
                                                type="email"
                                                placeholder="you@example.com"
                                                className="h-10 rounded-md pl-10 text-sm"
                                                disabled={isLoading}
                                                data-testid="email-input"
                                            />
                                        </div>
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
                                    <div className="flex items-center justify-between">
                                        <FormLabel className="text-sm font-medium text-foreground">Password</FormLabel>
                                        {!isSignUp ? (
                                            <button
                                                type="button"
                                                className="h-auto px-0 text-sm text-foreground underline underline-offset-2 opacity-80 hover:opacity-100 cursor-pointer disabled:cursor-pointer"
                                                disabled
                                                onClick={() => console.log("Forgot password clicked")}
                                            >
                                                Forgot password?
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className="text-sm text-primary px-0 h-auto invisible cursor-pointer disabled:cursor-pointer"
                                                disabled
                                            >
                                                Forgot password?
                                            </button>
                                        )}
                                    </div>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                {...field}
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                className="h-10 rounded-md pl-10 pr-12 text-sm"
                                                disabled={isLoading}
                                                data-testid="password-input"
                                            />
                                            <button
                                                type="button"
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0"
                                                onClick={() => setShowPassword(!showPassword)}
                                                disabled={isLoading}
                                                data-testid="password-toggle-btn"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    {isSignUp && (
                                        <div className="pt-1 text-sm">
                                            {!hasMinLength && (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <CircleX className="h-4 w-4" />
                                                    <span>8 or more characters</span>
                                                </div>
                                            )}
                                            {hasMinLength && !hasUpperAndLowerCase && (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <CircleX className="h-4 w-4" />
                                                    <span>Uppercase and lowercase letters</span>
                                                </div>
                                            )}
                                            {allRequirementsMet && (
                                                <div className="flex items-center gap-2 text-emerald-600">
                                                    <CircleCheck className="h-4 w-4" />
                                                    <span>All requirements met</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {error && (
                            <Alert variant="destructive" className="border-red-500 bg-red-50 text-red-800 p-4">
                                <AlertDescription className="text-red-800">{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert className="border-green-500 p-4">
                                <AlertDescription className="text-green-800">{success}</AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            className="h-10 w-full rounded-md bg-black text-sm text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 cursor-pointer"
                            disabled={isLoading}
                            data-testid={isSignUp ? "signup-btn" : "signin-btn"}
                        >
                            {isLoading ? "Please wait..." : isSignUp ? "Sign up" : "Sign in"}
                        </Button>
                    </form>
                </Form>

                <>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 w-full rounded-md border border-input bg-background text-sm cursor-pointer disabled:opacity-100 disabled:cursor-pointer"
                    >
                        <svg viewBox="0 0 256 262" className="mr-2 h-4 w-4" aria-hidden="true">
                            <path fill="#4285F4" d="M255.68 133.5c0-10.56-.95-20.7-2.73-30.45H130.5v57.57h70.32c-3.03 16.33-12.28 30.15-26.17 39.39v32.67h42.3c24.77-22.8 38.73-56.41 38.73-99.18z" />
                            <path fill="#34A853" d="M130.5 261.1c35.1 0 64.56-11.63 86.08-31.42l-42.3-32.67c-11.64 7.8-26.54 12.4-43.78 12.4-33.66 0-62.17-22.74-72.35-53.25H14.43v33.46c21.42 42.58 65.48 71.48 116.07 71.48z" />
                            <path fill="#FBBC05" d="M58.15 156.16c-2.59-7.8-4.06-16.12-4.06-24.66s1.47-16.86 4.06-24.66V73.38H14.43C5.25 91.68 0 111.9 0 131.5s5.25 39.82 14.43 58.12l43.72-33.46z" />
                            <path fill="#EA4335" d="M130.5 52.58c19.08 0 36.24 6.57 49.75 19.45l37.32-37.33C195.04 13.1 165.6 0 130.5 0 79.91 0 35.85 28.9 14.43 73.38l43.72 33.46c10.18-30.51 38.69-54.26 72.35-54.26z" />
                        </svg>
                        Google
                    </Button>
                </>

                <div className="text-center text-sm text-muted-foreground">
                    {isSignUp ? "Already have an account? " : "Don't have an account? "}
                    <Link
                        to={isSignUp ? "/auth/sign-in" : "/auth/sign-up"}
                        className="font-medium text-foreground !underline underline-offset-2 decoration-1 hover:!underline cursor-pointer"
                    >
                        {isSignUp ? "Sign in" : "Sign up"}
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}

export default AuthForm


