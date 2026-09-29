import React from 'react';
import { Alert, AlertTitle, Box, Button } from '@mui/material';

interface ErrorMessageProps {
  title?: string;
  message: string | null;
  onRetry?: () => void;
  onClose?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  onRetry,
  onClose,
}) => {
  if (!message) return null;

  return (
    <Box sx={{ my: 2, width: '100%' }}>
      <Alert
        severity="error"
        onClose={onClose}
        action={
          onRetry ? (
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          ) : undefined
        }
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Box>
  );
};

export default ErrorMessage;
