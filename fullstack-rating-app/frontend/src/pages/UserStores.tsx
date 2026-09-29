import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
} from '@mui/material';
import RateReviewIcon from '@mui/icons-material/RateReview';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/Star';
import StorefrontIcon from '@mui/icons-material/Storefront';
import api from '../services/api.js';
import SearchBar from '../components/SearchBar.tsx';
import RatingStars from '../components/RatingStars.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import ErrorMessage from '../components/ErrorMessage.tsx';
import Pagination from '../components/Pagination.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface StoreItem {
  id: number;
  name: string;
  email: string;
  address: string;
  average_rating: string | number;
  rating_count: number;
  user_rating?: number | null;
  user_rating_id?: number | null;
}

export const UserStores: React.FC = () => {
  const { user } = useAuth();

  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [nameSearch, setNameSearch] = useState('');
  const [addressSearch, setAddressSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Rating Modal state
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreItem | null>(null);
  const [ratingValue, setRatingValue] = useState<number | null>(5);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingModalError, setRatingModalError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const fetchStores = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page,
        limit: 12,
        sortBy,
        order,
      };

      if (nameSearch.trim()) {
        params.name = nameSearch.trim();
      }

      if (addressSearch.trim()) {
        params.address = addressSearch.trim();
      }

      const res: any = await api.get('/stores', { params });
      if (res.success && res.data) {
        setStores(res.data.stores);
        setTotalPages(res.data.pagination.totalPages || 1);
        setTotalCount(res.data.pagination.total || 0);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stores list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [page, sortBy, order]);

  const handleNameSearchChange = (val: string) => {
    setNameSearch(val);
    setPage(1);
    executeSearch(val, addressSearch);
  };

  const handleAddressSearchChange = (val: string) => {
    setAddressSearch(val);
    setPage(1);
    executeSearch(nameSearch, val);
  };

  const executeSearch = (name: string, address: string) => {
    setLoading(true);
    api.get('/stores', {
      params: {
        page: 1,
        limit: 12,
        name: name.trim() || undefined,
        address: address.trim() || undefined,
        sortBy,
        order,
      },
    })
      .then((res: any) => {
        if (res.success && res.data) {
          setStores(res.data.stores);
          setTotalPages(res.data.pagination.totalPages || 1);
          setTotalCount(res.data.pagination.total || 0);
        }
      })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const handleOpenRatingModal = (store: StoreItem) => {
    setSelectedStore(store);
    setRatingValue(store.user_rating || 5);
    setRatingModalError(null);
    setRatingModalOpen(true);
  };

  const handleRatingSubmit = async () => {
    if (!selectedStore || !ratingValue) {
      setRatingModalError('Please select a rating between 1 and 5 stars');
      return;
    }

    setSubmittingRating(true);
    setRatingModalError(null);

    try {
      if (selectedStore.user_rating_id) {
        // Modify existing rating
        await api.put(`/ratings/${selectedStore.user_rating_id}`, {
          rating: ratingValue,
        });
        setFeedbackSuccess(`Your rating for "${selectedStore.name}" was updated!`);
      } else {
        // Submit new rating
        await api.post('/ratings', {
          store_id: selectedStore.id,
          rating: ratingValue,
        });
        setFeedbackSuccess(`Thank you! Your rating for "${selectedStore.name}" has been recorded.`);
      }

      setRatingModalOpen(false);
      fetchStores();
    } catch (err: any) {
      setRatingModalError(err.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const getRatingLabel = (val: number | null) => {
    switch (val) {
      case 1:
        return '1 - Poor';
      case 2:
        return '2 - Fair';
      case 3:
        return '3 - Good';
      case 4:
        return '4 - Very Good';
      case 5:
        return '5 - Excellent';
      default:
        return 'Select a rating';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Stores Directory
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explore registered stores, view community ratings, and submit or modify your reviews.
        </Typography>
      </Box>

      {feedbackSuccess && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setFeedbackSuccess(null)}
        >
          {feedbackSuccess}
        </Alert>
      )}

      <ErrorMessage message={error} onRetry={fetchStores} />

      {/* Search and Sort Toolbar */}
      <Paper elevation={1} sx={{ p: 2.5, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <SearchBar
              placeholder="Search stores by Name..."
              value={nameSearch}
              onChange={handleNameSearchChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <SearchBar
              placeholder="Search stores by Address / Location..."
              value={addressSearch}
              onChange={handleAddressSearchChange}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-by-select-label">Sort Stores</InputLabel>
              <Select
                labelId="sort-by-select-label"
                value={sortBy}
                label="Sort Stores"
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="name">Store Name</MenuItem>
                <MenuItem value="average_rating">Overall Rating</MenuItem>
                <MenuItem value="rating_count">Most Rated</MenuItem>
                <MenuItem value="address">Address</MenuItem>
                <MenuItem value="created_at">Date Added</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-order-select-label">Order</InputLabel>
              <Select
                labelId="sort-order-select-label"
                value={order}
                label="Order"
                onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
              >
                <MenuItem value="asc">Ascending (A-Z / Low-High)</MenuItem>
                <MenuItem value="desc">Descending (Z-A / High-Low)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Stores Grid View */}
      {loading ? (
        <LoadingSpinner minHeight="350px" message="Loading stores..." />
      ) : stores.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 3 }}>
          <StorefrontIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            No stores match your search criteria.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search terms or clearing filters.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {stores.map((store) => {
            const hasUserRated = store.user_rating !== null && store.user_rating !== undefined;
            const avgRating = parseFloat(String(store.average_rating));

            return (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={store.id}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2.5,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                        {store.name}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                      📍 {store.address}
                    </Typography>

                    <Divider sx={{ my: 1.5 }} />

                    {/* Overall Rating */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                        OVERALL RATING
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <RatingStars
                          value={avgRating}
                          readOnly
                          size="medium"
                          showText
                          totalRatings={store.rating_count}
                        />
                      </Box>
                    </Box>

                    {/* User's Submitted Rating */}
                    <Box sx={{ p: 1.5, bgcolor: hasUserRated ? '#f0fdf4' : 'action.hover', borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
                        YOUR SUBMITTED RATING
                      </Typography>
                      {hasUserRated ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <RatingStars value={Number(store.user_rating)} readOnly size="small" />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.dark' }}>
                            {store.user_rating} / 5 Stars
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', mt: 0.5 }}>
                          You have not rated this store yet.
                        </Typography>
                      )}
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    {hasUserRated ? (
                      <Button
                        fullWidth
                        variant="outlined"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenRatingModal(store)}
                        sx={{ fontWeight: 700, py: 1 }}
                      >
                        Modify Rating
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        startIcon={<RateReviewIcon />}
                        onClick={() => handleOpenRatingModal(store)}
                        sx={{ fontWeight: 700, py: 1 }}
                      >
                        Submit Rating
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalCount}
        limit={12}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Submit / Modify Rating Dialog */}
      <Dialog
        open={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {selectedStore?.user_rating ? 'Modify Store Rating' : 'Rate this Store'}
        </DialogTitle>
        <DialogContent dividers>
          {selectedStore && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                {selectedStore.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {selectedStore.address}
              </Typography>

              <ErrorMessage message={ratingModalError} onClose={() => setRatingModalError(null)} />

              <Box sx={{ my: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <RatingStars
                  value={ratingValue || 0}
                  onChange={(val) => setRatingValue(val)}
                  size="large"
                  precision={1}
                />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mt: 1 }}>
                  {getRatingLabel(ratingValue)}
                </Typography>
              </Box>

              <Typography variant="caption" color="text.secondary">
                Select between 1 and 5 stars. Only one rating per store is allowed.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setRatingModalOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRatingSubmit}
            disabled={submittingRating || !ratingValue}
            sx={{ fontWeight: 700 }}
          >
            {submittingRating
              ? 'Saving...'
              : selectedStore?.user_rating
              ? 'Update Rating'
              : 'Submit Rating'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserStores;
