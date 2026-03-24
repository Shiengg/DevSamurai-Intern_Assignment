import { AuthForm } from "@/components/AuthForm"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useEffect } from "react"

export default function SignInPage() {
    useEffect(() => {
        const previousTitle = document.title
        document.title = "Sign in | Acme"

        return () => {
            document.title = previousTitle
        }
    }, [])

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-background" data-testid="signin-page">
            <div className="fixed bottom-4 right-4">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-[420px]">
                <div className="mb-8 flex items-center justify-center gap-2">
                    <div className="rounded-md px-3 py-2 dark:bg-white/95">
                        <img
                            src="/DevSamuraiBanner.png"
                            alt="DevSamurai"
                            className="h-12 w-auto object-contain"
                        />
                    </div>
                </div>

                <AuthForm mode="signin" />
            </div>
        </div>
    )
}
