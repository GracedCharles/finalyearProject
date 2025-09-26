import { useAuth } from '@clerk/clerk-react'
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App.tsx'
import ClerkProviderWrapper from './components/ClerkProviderWrapper.tsx'
import LoginPage from './components/LoginPage.tsx'
import './index.css'
import { checkAdminRole } from './lib/authHelpers.ts'

// Apply dark theme by default
document.body.classList.add('dark')

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [checkingAdmin, setCheckingAdmin] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (isSignedIn) {
        setCheckingAdmin(true)
        const { isAdmin: adminStatus } = await checkAdminRole()
        setIsAdmin(adminStatus)
        setCheckingAdmin(false)
      } else {
        setIsAdmin(null)
        setCheckingAdmin(false)
      }
    }

    if (isLoaded && isSignedIn) {
      checkAdminStatus()
    } else if (isLoaded && !isSignedIn) {
      setCheckingAdmin(false)
    }
  }, [isSignedIn, isLoaded])

  if (!isLoaded || checkingAdmin) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!isSignedIn) {
    return <LoginPage />
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full space-y-8 p-8 bg-card rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access the admin dashboard. Only administrators can access this area.
          </p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return children
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ClerkProviderWrapper>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </ClerkProviderWrapper>
    </BrowserRouter>
  </React.StrictMode>,
)