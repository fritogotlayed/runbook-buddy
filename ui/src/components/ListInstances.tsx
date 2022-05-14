import { Add, Delete, Visibility } from '@mui/icons-material';
import {
  Box,
  Button,
  ButtonGroup,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';

export type CreateCallback = () => Promise<void> | void;
export type ItemDeletedCallback = (itemKey: string) => Promise<void> | void;
export type ItemViewCallback = (itemKey: string) => Promise<void> | void;
export type ItemEditCallback = (itemKey: string) => Promise<void> | void;

export interface IDisplayTemplateItem {
  displayName: string;
  itemKey: string;
}
export interface IListInstancesProps {
  showCreateButton?: boolean;
  onCreateButtonClick?: CreateCallback;
  onItemViewClick?: ItemViewCallback;
  onItemDeletedClick?: ItemDeletedCallback;
  data: Array<IDisplayTemplateItem>;
}

export default function ListInstances(props: IListInstancesProps) {
  const {
    data,
    showCreateButton,
    onCreateButtonClick,
    onItemDeletedClick,
    onItemViewClick,
  } = props;

  const removeInstance = (key: string) => {
    if (onItemDeletedClick) {
      void onItemDeletedClick(key);
    }
  };

  const createButton =
    showCreateButton === true ? (
      <Box>
        <Button
          variant="contained"
          onClick={() => onCreateButtonClick && void onCreateButtonClick()}
        >
          <Add />
        </Button>
      </Box>
    ) : (
      ''
    );

  return (
    <Paper style={{ margin: '1em' }}>
      <Box sx={{ padding: '1em' }}>
        <Typography variant="h5">Instances</Typography>
        {createButton}
        <TableContainer>
          <Table>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.itemKey}>
                  <TableCell>{item.displayName}</TableCell>
                  <TableCell width={'1px'}>
                    <ButtonGroup variant="outlined">
                      <Button
                        onClick={() =>
                          onItemViewClick && void onItemViewClick(item.itemKey)
                        }
                      >
                        <Visibility />
                      </Button>
                      <Button
                        color="error"
                        onClick={() => removeInstance(item.itemKey)}
                      >
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
