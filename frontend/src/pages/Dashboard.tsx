import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { authService } from '@/services/authService';
import { setUser } from '@/feature/auth/authSlice';
import { SidebarProvider } from '@/components/ui/sidebar';
import Sidebar from '@/components/Sidebar';

interface AuthUser {
    id: number;
    name: string;
    email: string;
    createdat: string;
    updatedat: string;
}

export default function DashboardPage() {
    const [user, setUserState] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [apiCallMade, setApiCallMade] = useState(false)
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = authService.getToken();
                if (!token) {
                    navigate('/auth/sign-in');
                    return;
                }

                const userStr = localStorage.getItem('user');
                if (userStr) {
                    try {
                        const cachedUser = JSON.parse(userStr);
                        if (cachedUser?.id && cachedUser?.email) {
                            setUserState(cachedUser);
                            dispatch(setUser({
                                id: cachedUser.id,
                                name: cachedUser.name,
                                email: cachedUser.email,
                            }))
                            setLoading(false);
                        }
                    } catch {
                        // If cached user is invalid, remove it and navigate to sign-in
                    }
                }

                // Make API call to get fresh data and verify token
                if (!apiCallMade) {
                    try {
                        const response = await authService.fetchUser();
                        const userData = response.user;

                        setUserState(userData);

                        localStorage.setItem('user', JSON.stringify(userData));

                        //Update Redux store
                        dispatch(setUser({
                            id: userData.id,
                            name: userData.name,
                            email: userData.email,
                        }));

                        setApiCallMade(true);

                    } catch {
                        // If API call fails, remove cached user and token
                        localStorage.removeItem('user');
                        authService.removeToken();
                        navigate('/auth/sign-in');
                    }
                }
            } catch {
                authService.removeToken();
                navigate('/auth/sign-in');
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, [navigate, dispatch, apiCallMade]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground/60 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <SidebarProvider defaultOpen={true} data-testid="dashboard-page">
            <Sidebar />
        </SidebarProvider>
    )
}