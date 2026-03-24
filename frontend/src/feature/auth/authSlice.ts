import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    token: string | null;
    user: {
        id?: number;
        name: string;
        displayName?: string;
        email: string;
        initials: string
    } | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    token: null,
    user: null,
    isAuthenticated: false,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
            state.isAuthenticated = true;
        },
        setUser: (state, action: PayloadAction<{ id?: number; name: string; email?: string }>) => {
            const { id, name, email } = action.payload;
            state.user = {
                id,
                name,
                displayName: name,
                email: email || '',
                initials: name.slice(0, 2).toUpperCase()
            }
        },
        setUserDisplay: (state, action: PayloadAction<string>) => {
            if (state.user) {
                state.user.displayName = action.payload
                state.user.initials = action.payload.slice(0, 2).toUpperCase()
            }
        },
        login: (state, action: PayloadAction<{ token: string; user: { id?: number; name: string; email?: string } }>) => {
            const { token, user } = action.payload;
            state.token = token;
            state.user = {
                id: user.id,
                name: user.name,
                displayName: user.name,
                email: user.email || '',
                initials: user.name.slice(0, 2).toUpperCase()
            }
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
        }
    }
})

export const { setToken, setUser, setUserDisplay, login, logout } = authSlice.actions;
export default authSlice.reducer;