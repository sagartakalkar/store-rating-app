import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  Divider,
  ListItemIcon,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PersonIcon from '@mui/icons-material/Person';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import { useAuth } from '../context/AuthContext.tsx';
import ConfirmDialog from './ConfirmDialog.tsx';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    setLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    setLogoutConfirmOpen(false);
    logout();
    navigate('/login');
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'OWNER':
        return 'primary';
      case 'USER':
      default:
        return 'success';
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'OWNER') return '/owner/dashboard';
    return '/user/dashboard';
  };

  const getChangePasswordPath = () => {
    if (!user) return '/login';
    if (user.role === 'OWNER') return '/owner/change-password';
    return '/user/change-password';
  };

  const navLinks = () => {
    if (!isAuthenticated || !user) {
      return (
        <>
          <Button color="inherit" component={RouterLink} to="/login">
            Login
          </Button>
          <Button
            variant="contained"
            color="secondary"
            component={RouterLink}
            to="/register"
            sx={{ fontWeight: 600 }}
          >
            Register
          </Button>
        </>
      );
    }

    if (user.role === 'ADMIN') {
      return (
        <>
          <Button color="inherit" component={RouterLink} to="/admin/dashboard" startIcon={<DashboardIcon />}>
            Dashboard
          </Button>
          <Button color="inherit" component={RouterLink} to="/admin/users" startIcon={<PeopleIcon />}>
            Users
          </Button>
          <Button color="inherit" component={RouterLink} to="/admin/stores" startIcon={<StorefrontIcon />}>
            Stores
          </Button>
        </>
      );
    }

    if (user.role === 'OWNER') {
      return (
        <>
          <Button color="inherit" component={RouterLink} to="/owner/dashboard" startIcon={<DashboardIcon />}>
            My Store Dashboard
          </Button>
        </>
      );
    }

    // USER
    return (
      <>
        <Button color="inherit" component={RouterLink} to="/user/dashboard" startIcon={<DashboardIcon />}>
          Dashboard
        </Button>
        <Button color="inherit" component={RouterLink} to="/user/stores" startIcon={<StorefrontIcon />}>
          Browse Stores
        </Button>
      </>
    );
  };

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: '#1e293b' }} elevation={2}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo & Brand */}
          <Box
            component={RouterLink}
            to={getDashboardPath()}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '8px',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              <StorefrontIcon fontSize="medium" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.2 }}>
                StoreRate
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.68rem', display: 'block' }}>
                Ratings & Reviews
              </Typography>
            </Box>
          </Box>

          {/* Desktop Navigation Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5 }}>
            {navLinks()}

            {isAuthenticated && user && (
              <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={user.role}
                  color={getRoleColor(user.role) as any}
                  size="small"
                  sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                />
                <IconButton
                  onClick={handleProfileMenuOpen}
                  size="small"
                  sx={{ ml: 0.5, border: '2px solid rgba(255,255,255,0.2)' }}
                >
                  <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.dark', fontSize: '0.875rem' }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                </IconButton>
              </Box>
            )}
          </Box>

          {/* Mobile Hamburger Toggle */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* User Profile Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            elevation: 4,
            sx: { minWidth: 220, mt: 1.5, borderRadius: 2 },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
            {user?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', wordBreak: 'break-all' }}>
            {user?.email}
          </Typography>
          <Box sx={{ mt: 0.8 }}>
            <Chip
              label={`Role: ${user?.role}`}
              color={getRoleColor(user?.role) as any}
              size="small"
              sx={{ fontWeight: 600, fontSize: '0.7rem' }}
            />
          </Box>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            handleMenuClose();
            navigate(getChangePasswordPath());
          }}
        >
          <ListItemIcon>
            <VpnKeyIcon fontSize="small" />
          </ListItemIcon>
          Change Password
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        slotProps={{ paper: { sx: { width: 280, p: 2 } } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <StorefrontIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            StoreRate
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {user && (
          <Box sx={{ mb: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {user.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user.email}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip
                label={user.role}
                color={getRoleColor(user.role) as any}
                size="small"
              />
            </Box>
          </Box>
        )}

        <List>
          {isAuthenticated && user ? (
            <>
              {user.role === 'ADMIN' && (
                <>
                  <ListItem disablePadding>
                    <ListItemButton component={RouterLink} to="/admin/dashboard" onClick={() => setMobileOpen(false)}>
                      <ListItemText primary="Admin Dashboard" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton component={RouterLink} to="/admin/users" onClick={() => setMobileOpen(false)}>
                      <ListItemText primary="Manage Users" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton component={RouterLink} to="/admin/stores" onClick={() => setMobileOpen(false)}>
                      <ListItemText primary="Manage Stores" />
                    </ListItemButton>
                  </ListItem>
                </>
              )}

              {user.role === 'OWNER' && (
                <ListItem disablePadding>
                  <ListItemButton component={RouterLink} to="/owner/dashboard" onClick={() => setMobileOpen(false)}>
                    <ListItemText primary="Owner Dashboard" />
                  </ListItemButton>
                </ListItem>
              )}

              {user.role === 'USER' && (
                <>
                  <ListItem disablePadding>
                    <ListItemButton component={RouterLink} to="/user/dashboard" onClick={() => setMobileOpen(false)}>
                      <ListItemText primary="My Ratings" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton component={RouterLink} to="/user/stores" onClick={() => setMobileOpen(false)}>
                      <ListItemText primary="Browse Stores" />
                    </ListItemButton>
                  </ListItem>
                </>
              )}

              <Divider sx={{ my: 1 }} />
              <ListItem disablePadding>
                <ListItemButton component={RouterLink} to={getChangePasswordPath()} onClick={() => setMobileOpen(false)}>
                  <ListItemText primary="Change Password" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => { setMobileOpen(false); handleLogout(); }}>
                  <ListItemText primary="Logout" sx={{ color: 'error.main' }} />
                </ListItemButton>
              </ListItem>
            </>
          ) : (
            <>
              <ListItem disablePadding>
                <ListItemButton component={RouterLink} to="/login" onClick={() => setMobileOpen(false)}>
                  <ListItemText primary="Login" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={RouterLink} to="/register" onClick={() => setMobileOpen(false)}>
                  <ListItemText primary="Register" />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
      </Drawer>

      {/* Logout confirmation */}
      <ConfirmDialog
        open={logoutConfirmOpen}
        title="Confirm Logout"
        message="Are you sure you want to log out of your account?"
        confirmText="Logout"
        confirmColor="error"
        onConfirm={confirmLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </>
  );
};

export default Navbar;
