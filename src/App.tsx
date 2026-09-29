
import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
} from '@mui/material';

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
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',

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
        root: {
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

/* ---------------------------------------------------
   Root Redirect
--------------------------------------------------- */

const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  // Wait until authentication state is loaded
  if (loading) {
    return null;
  }

  // User is not logged in
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Admin
  if (user.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Store Owner
  if (user.role === 'OWNER') {
    return <Navigate to="/owner/dashboard" replace />;
  }

  // Normal User
  return <Navigate to="/user/dashboard" replace />;
};





const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AuthProvider>
        <BrowserRouter>
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.default',
            }}
          >
            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <Box
              component="main"
              sx={{
                flexGrow: 1,
              }}
            >
              <Routes>

               
                <Route
                  path="/"
                  element={<RootRedirect />}
                />

                
                <Route
                  path="/login"
                  element={<Login />}
                />

                <Route
                  path="/register"
                  element={<Register />}
                />

                

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

                <Route
                  path="*"
                  element={<RootRedirect />}
                />

              </Routes>
            </Box>
          </Box>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
