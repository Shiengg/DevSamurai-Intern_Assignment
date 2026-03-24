import { api } from "@/lib/axios";
import axios from "axios";

export interface SignupResponse {
    name: string;
    email: string;
    password: string;
}

export interface LoginResponse {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: {
        id: number;
        name: string;
        email: string;
        createdat: string;
        updatedat: string;
    }
    token: string;
}

class AuthService {
    async signUp(data: SignupResponse): Promise<AuthResponse> {
        try {
            const response = await api.post('/auth/signup', data);
            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                throw new Error(String(error.response.data.message))
            }
            if (error instanceof Error) {
                throw new Error(error.message)
            }
            throw new Error('Failed to sign up. Please try again.')
        }
    }

    async login(data: LoginResponse): Promise<AuthResponse> {
        try {
            const response = await api.post('/auth/login', data);
            return response.data;
        } catch (error: unknown) {
            const statusCode = axios.isAxiosError(error) ? error.response?.status : undefined
            if (statusCode === 401 || statusCode === 400) {
                throw new Error("Email or password is not correct.")
            }

            if (axios.isAxiosError(error) && error.response?.data?.message) {
                throw new Error(String(error.response.data.message))
            }
            if (error instanceof Error) {
                throw new Error(error.message)
            }
            throw new Error('Failed to login. Please try again.')
        }
    }
    //Token management
    setToken(token: string): void {
        localStorage.setItem('accessToken', token)
    }

    getToken(): string | null {
        return localStorage.getItem('accessToken')
    }

    removeToken(): void {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
    }

    //User management
    setUser(user: AuthResponse['user']): void {
        localStorage.setItem('user', JSON.stringify(user))
    }

    getUser(): AuthResponse['user'] | null {
        const user = localStorage.getItem('user')
        return user ? JSON.parse(user) : null
    }

    removeUser(): void {
        localStorage.removeItem('user')
    }

    isAuthenticated(): boolean {
        return !!this.getToken()
    }

    //Fetch user using JWT token
    async fetchUser(): Promise<{ user: AuthResponse['user'] }> {
        try {
            const response = await api.get('/me')
            return response.data
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to fetch user profile'
            throw new Error(message)
        }
    }
}

export const authService = new AuthService();