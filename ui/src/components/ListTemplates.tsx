import { Add, Delete, Edit, Visibility } from '@mui/icons-material';
import { Box, Button, ButtonGroup, Paper, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';

export type ItemDeletedCallback = (itemKey: string) => void;
export type ItemViewCallback = (itemKey: string) => void;
export type ItemEditCallback = (itemKey: string) => void;

export interface IDisplayTemplateItem {
  displayName: string,
  itemKey: string,
}
export interface ListTemplateProps {
  showCreateButton?: boolean,
  onCreateButtonClick?: Function,
  onItemViewClick?: ItemViewCallback,
  onItemEditClick?: ItemEditCallback,
  onItemDeletedClick?: ItemDeletedCallback,
  data: Array<IDisplayTemplateItem>,
}

export default function ListTemplates(props: ListTemplateProps) {
  const removeTemplate = async (key: string) => {
    if (props.onItemDeletedClick) {
      props.onItemDeletedClick(key);
    }
  };

  const createButton = props.showCreateButton === true ? ( 
    <div>
      <Button variant="contained" onClick={() => props.onCreateButtonClick && props.onCreateButtonClick()}><Add /></Button>
    </div>
  ) : '';

  // TODO: Update to be a list with options for view, edit and/or delete
  return(
    <Paper style={{ margin: "1em" }}>
      <Box sx={{ padding: "1em"}}>
        <Typography variant='h5'>
          Templates
        </Typography>
        {createButton}
        <TableContainer>
          <Table>
            <TableBody>
              {props.data.map((item) => (
                <TableRow key={item.itemKey}>
                  <TableCell>
                    {item.displayName}
                  </TableCell>
                  <TableCell width={'1px'}>
                    <ButtonGroup variant="outlined">
                      <Button onClick={() => props.onItemViewClick && props.onItemViewClick(item.itemKey)}>
                        <Visibility />
                      </Button>
                      <Button onClick={() => props.onItemEditClick && props.onItemEditClick(item.itemKey)}>
                        <Edit />
                      </Button>
                      <Button color="error" onClick={() => removeTemplate(item.itemKey)}>
                        <Delete />
                      </Button>
                    </ButtonGroup>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
}