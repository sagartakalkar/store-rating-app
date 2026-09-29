import React from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';

interface SidebarProps {
  onAddUserClick?: () => void;
  onAddStoreClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onAddUserClick,
  onAddStoreClick,
}) => {
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
    { text: 'Users Management', path: '/admin/users', icon: <PeopleIcon /> },
    { text: 'Stores Management', path: '/admin/stores', icon: <StorefrontIcon /> },
  ];

  return (
    <Paper
      elevation={1}
      sx={{
        width: 250,
        flexShrink: 0,
        borderRadius: 2,
        overflow: 'hidden',
        display: { xs: 'none', md: 'block' },
      }}
    >
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: '#fff' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Admin Panel
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.85 }}>
          StoreRate Management
        </Typography>
      </Box>

      <List sx={{ py: 1 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                selected={isSelected}
                sx={{
                  py: 1.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                    fontWeight: 700,
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isSelected ? 'inherit' : 'action.active' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{ fontSize: '0.9rem', fontWeight: isSelected ? 700 : 500 }}
                    >
                      {item.text}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {(onAddUserClick || onAddStoreClick) && (
        <>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
              Quick Actions
            </Typography>
          </Box>
          <List sx={{ pt: 0, pb: 1 }}>
            {onAddUserClick && (
              <ListItem disablePadding>
                <ListItemButton onClick={onAddUserClick}>
                  <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                    <PersonAddIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ fontSize: '0.875rem' }}>Add New User</Typography>}
                  />
                </ListItemButton>
              </ListItem>
            )}
            {onAddStoreClick && (
              <ListItem disablePadding>
                <ListItemButton onClick={onAddStoreClick}>
                  <ListItemIcon sx={{ minWidth: 40, color: 'secondary.main' }}>
                    <AddBusinessIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ fontSize: '0.875rem' }}>Add New Store</Typography>}
                  />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </>
      )}
    </Paper>
  );
};

export default Sidebar;
