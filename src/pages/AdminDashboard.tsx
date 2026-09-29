import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import StoreIcon from '@mui/icons-material/Store';
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import api from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import ErrorMessage from '../components/ErrorMessage.tsx';
import RatingStars from '../components/RatingStars.tsx';
import Sidebar from '../components/Sidebar.tsx';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await api.get('/admin/dashboard');
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Sidebar
          onAddUserClick={() => navigate('/admin/users?action=new')}
          onAddStoreClick={() => navigate('/admin/stores?action=new')}
        />

        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Admin Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Overview and key metrics for StoreRate platform
            </Typography>
          </Box>

          <ErrorMessage message={error} onRetry={fetchStats} />

          {loading ? (
            <LoadingSpinner minHeight="300px" />
          ) : (
            <>
              {/* Stat Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card
                    elevation={1}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      borderLeft: '5px solid #1976d2',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '12px',
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PeopleAltIcon fontSize="large" />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        TOTAL USERS
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        {stats?.totalUsers ?? 0}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card
                    elevation={1}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      borderLeft: '5px solid #2e7d32',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '12px',
                        bgcolor: '#81c784',
                        color: '#1b5e20',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <StoreIcon fontSize="large" />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        TOTAL STORES
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        {stats?.totalStores ?? 0}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card
                    elevation={1}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      borderLeft: '5px solid #ed6c02',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '12px',
                        bgcolor: '#ffb74d',
                        color: '#e65100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <StarIcon fontSize="large" />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        TOTAL RATINGS
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        {stats?.totalRatings ?? 0}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              </Grid>

              {/* Roles Breakdown & Quick Actions */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      User Distribution by Role
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {stats?.rolesBreakdown?.map((rb: any) => (
                        <Box
                          key={rb.role}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 1.5,
                            bgcolor: 'action.hover',
                            borderRadius: 1.5,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={rb.role}
                              color={
                                rb.role === 'ADMIN'
                                  ? 'error'
                                  : rb.role === 'OWNER'
                                  ? 'primary'
                                  : 'success'
                              }
                              size="small"
                              sx={{ fontWeight: 700 }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {rb.role === 'ADMIN' && 'Administrators'}
                              {rb.role === 'OWNER' && 'Store Owners'}
                              {rb.role === 'USER' && 'Normal Users'}
                            </Typography>
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {rb.count}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    <Button
                      component={RouterLink}
                      to="/admin/users"
                      endIcon={<ArrowForwardIcon />}
                      sx={{ mt: 2, fontWeight: 600 }}
                    >
                      Manage All Users
                    </Button>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      Top Rated Stores
                    </Typography>
                    {stats?.topStores?.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {stats.topStores.map((store: any) => (
                          <Box
                            key={store.id}
                            sx={{
                              p: 1.5,
                              bgcolor: 'action.hover',
                              borderRadius: 1.5,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Box sx={{ pr: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {store.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                                {store.address}
                              </Typography>
                            </Box>
                            <RatingStars
                              value={parseFloat(store.average_rating)}
                              readOnly
                              size="small"
                              showText
                              totalRatings={store.rating_count}
                            />
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No stores rated yet.
                      </Typography>
                    )}
                    <Button
                      component={RouterLink}
                      to="/admin/stores"
                      endIcon={<ArrowForwardIcon />}
                      sx={{ mt: 2, fontWeight: 600 }}
                    >
                      Manage All Stores
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
