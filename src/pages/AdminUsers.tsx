import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom';
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import api from '../services/api.js';
import DataTable, { Column } from '../components/DataTable.tsx';
import SearchBar from '../components/SearchBar.tsx';
import Pagination from '../components/Pagination.tsx';
import ErrorMessage from '../components/ErrorMessage.tsx';
import Sidebar from '../components/Sidebar.tsx';
import RatingStars from '../components/RatingStars.tsx';

interface UserRecord {
  id: number;
  name: string;
  email: string;
  address: string;
  role: 'ADMIN' | 'USER' | 'OWNER';
  created_at: string;
  store_id?: number;
  store_name?: string;
  owner_store_rating?: number | string | null;
  owner_store_rating_count?: number | null;
}

export const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || 'ALL');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Add User Dialog
  const [openAddDialog, setOpenAddDialog] = useState(searchParams.get('action') === 'new');
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'USER' as 'USER' | 'ADMIN' | 'OWNER',
  });
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
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

      if (selectedRole !== 'ALL') {
        params.role = selectedRole;
      }

      const res: any = await api.get('/admin/users', { params });
      if (res.success && res.data) {
        setUsers(res.data.users);
        setTotalPages(res.data.pagination.totalPages || 1);
        setTotalCount(res.data.pagination.total || 0);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, sortBy, order, selectedRole]);

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    setPage(1);
    // fetch with new search
    setLoading(true);
    api.get('/admin/users', {
      params: {
        page: 1,
        limit: 15,
        name: val.trim() || undefined,
        role: selectedRole !== 'ALL' ? selectedRole : undefined,
        sortBy,
        order,
      },
    })
      .then((res: any) => {
        if (res.success && res.data) {
          setUsers(res.data.users);
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

    if (addForm.name.length < 20 || addForm.name.length > 60) {
      setDialogError('Name must be between 20 and 60 characters');
      return;
    }

    if (addForm.address.length > 400) {
      setDialogError('Address cannot exceed 400 characters');
      return;
    }

    if (addForm.password.length < 8 || addForm.password.length > 16) {
      setDialogError('Password must be between 8 and 16 characters');
      return;
    }

    if (!/[A-Z]/.test(addForm.password)) {
      setDialogError('Password must contain at least one uppercase letter');
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(addForm.password)) {
      setDialogError('Password must contain at least one special character');
      return;
    }

    setSubmitting(true);
    try {
      const res: any = await api.post('/admin/users', {
        name: addForm.name.trim(),
        email: addForm.email.trim(),
        address: addForm.address.trim() || undefined,
        password: addForm.password,
        role: addForm.role,
      });

      if (res.success) {
        setOpenAddDialog(false);
        setAddForm({
          name: '',
          email: '',
          address: '',
          password: '',
          role: 'USER',
        });
        fetchUsers();
      }
    } catch (err: any) {
      setDialogError(err.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<UserRecord>[] = [
    {
      id: 'name',
      label: 'Name',
      sortable: true,
      minWidth: 180,
      render: (u) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {u.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ID: #{u.id}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'email',
      label: 'Email',
      sortable: true,
      minWidth: 200,
    },
    {
      id: 'address',
      label: 'Address',
      sortable: true,
      minWidth: 220,
      render: (u) => (
        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 280 }}>
          {u.address || '—'}
        </Typography>
      ),
    },
    {
      id: 'role',
      label: 'Role',
      sortable: true,
      align: 'center',
      render: (u) => (
        <Chip
          label={u.role}
          size="small"
          color={
            u.role === 'ADMIN'
              ? 'error'
              : u.role === 'OWNER'
              ? 'primary'
              : 'success'
          }
          sx={{ fontWeight: 700 }}
        />
      ),
    },
    {
      id: 'store_rating',
      label: 'Store Rating (Owner)',
      align: 'center',
      minWidth: 160,
      render: (u) => {
        if (u.role !== 'OWNER') {
          return <Typography variant="caption" color="text.disabled">N/A</Typography>;
        }
        if (u.owner_store_rating !== null && u.owner_store_rating !== undefined) {
          const ratingVal = parseFloat(String(u.owner_store_rating));
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <RatingStars value={ratingVal} readOnly size="small" showText totalRatings={u.owner_store_rating_count || 0} />
              {u.store_name && (
                <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 140 }}>
                  {u.store_name}
                </Typography>
              )}
            </Box>
          );
        }
        return <Typography variant="caption" color="text.secondary">No store assigned</Typography>;
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (u) => (
        <Tooltip title="View User Details">
          <IconButton
            component={RouterLink}
            to={`/admin/users/${u.id}`}
            size="small"
            color="primary"
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Sidebar
          onAddUserClick={() => setOpenAddDialog(true)}
          onAddStoreClick={() => navigate('/admin/stores?action=new')}
        />

        <Box sx={{ flexGrow: 1 }}>
          {/* Header */}
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
                User Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage registered users, administrators, and store owners ({totalCount} total)
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={() => setOpenAddDialog(true)}
              sx={{ fontWeight: 700, px: 2.5 }}
            >
              Add New User
            </Button>
          </Box>

          <ErrorMessage message={error} onRetry={fetchUsers} />

          {/* Search & Filter Bar */}
          <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 6, lg: 7 }}>
                <SearchBar
                  placeholder="Search users by name, email, or address..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="role-filter-label">Filter by Role</InputLabel>
                  <Select
                    labelId="role-filter-label"
                    value={selectedRole}
                    label="Filter by Role"
                    onChange={(e) => {
                      setSelectedRole(e.target.value);
                      setPage(1);
                    }}
                  >
                    <MenuItem value="ALL">All Roles</MenuItem>
                    <MenuItem value="USER">Normal Users (USER)</MenuItem>
                    <MenuItem value="OWNER">Store Owners (OWNER)</MenuItem>
                    <MenuItem value="ADMIN">Administrators (ADMIN)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="sort-order-label">Sort Order</InputLabel>
                  <Select
                    labelId="sort-order-label"
                    value={order}
                    label="Sort Order"
                    onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
                  >
                    <MenuItem value="desc">Descending</MenuItem>
                    <MenuItem value="asc">Ascending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Table */}
          <DataTable
            columns={columns}
            data={users}
            loading={loading}
            sortBy={sortBy}
            order={order}
            onSort={handleSort}
            emptyMessage="No users found matching your search and filter criteria."
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

      {/* Add User Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Add New User</DialogTitle>
        <Box component="form" onSubmit={handleAddSubmit}>
          <DialogContent dividers>
            <ErrorMessage message={dialogError} onClose={() => setDialogError(null)} />

            <TextField
              margin="dense"
              required
              fullWidth
              label="Full Name (20 to 60 characters)"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              helperText={`${addForm.name.length}/60 chars (Min 20 required)`}
              error={addForm.name.length > 0 && (addForm.name.length < 20 || addForm.name.length > 60)}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="dense"
              required
              fullWidth
              label="Email Address"
              type="email"
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel id="add-role-label">Role</InputLabel>
              <Select
                labelId="add-role-label"
                value={addForm.role}
                label="Role"
                onChange={(e) => setAddForm({ ...addForm, role: e.target.value as any })}
              >
                <MenuItem value="USER">Normal User (USER)</MenuItem>
                <MenuItem value="ADMIN">Administrator (ADMIN)</MenuItem>
                <MenuItem value="OWNER">Store Owner (OWNER)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              margin="dense"
              fullWidth
              label="Address (Max 400 characters)"
              multiline
              rows={2}
              value={addForm.address}
              onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
              helperText={`${addForm.address.length}/400 characters`}
              error={addForm.address.length > 400}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="dense"
              required
              fullWidth
              label="Password (8-16 chars, 1 uppercase, 1 special character)"
              type="password"
              value={addForm.password}
              onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
              helperText="E.g., User@123 or Admin@123"
            />
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
              {submitting ? 'Creating...' : 'Create User'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
};

export default AdminUsers;
