import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StarIcon from '@mui/icons-material/Star';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import RateReviewIcon from '@mui/icons-material/RateReview';
import api from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import ErrorMessage from '../components/ErrorMessage.tsx';
import RatingStars from '../components/RatingStars.tsx';
import DataTable, { Column } from '../components/DataTable.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface RatingUserEntry {
  id: number;
  rating: number;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
  user_address?: string;
  store_id: number;
  store_name: string;
}

export const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await api.get('/owner/dashboard');
      if (res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load store owner dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const columns: Column<RatingUserEntry>[] = [
    {
      id: 'user_name',
      label: 'Customer Name',
      sortable: false,
      minWidth: 180,
      render: (r) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {r.user_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Verified Customer
          </Typography>
        </Box>
      ),
    },
    {
      id: 'user_email',
      label: 'Customer Email',
      sortable: false,
      minWidth: 200,
    },
    {
      id: 'rating',
      label: 'Rating',
      align: 'center',
      minWidth: 140,
      render: (r) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <RatingStars value={r.rating} readOnly size="small" showText />
        </Box>
      ),
    },
    {
      id: 'store_name',
      label: 'Store',
      minWidth: 180,
      render: (r) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {r.store_name}
        </Typography>
      ),
    },
    {
      id: 'created_at',
      label: 'Rating Date',
      align: 'right',
      minWidth: 140,
      render: (r) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(r.created_at).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </Typography>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner minHeight="500px" message="Loading owner portal..." />;
  }

  const hasStore = dashboardData?.hasStore;
  const primaryStore = dashboardData?.primaryStore;
  const stores = dashboardData?.stores || [];
  const ratings = dashboardData?.ratings || [];
  const averageRating = parseFloat(String(dashboardData?.averageRating || 0));
  const totalRatings = dashboardData?.totalRatings || 0;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Store Owner Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor your customer reviews, ratings score, and feedback metrics
        </Typography>
      </Box>

      <ErrorMessage message={error} onRetry={fetchDashboard} />

      {!hasStore ? (
        /* Empty state: No store assigned */
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 3 }}>
          <StorefrontIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            No Store Assigned Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
            Your account ({user?.email}) is registered as a Store Owner, but no store has been assigned to you yet by the administrator.
          </Typography>
          <Alert severity="info" sx={{ maxWidth: 500, mx: 'auto' }}>
            Please contact an administrator at <strong>admin@example.com</strong> to assign your store location.
          </Alert>
        </Paper>
      ) : (
        <>
          {/* Top Metrics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Store Name & Location */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  borderLeft: '5px solid #1976d2',
                  height: '100%',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <StorefrontIcon color="primary" />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    YOUR STORE
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {primaryStore?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  📍 {primaryStore?.address}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  ✉️ {primaryStore?.email}
                </Typography>
              </Paper>
            </Grid>

            {/* Average Rating */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  borderLeft: '5px solid #ed6c02',
                  height: '100%',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <StarIcon color="warning" />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    AVERAGE RATING
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    / 5.0
                  </Typography>
                </Box>
                <Box sx={{ mt: 1.5 }}>
                  <RatingStars value={averageRating} readOnly size="medium" />
                </Box>
              </Paper>
            </Grid>

            {/* Total Ratings */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  borderLeft: '5px solid #2e7d32',
                  height: '100%',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <PeopleAltIcon color="success" />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    TOTAL NUMBER OF RATINGS
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>
                  {totalRatings}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Total customer submissions recorded
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* List of Users Who Submitted Ratings */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <RateReviewIcon color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Customer Ratings & Feedback ({ratings.length})
              </Typography>
            </Box>

            {ratings.length === 0 ? (
              <Paper elevation={0} sx={{ p: 6, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 3 }}>
                <StarIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  No customer ratings yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  When customers visit and submit ratings for your store, their details and scores will appear here.
                </Typography>
              </Paper>
            ) : (
              <DataTable
                columns={columns}
                data={ratings}
                emptyMessage="No ratings have been submitted for your store yet."
              />
            )}
          </Box>
        </>
      )}
    </Container>
  );
};

export default OwnerDashboard;
