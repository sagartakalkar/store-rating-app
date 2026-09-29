import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import { useAuth } from '../context/AuthContext.tsx';
import ErrorMessage from '../components/ErrorMessage.tsx';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Validation state checks
  const nameValid = formData.name.length >= 20 && formData.name.length <= 60;
  const addressValid = formData.address.length <= 400;
  const passwordLengthValid = formData.password.length >= 8 && formData.password.length <= 16;
  const passwordUpperValid = /[A-Z]/.test(formData.password);
  const passwordSpecialValid = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);
  const passwordMatches = formData.password === formData.confirmPassword && formData.password.length > 0;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend validation
    if (!nameValid) {
      setError(`Name must be between 20 and 60 characters (currently ${formData.name.length} chars)`);
      return;
    }

    if (!emailValid) {
      setError('Please provide a valid email address');
      return;
    }

    if (!addressValid) {
      setError('Address cannot exceed 400 characters');
      return;
    }

    if (!passwordLengthValid || !passwordUpperValid || !passwordSpecialValid) {
      setError('Password does not satisfy all security criteria (8-16 chars, 1 uppercase, 1 special character)');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        address: formData.address.trim() || undefined,
      });

      // Normal user redirects to user dashboard
      navigate('/user/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '16px',
            bgcolor: 'secondary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            mb: 2,
            boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)',
          }}
        >
          <PersonAddAltIcon fontSize="large" />
        </Box>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 800, textAlign: 'center', mb: 1 }}>
          Create an Account
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
          Register as a normal user to browse stores and submit reviews
        </Typography>

        <Card elevation={2} sx={{ width: '100%', borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <ErrorMessage message={error} onClose={() => setError(null)} />

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Full Name (20 to 60 characters)"
                name="name"
                value={formData.name}
                onChange={handleChange}
                helperText={`${formData.name.length}/60 chars (Min 20 required)`}
                error={formData.name.length > 0 && !nameValid}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={formData.email.length > 0 && !emailValid}
              />

              <TextField
                margin="normal"
                fullWidth
                id="address"
                label="Address (Max 400 characters)"
                name="address"
                multiline
                rows={2}
                value={formData.address}
                onChange={handleChange}
                helperText={`${formData.address.length}/400 characters`}
                error={!addressValid}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password (8-16 chars, 1 uppercase, 1 special)"
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={formData.password}
                onChange={handleChange}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
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

              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={formData.confirmPassword.length > 0 && !passwordMatches}
                helperText={
                  formData.confirmPassword.length > 0 && !passwordMatches
                    ? 'Passwords must match'
                    : ''
                }
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
              />

              {/* Password Requirement Checklist */}
              <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  PASSWORD REQUIREMENTS
                </Typography>
                <List dense sx={{ py: 0 }}>
                  <ListItem disablePadding sx={{ py: 0.3 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      {passwordLengthValid ? (
                        <CheckCircleIcon fontSize="small" color="success" />
                      ) : (
                        <CancelIcon fontSize="small" color="disabled" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="caption" sx={{ fontSize: '0.78rem' }}>8 to 16 characters in length</Typography>}
                    />
                  </ListItem>

                  <ListItem disablePadding sx={{ py: 0.3 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      {passwordUpperValid ? (
                        <CheckCircleIcon fontSize="small" color="success" />
                      ) : (
                        <CancelIcon fontSize="small" color="disabled" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="caption" sx={{ fontSize: '0.78rem' }}>At least one uppercase letter (A-Z)</Typography>}
                    />
                  </ListItem>

                  <ListItem disablePadding sx={{ py: 0.3 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      {passwordSpecialValid ? (
                        <CheckCircleIcon fontSize="small" color="success" />
                      ) : (
                        <CancelIcon fontSize="small" color="disabled" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="caption" sx={{ fontSize: '0.78rem' }}>At least one special character (!@#$%^&*...)</Typography>}
                    />
                  </ListItem>

                  <ListItem disablePadding sx={{ py: 0.3 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      {passwordMatches ? (
                        <CheckCircleIcon fontSize="small" color="success" />
                      ) : (
                        <CancelIcon fontSize="small" color="disabled" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="caption" sx={{ fontSize: '0.78rem' }}>Passwords match</Typography>}
                    />
                  </ListItem>
                </List>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2, py: 1.4, fontWeight: 700, borderRadius: 2 }}
              >
                {loading ? 'Creating Account...' : 'Register'}
              </Button>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Already registered?{' '}
                  <Button
                    component={RouterLink}
                    to="/login"
                    size="small"
                    sx={{ fontWeight: 700, textTransform: 'none' }}
                  >
                    Sign In
                  </Button>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Register;
