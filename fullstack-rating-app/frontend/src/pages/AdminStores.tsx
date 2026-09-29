import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from '@mui/material';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import StorefrontIcon from '@mui/icons-material/Storefront';
import api from '../services/api.js';
import DataTable, { Column } from '../components/DataTable.tsx';
import SearchBar from '../components/SearchBar.tsx';
import Pagination from '../components/Pagination.tsx';
import ErrorMessage from '../components/ErrorMessage.tsx';
import RatingStars from '../components/RatingStars.tsx';
import Sidebar from '../components/Sidebar.tsx';

interface StoreRecord {
  id: number;
  name: string;
  email: string;
  address: string;
  owner_id?: number | null;
  owner_name?: string | null;
  owner_email?: string | null;
  average_rating: string | number;
  rating_count: number;
  created_at: string;
}

interface OwnerOption {
  id: number;
  name: string;
  email: string;
}

export const AdminStores: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [stores, setStores] = useState<StoreRecord[]>([]);
  const [ownersList, setOwnersList] = useState<OwnerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Add Store Dialog
  const [openAddDialog, setOpenAddDialog] = useState(searchParams.get('action') === 'new');
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: '' as string | number,
  });
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchStores = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page,
        limit: 15,
        sortBy,
        order,
      };

      if (searchTerm.trim()) {
        params.name = searchTerm.trim();
      }

      const res: any = await api.get('/admin/stores', { params });
      if (res.success && res.data) {
        setStores(res.data.stores);
        setTotalPages(res.data.pagination.totalPages || 1);
        setTotalCount(res.data.pagination.total || 0);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  };

  // Fetch owners list for assignment dropdown
  const fetchOwners = async () => {
    try {
      const res: any = await api.get('/admin/users', { params: { role: 'OWNER', limit: 100 } });
      if (res.success && res.data) {
        setOwnersList(res.data.users);
      }
    } catch (err) {
      console.error('Failed to load store owners:', err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [page, sortBy, order]);

  useEffect(() => {
    fetchOwners();
  }, []);

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    setPage(1);
    setLoading(true);
    api.get('/admin/stores', {
      params: {
        page: 1,
        limit: 15,
        name: val.trim() || undefined,
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

  const handleSort = (columnId: string) => {
    if (sortBy === columnId) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnId);
      setOrder('asc');
    }
    setPage(1);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDialogError(null);

    if (!addForm.name.trim()) {
      setDialogError('Store name is required');
      return;
    }

    if (!addForm.email.trim() || !addForm.email.includes('@')) {
      setDialogError('Please provide a valid store email address');
      return;
    }

    if (!addForm.address.trim()) {
      setDialogError('Store physical address is required');
      return;
    }

    if (addForm.address.length > 400) {
      setDialogError('Address cannot exceed 400 characters');
      return;
    }

    setSubmitting(true);
    try {
      const res: any = await api.post('/admin/stores', {
        name: addForm.name.trim(),
        email: addForm.email.trim(),
        address: addForm.address.trim(),
        owner_id: addForm.owner_id ? parseInt(String(addForm.owner_id), 10) : null,
      });

      if (res.success) {
        setOpenAddDialog(false);
        setAddForm({
          name: '',
          email: '',
          address: '',
          owner_id: '',
        });
        fetchStores();
      }
    } catch (err: any) {
      setDialogError(err.message || 'Failed to create store');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<StoreRecord>[] = [
    {
      id: 'name',
      label: 'Store Name',
      sortable: true,
      minWidth: 180,
      render: (s) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {s.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Store #{s.id}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'email',
      label: 'Email',
      sortable: true,
      minWidth: 180,
    },
    {
      id: 'address',
      label: 'Address',
      sortable: true,
      minWidth: 220,
      render: (s) => (
        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 280 }}>
          {s.address}
        </Typography>
      ),
    },
    {
      id: 'average_rating',
      label: 'Average Rating',
      sortable: true,
      align: 'center',
      minWidth: 160,
      render: (s) => (
        <RatingStars
          value={parseFloat(String(s.average_rating))}
          readOnly
          size="small"
          showText
          totalRatings={s.rating_count}
        />
      ),
    },
    {
      id: 'owner',
      label: 'Store Owner',
      minWidth: 160,
      render: (s) =>
        s.owner_name ? (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {s.owner_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {s.owner_email}
            </Typography>
          </Box>
        ) : (
          <Chip label="Unassigned" size="small" variant="outlined" />
        ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Sidebar
          onAddUserClick={() => (window.location.href = '/admin/users?action=new')}
          onAddStoreClick={() => setOpenAddDialog(true)}
        />

        <Box sx={{ flexGrow: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              mb: 3,
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Store Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View and manage registered stores and merchant assignments ({totalCount} total)
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddBusinessIcon />}
              onClick={() => setOpenAddDialog(true)}
              sx={{ fontWeight: 700, px: 2.5 }}
            >
              Add New Store
            </Button>
          </Box>

          <ErrorMessage message={error} onRetry={fetchStores} />

          {/* Search & Sort Controls */}
          <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 8 }}>
                <SearchBar
                  placeholder="Search stores by name, email, or address..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="sort-by-label">Sort By</InputLabel>
                  <Select
                    labelId="sort-by-label"
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setPage(1);
                    }}
                  >
                    <MenuItem value="name">Store Name</MenuItem>
                    <MenuItem value="average_rating">Average Rating</MenuItem>
                    <MenuItem value="created_at">Date Created</MenuItem>
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="address">Address</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="order-label">Order</InputLabel>
                  <Select
                    labelId="order-label"
                    value={order}
                    label="Order"
                    onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
                  >
                    <MenuItem value="desc">Descending</MenuItem>
                    <MenuItem value="asc">Ascending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Stores Table */}
          <DataTable
            columns={columns}
            data={stores}
            loading={loading}
            sortBy={sortBy}
            order={order}
            onSort={handleSort}
            emptyMessage="No stores found matching your query."
          />

          {/* Pagination */}
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalCount}
            limit={15}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </Box>
      </Box>

      {/* Add Store Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Store</DialogTitle>
        <Box component="form" onSubmit={handleAddSubmit}>
          <DialogContent dividers>
            <ErrorMessage message={dialogError} onClose={() => setDialogError(null)} />

            <TextField
              margin="dense"
              required
              fullWidth
              label="Store Name"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="dense"
              required
              fullWidth
              label="Store Contact Email"
              type="email"
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="dense"
              required
              fullWidth
              label="Store Address (Max 400 characters)"
              multiline
              rows={2}
              value={addForm.address}
              onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
              helperText={`${addForm.address.length}/400 characters`}
              error={addForm.address.length > 400}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth margin="dense">
              <InputLabel id="assign-owner-label">Assign Store Owner (Optional)</InputLabel>
              <Select
                labelId="assign-owner-label"
                value={addForm.owner_id}
                label="Assign Store Owner (Optional)"
                onChange={(e) => setAddForm({ ...addForm, owner_id: e.target.value })}
              >
                <MenuItem value="">
                  <em>None (Unassigned)</em>
                </MenuItem>
                {ownersList.map((owner) => (
                  <MenuItem key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpenAddDialog(false)} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ fontWeight: 700 }}
            >
              {submitting ? 'Creating...' : 'Create Store'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
};

export default AdminStores;
