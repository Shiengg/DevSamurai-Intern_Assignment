import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SignInPage from '@/pages/SignIn'
import SignUpPage from '@/pages/SignUp'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/sign-in" element={<SignInPage />} />
        <Route path="/auth/sign-up" element={<SignUpPage />} />
        <Route path="/" element={<Navigate to="/auth/sign-in" replace />} />
        <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
      </Routes>
    </BrowserRouter>
  )
}