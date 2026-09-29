import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import Navbar from './components/Navbar.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import RoleProtectedRoute from './components/RoleProtectedRoute.tsx';

// Pages
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import ChangePassword from './pages/ChangePassword.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import AdminUsers from './pages/AdminUsers.tsx';
import AdminUserDetails from './pages/AdminUserDetails.tsx';
import AdminStores from './pages/AdminStores.tsx';
import UserDashboard from './pages/UserDashboard.tsx';
import UserStores from './pages/UserStores.tsx';
import OwnerDashboard from './pages/OwnerDashboard.tsx';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
      light: '#3b82f6',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#7c3aed',
      light: '#8b5cf6',
      dark: '#6d28d9',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
  },
  typography: {
    fontFamily: ['"Inter"', '"Roboto"', '"Helvetica"', '"Arial"', 'sans-serif'].join(','),
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// Root redirect helper based on auth status and role
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'OWNER') return <Navigate to="/owner/dashboard" replace />;
  return <Navigate to="/user/dashboard" replace />;
};

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                {/* Root Route */}
                <Route path="/" element={<RootRedirect />} />

                {/* Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <RoleProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <RoleProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminUsers />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users/:id"
                  element={
                    <RoleProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminUserDetails />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="/admin/stores"
                  element={
                    <RoleProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminStores />
                    </RoleProtectedRoute>
                  }
                />

                {/* Normal User Routes */}
                <Route
                  path="/user/dashboard"
                  element={
                    <RoleProtectedRoute allowedRoles={['USER']}>
                      <UserDashboard />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="/user/stores"
                  element={
                    <RoleProtectedRoute allowedRoles={['USER']}>
                      <UserStores />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="/user/change-password"
                  element={
                    <ProtectedRoute>
                      <ChangePassword />
                    </ProtectedRoute>
                  }
                />

                {/* Store Owner Routes */}
                <Route
                  path="/owner/dashboard"
                  element={
                    <RoleProtectedRoute allowedRoles={['OWNER']}>
                      <OwnerDashboard />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="/owner/change-password"
                  element={
                    <RoleProtectedRoute allowedRoles={['OWNER']}>
                      <ChangePassword />
                    </RoleProtectedRoute>
                  }
                />

                {/* Catch-all redirect */}
                <Route path="*" element={<RootRedirect />} />
              </Routes>
            </Box>
          </Box>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
