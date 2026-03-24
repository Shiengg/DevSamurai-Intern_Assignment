import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/feature/auth/authSlice';
import themeReducer from './slices/themeSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        theme: themeReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: ['dateRange/setDateRange'],
            ignoredPaths: ['dateRange.dateRange'],
        },
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;