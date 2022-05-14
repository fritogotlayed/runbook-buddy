import { Search, SearchOff } from '@mui/icons-material';
import {
  ButtonGroup,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
} from '@mui/material';
import { useState } from 'react';

export type SearchCallback = (term?: string) => void;

interface ISearchInputProps {
  showClearButton?: boolean;
  onSearchTermUpdated?: SearchCallback;
}

export default function SearchInput(props: ISearchInputProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const clearSearch = () => {
    setSearchTerm('');
    if (props.onSearchTermUpdated) {
      props.onSearchTermUpdated(undefined);
    }
  };

  const searchKeyDown = (key: string) => {
    if (key === 'Enter' && props.onSearchTermUpdated) {
      props.onSearchTermUpdated(searchTerm);
    }
  };

  return (
    <FormControl sx={{ m: 1 }} variant="outlined" fullWidth>
      <InputLabel htmlFor="outlined-adornment-password">Search</InputLabel>
      <Input
        id="outlined-adornment-password"
        value={searchTerm}
        name="Search"
        onChange={(event) => setSearchTerm(event.target.value)}
        onKeyDown={(event) => searchKeyDown(event.key)}
        endAdornment={
          <InputAdornment position="end">
            <ButtonGroup>
              <IconButton edge="end" onClick={() => searchKeyDown('Enter')}>
                <Search />
              </IconButton>
              {props.showClearButton ? (
                <IconButton edge="end" onClick={clearSearch}>
                  <SearchOff />
                </IconButton>
              ) : undefined}
            </ButtonGroup>
          </InputAdornment>
        }
      />
    </FormControl>
  );
}
