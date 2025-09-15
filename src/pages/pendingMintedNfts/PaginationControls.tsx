// components/shared/PaginationControls.tsx
import React from 'react';
import { Box, Pagination } from '@mui/material';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void;
  sx?: object;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, onPageChange, sx }) => {
  if (totalPages <= 1) return null;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2, ...sx }}>
      <Pagination count={totalPages} page={currentPage} onChange={onPageChange} color="primary" showFirstButton showLastButton />
    </Box>
  );
};

export default PaginationControls;
