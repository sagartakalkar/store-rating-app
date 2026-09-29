import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import RateReviewIcon from '@mui/icons-material/RateReview';
import EditIcon from '@mui/icons-material/Edit';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import api from '../services/api.js';
import RatingStars from '../components/RatingStars.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import ErrorMessage from '../components/ErrorMessage.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();

  const [ratedStores, setRatedStores] = useState<any[]>([]);
  const [totalCatalogCount, setTotalCatalogCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit rating dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<any>(null);
  const [newRatingValue, setNewRatingValue] = useState<number>(5);
  const [updating, setUpdating] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all stores to filter rated ones and catalog count
      const storesRes: any = await api.get('/stores', { params: { limit: 100 } });
      if (storesRes.success && storesRes.data) {
        setTotalCatalogCount(storesRes.data.pagination?.total || storesRes.data.stores.length);
        const rated = storesRes.data.stores.filter(
          (s: any) => s.user_rating !== null && s.user_rating !== undefined
        );
        setRatedStores(rated);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load user dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleOpenEdit = (store: any) => {
    setSelectedRating(store);
    setNewRatingValue(Number(store.user_rating) || 5);
    setDialogError(null);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedRating?.user_rating_id) return;
    setUpdating(true);
    setDialogError(null);
    try {
      await api.put(`/ratings/${selectedRating.user_rating_id}`, {
        rating: newRatingValue,
      });
      setEditDialogOpen(false);
      fetchUserData();
    } catch (err: any) {
      setDialogError(err.message || 'Failed to update rating');
    } finally {
      setUpdating(false);
    }
  };

  const averageGivenRating =
    ratedStores.length > 0
      ? (
          ratedStores.reduce((acc, curr) => acc + Number(curr.user_rating || 0), 0) /
          ratedStores.length
        ).toFixed(1)
      : '0.0';

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 4,
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Welcome back, {user?.name?.split(' ')[0]}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your store reviews and explore new places to rate
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/user/stores"
          startIcon={<StorefrontIcon />}
          sx={{ fontWeight: 700, px: 2.5, py: 1 }}
        >
          Browse All Stores
        </Button>
      </Box>

      <ErrorMessage message={error} onRetry={fetchUserData} />

      {loading ? (
        <LoadingSpinner minHeight="300px" />
      ) : (
        <>
          {/* Stat Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  borderLeft: '5px solid #1976d2',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '12px',
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <RateReviewIcon fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    STORES YOU RATED
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {ratedStores.length}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  borderLeft: '5px solid #ed6c02',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
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
                    YOUR AVERAGE SCORE GIVEN
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {averageGivenRating} / 5
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  borderLeft: '5px solid #2e7d32',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '12px',
                    bgcolor: '#81c784',
                    color: '#1b5e20',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <StorefrontIcon fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    TOTAL AVAILABLE STORES
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {totalCatalogCount}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Rated Stores List */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Your Reviews & Ratings ({ratedStores.length})
              </Typography>
              <Button
                component={RouterLink}
                to="/user/stores"
                endIcon={<ArrowForwardIcon />}
                sx={{ fontWeight: 600 }}
              >
                View Catalog
              </Button>
            </Box>

            {ratedStores.length === 0 ? (
              <Paper elevation={0} sx={{ p: 6, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 3 }}>
                <RateReviewIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  You haven't rated any stores yet!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                  Share your experience with local stores and help the community discover great places.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  component={RouterLink}
                  to="/user/stores"
                  startIcon={<StorefrontIcon />}
                  sx={{ fontWeight: 700 }}
                >
                  Browse Stores to Rate
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {ratedStores.map((store) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={store.id}>
                    <Card elevation={2} sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                          {store.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          📍 {store.address}
                        </Typography>

                        <Divider sx={{ my: 1.5 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            YOUR RATING:
                          </Typography>
                          <RatingStars value={Number(store.user_rating)} readOnly size="small" showText />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            COMMUNITY AVERAGE:
                          </Typography>
                          <RatingStars
                            value={parseFloat(String(store.average_rating))}
                            readOnly
                            size="small"
                            showText
                            totalRatings={store.rating_count}
                          />
                        </Box>
                      </CardContent>

                      <Box sx={{ p: 2, pt: 0 }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenEdit(store)}
                          sx={{ fontWeight: 600 }}
                        >
                          Modify Rating
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </>
      )}

      {/* Modify Rating Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Modify Your Rating</DialogTitle>
        <DialogContent dividers>
          {selectedRating && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {selectedRating.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                {selectedRating.address}
              </Typography>

              <ErrorMessage message={dialogError} onClose={() => setDialogError(null)} />

              <Box sx={{ my: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <RatingStars
                  value={newRatingValue}
                  onChange={(val) => setNewRatingValue(val || 1)}
                  size="large"
                />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {newRatingValue} Stars
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveEdit}
            disabled={updating}
            sx={{ fontWeight: 700 }}
          >
            {updating ? 'Updating...' : 'Save Rating'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserDashboard;
