import React from 'react';
import { Box, Button, Grid, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';

interface SearchControlsProps {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  disabled: boolean;
  filteredCount: number;
  totalCount: number;
  initialCount: number;
}

const SearchControls: React.FC<SearchControlsProps> = ({
  searchTerm,
  onSearchChange,
  onClearSearch,
  onExpandAll,
  onCollapseAll,
  disabled,
  filteredCount,
  totalCount,
  initialCount
}) => (
  <Box>
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} md={8}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by asset ID, contract address, wallet, or type..."
          value={searchTerm}
          onChange={onSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={onClearSearch} size="small">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button variant="outlined" size="small" onClick={onExpandAll} disabled={disabled}>
            Expand All
          </Button>
          <Button variant="outlined" size="small" onClick={onCollapseAll} disabled={disabled}>
            Collapse All
          </Button>
        </Stack>
      </Grid>
    </Grid>

    {/* Result Summary */}
    <Box mt={2}>
      <Typography variant="body2" color="text.secondary">
        Showing {filteredCount} of {totalCount} pending asset groups
        {searchTerm && ` (filtered from ${initialCount} total)`}
      </Typography>
    </Box>
  </Box>
);

export default SearchControls;
