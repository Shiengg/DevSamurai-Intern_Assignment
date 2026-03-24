import axios from 'axios';
import { authService } from '@/services/authService';

function normalizeBaseUrl(raw?: string): string {
    const fallback = 'http://localhost:3000'
    if (!raw || typeof raw !== 'string' || raw.trim().length === 0) return fallback

    let url = raw.trim()

    // If it looks like just a host (no protocol), default to https for production hosts
    if (!/^https?:\/\//i.test(url)) {
        // Support values like "example.com", "example.com:3000", or "/api"
        // If it starts with '/', treat it as relative path and use fallback
        if (url.startsWith('/')) return fallback + url

        url = `https://${url}`
    }

    // Remove trailing slashes for consistency
    url = url.replace(/\/$/, '')
    return url
}

export const api = axios.create({
    baseURL: normalizeBaseUrl(import.meta.env.VITE_API_URL),
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
})

api.interceptors.request.use(
    (config) => {
        const token = authService.getToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401) {
            const requestUrl = error.config?.url || ''
            const isAuthEndpoint =
                requestUrl.includes('/auth/login') ||
                requestUrl.includes('/auth/signup') ||
                requestUrl.includes('/auth/signin')

            if (!isAuthEndpoint) {
                // Only redirect if it's not an auth endpoint
                authService.removeToken()
                window.location.href = '/auth/sign-in'
            }
        }

        // Extract error message
        const message = error.response?.data?.message || error.message || 'An error occurred'

        // Create a custom error object
        const customError = new Error(message)
        customError.name = 'ApiError'

        return Promise.reject(customError)
    }
)
