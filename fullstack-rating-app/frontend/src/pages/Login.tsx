import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  Chip,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../context/AuthContext.tsx';
import ErrorMessage from '../components/ErrorMessage.tsx';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const loggedInUser = await login({ email, password });

      // Redirect user according to their role
      if (loggedInUser.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (loggedInUser.role === 'OWNER') {
        navigate('/owner/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick login helper for testing
  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '16px',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            mb: 2,
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
          }}
        >
          <StorefrontIcon fontSize="large" />
        </Box>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 800, textAlign: 'center', mb: 1 }}>
          StoreRate Portal
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
          Common access point for Admins, Normal Users, and Store Owners
        </Typography>

        <Card elevation={2} sx={{ width: '100%', borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <LockOutlinedIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Sign In to Account
              </Typography>
            </Box>

            <ErrorMessage message={error} onClose={() => setError(null)} />

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2, py: 1.4, fontWeight: 700, borderRadius: 2 }}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Button
                    component={RouterLink}
                    to="/register"
                    size="small"
                    sx={{ fontWeight: 700, textTransform: 'none' }}
                  >
                    Register here
                  </Button>
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Chip label="DEMO QUICK LOGIN" size="small" sx={{ fontSize: '0.7rem', fontWeight: 700 }} />
            </Divider>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => handleQuickLogin('admin@example.com', 'Admin@123')}
                sx={{ justifyContent: 'space-between', px: 2, textTransform: 'none' }}
              >
                <span><strong>Admin:</strong> admin@example.com</span>
                <Chip label="Admin@123" size="small" color="error" variant="outlined" />
              </Button>

              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => handleQuickLogin('owner@example.com', 'Owner@123')}
                sx={{ justifyContent: 'space-between', px: 2, textTransform: 'none' }}
              >
                <span><strong>Store Owner:</strong> owner@example.com</span>
                <Chip label="Owner@123" size="small" color="primary" variant="outlined" />
              </Button>

              <Button
                variant="outlined"
                color="success"
                size="small"
                onClick={() => handleQuickLogin('user@example.com', 'User@123')}
                sx={{ justifyContent: 'space-between', px: 2, textTransform: 'none' }}
              >
                <span><strong>Normal User:</strong> user@example.com</span>
                <Chip label="User@123" size="small" color="success" variant="outlined" />
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Login;
