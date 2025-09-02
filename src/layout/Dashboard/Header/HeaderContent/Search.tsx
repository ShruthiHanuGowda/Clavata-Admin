// material-ui
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';

// assets
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import { ChangeEvent, ContextType as ReactContextType, useContext } from 'react';
import { Context } from 'App';

// ==============================|| HEADER CONTENT - SEARCH ||============================== //

interface SearchProps {
  onSearch: (term: string) => void;
}

export default function Search({ onSearch }: SearchProps) {
  const context = useContext<ReactContextType<typeof Context> | undefined>(Context);
  const searchTerm = context?.searchTerm || '';
  const setSearchTerm = context?.setSearchTerm;

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm?.(value);
    onSearch(value);
  };

  return (
    <Box sx={{ width: '100%', ml: { xs: 0, md: 1 } }}>
      <FormControl sx={{ width: { xs: '100%', md: 224 } }}>
        <OutlinedInput
          size="small"
          id="header-search"
          value={searchTerm}
          onChange={handleSearchChange}
          startAdornment={
            <InputAdornment position="start" sx={{ mr: -0.5 }}>
              <SearchOutlined />
            </InputAdornment>
          }
          aria-describedby="header-search-text"
          inputProps={{
            'aria-label': 'weight'
          }}
          placeholder="Search..."
        />
      </FormControl>
    </Box>
  );
}
