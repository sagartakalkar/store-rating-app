import React, { useState, useEffect } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  size?: 'small' | 'medium';
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value,
  onChange,
  onSearch,
  debounceMs = 300,
  size = 'small',
}) => {
  const [innerValue, setInnerValue] = useState(value);

  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (innerValue !== value) {
        onChange(innerValue);
        if (onSearch) onSearch(innerValue);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [innerValue, debounceMs]);

  const handleClear = () => {
    setInnerValue('');
    onChange('');
    if (onSearch) onSearch('');
  };

  return (
    <TextField
      fullWidth
      size={size}
      variant="outlined"
      placeholder={placeholder}
      value={innerValue}
      onChange={(e) => setInnerValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onSearch) {
          onSearch(innerValue);
        }
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: innerValue ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClear} edge="end">
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        }
      }}
    />
  );
};

export default SearchBar;
