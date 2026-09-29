import React from 'react';
import { Rating, Box, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

interface RatingStarsProps {
  value: number;
  onChange?: (newValue: number | null) => void;
  readOnly?: boolean;
  size?: 'small' | 'medium' | 'large';
  precision?: number;
  showText?: boolean;
  totalRatings?: number;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  value,
  onChange,
  readOnly = false,
  size = 'medium',
  precision = 0.5,
  showText = false,
  totalRatings,
}) => {
  const numValue = Number(value) || 0;

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
      <Rating
        value={numValue}
        onChange={(_, val) => onChange && onChange(val)}
        readOnly={readOnly}
        size={size}
        precision={readOnly ? precision : 1}
        emptyIcon={<StarIcon style={{ opacity: 0.35 }} fontSize="inherit" />}
      />
      {showText && (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          {numValue > 0 ? numValue.toFixed(1) : 'No ratings'}
          {typeof totalRatings === 'number' && ` (${totalRatings})`}
        </Typography>
      )}
    </Box>
  );
};

export default RatingStars;
