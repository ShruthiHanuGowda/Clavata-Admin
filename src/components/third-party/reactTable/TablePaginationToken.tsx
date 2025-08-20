import { useState } from 'react';

// material-ui
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
// import { TableState, Updater } from '@tanstack/react-table';
import { Button } from '@mui/material';

interface TablePaginationProps {
  currentPageIndex: number;
  setPageSize: (size: number) => void;
  handlePagination: (direction: 'next' | 'previous' | 'first') => Promise<void>;
  pageSize: number;
  nextToken?: string | null;
  previousTokens: string[];
  isLoading: boolean;
}

// ==============================|| TABLE PAGINATION ||============================== //

export default function TablePagination({
  handlePagination,
  setPageSize,
  pageSize,
  nextToken,
  previousTokens,
  currentPageIndex,
  isLoading
}: TablePaginationProps) {
  // const [currentPageIndex, setCurrentPageIndex] = useState(getState().pagination.pageIndex);

  const [open, setOpen] = useState(false);
  const options: number[] = [10, 25, 50, 100];

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleChange = (event: SelectChangeEvent<number>) => {
    setPageSize(Number(event.target.value));
  };

  const handleFirstPage = () => {
    handlePagination('first');
  };

  const handlePreviousPage = () => {
    handlePagination('previous');
  };

  const handleNextPage = () => {
    handlePagination('next');
  };

  return (
    <Grid spacing={1} container alignItems="center" justifyContent="space-between" sx={{ width: 'auto' }}>
      <Grid item>
        <Stack direction="row" spacing={1} alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" color="secondary">
              Row per page
            </Typography>
            <FormControl sx={{ m: 1 }}>
              <Select
                id="demo-controlled-open-select"
                open={open}
                onClose={handleClose}
                onOpen={handleOpen}
                value={pageSize}
                onChange={handleChange}
                size="small"
                sx={{ '& .MuiSelect-select': { py: 0.75, px: 1.25 } }}
              >
                {options.map((option: number) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </Grid>

      <Grid item>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button variant="outlined" color="primary" onClick={handleFirstPage} disabled={currentPageIndex === 1 || isLoading}>
            First Page
          </Button>

          <Button variant="outlined" color="primary" onClick={handlePreviousPage} disabled={currentPageIndex === 1 || isLoading}>
            Previous
          </Button>

          <Typography variant="body2" color="textSecondary">
            {`Page ${currentPageIndex}`}
          </Typography>

          <Button variant="outlined" color="primary" onClick={handleNextPage} disabled={nextToken === null || isLoading}>
            Next
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}
