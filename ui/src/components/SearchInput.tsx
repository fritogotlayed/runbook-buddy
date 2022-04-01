import { Search, SearchOff } from "@mui/icons-material";
import { ButtonGroup, FormControl, IconButton, Input, InputAdornment, InputLabel } from "@mui/material";
import { useState } from "react";

export type SearchCallback = (term?: string) => void;

interface ISearchInputProps {
  showClearButton?: boolean,
  onSearchTermUpdated?: SearchCallback,
};

export default function SearchInput(props: ISearchInputProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const clearSearch = () => {
    setSearchTerm('');
    if (props.onSearchTermUpdated) {
      props.onSearchTermUpdated(undefined);
    }
  };
  
  return (
    <FormControl sx={{ m: 1 }} variant="outlined" fullWidth >
      <InputLabel htmlFor="outlined-adornment-password">Search</InputLabel>
      <Input
        id="outlined-adornment-password"
        value={searchTerm}
        name="Search"
        onChange={(event) => setSearchTerm(event.target.value)}
        endAdornment={
          <InputAdornment position="end">
            <ButtonGroup>
              <IconButton edge="end" onClick={() => props.onSearchTermUpdated && props.onSearchTermUpdated(searchTerm)}>
                <Search />
              </IconButton>
              {props.showClearButton || true ? (
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
