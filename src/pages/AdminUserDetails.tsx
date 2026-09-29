import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Grid,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import StoreIcon from '@mui/icons-material/Store';
import StarIcon from '@mui/icons-material/Star';
import api from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import ErrorMessage from '../components/ErrorMessage.tsx';
import RatingStars from '../components/RatingStars.tsx';
import DataTable, { Column } from '../components/DataTable.tsx';
import Sidebar from '../components/Sidebar.tsx';

export const AdminUserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await api.get(`/admin/users/${id}`);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  if (loading) {
    return <LoadingSpinner minHeight="500px" message="Loading user profile..." />;
  }

  const user = data?.user;

  const storeColumns: Column[] = [
    { id: 'name', label: 'Store Name', sortable: false },
    { id: 'email', label: 'Contact Email', sortable: false },
    { id: 'address', label: 'Address', sortable: false },
    {
      id: 'average_rating',
      label: 'Average Rating',
      align: 'center',
      render: (row) => (
        <RatingStars
          value={parseFloat(row.average_rating)}
          readOnly
          size="small"
          showText
          totalRatings={row.rating_count}
        />
      ),
    },
  ];

  const ratingColumns: Column[] = [
    { id: 'store_name', label: 'Store Name', sortable: false },
    { id: 'store_address', label: 'Store Address', sortable: false },
    {
      id: 'rating',
      label: 'Submitted Rating',
      align: 'center',
      render: (row) => <RatingStars value={row.rating} readOnly size="small" showText />,
    },
    {
      id: 'created_at',
      label: 'Date',
      align: 'right',
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Sidebar />

        <Box sx={{ flexGrow: 1 }}>
          <Button
            component={RouterLink}
            to="/admin/users"
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 2, fontWeight: 600 }}
          >
            Back to Users List
          </Button>

          <ErrorMessage message={error} onRetry={fetchUserDetails} />

          {user && (
            <>
              {/* Profile Card */}
              <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PersonIcon fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      {user.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Chip
                        label={user.role}
                        color={
                          user.role === 'ADMIN'
                            ? 'error'
                            : user.role === 'OWNER'
                            ? 'primary'
                            : 'success'
                        }
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Account ID: #{user.id}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      EMAIL ADDRESS
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {user.email}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      RESIDENTIAL / CONTACT ADDRESS
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {user.address || 'No address provided'}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      MEMBER SINCE
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* If OWNER: Owned Stores */}
              {user.role === 'OWNER' && (
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <StoreIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Stores Owned by this User ({data?.ownedStores?.length || 0})
                    </Typography>
                  </Box>
                  <DataTable
                    columns={storeColumns}
                    data={data?.ownedStores || []}
                    emptyMessage="No stores registered under this owner yet."
                  />
                </Box>
              )}

              {/* Submitted Ratings */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <StarIcon color="warning" />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Ratings Submitted by this User ({data?.submittedRatings?.length || 0})
                  </Typography>
                </Box>
                <DataTable
                  columns={ratingColumns}
                  data={data?.submittedRatings || []}
                  emptyMessage="This user has not submitted any ratings yet."
                />
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default AdminUserDetails;
