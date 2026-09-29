import React from 'react';
import { Box, Pagination as MuiPagination, Typography } from '@mui/material';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems?: number;
  limit?: number;
  onPageChange: (newPage: number) => void;
  size?: 'small' | 'medium' | 'large';
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  totalItems,
  limit = 20,
  onPageChange,
  size = 'medium',
}) => {
  if (totalPages <= 1 && (!totalItems || totalItems <= limit)) {
    return null;
  }

  const start = (page - 1) * limit + 1;
  const end = totalItems ? Math.min(page * limit, totalItems) : page * limit;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        mt: 3,
        py: 1,
      }}
    >
      {totalItems !== undefined ? (
        <Typography variant="body2" color="text.secondary">
          Showing <strong>{start}</strong> - <strong>{end}</strong> of <strong>{totalItems}</strong> entries
        </Typography>
      ) : (
        <Box />
      )}
      <MuiPagination
        count={totalPages}
        page={page}
        onChange={(_, val) => onPageChange(val)}
        color="primary"
        shape="rounded"
        size={size}
        showFirstButton
        showLastButton
      />
    </Box>
  );
};

export default Pagination;
