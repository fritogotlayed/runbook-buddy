import { Box, Button, ButtonGroup, Paper, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';

import { useEffect, useState } from "react";
import { removeInstanceById, searchInstances } from "../repos/instances";

export type ItemDeletedCallback = (itemKey: string) => void;
export type ItemViewCallback = (itemKey: string) => void;
export type ItemEditCallback = (itemKey: string) => void;

export interface IDisplayTemplateItem {
  displayName: string,
  itemKey: string,
}
export interface IListInstancesProps {
  showCreateButton?: boolean,
  onCreateButtonClick?: Function,
  onItemViewClick?: ItemViewCallback,
  onItemDeletedClick?: ItemDeletedCallback,
  data: Array<IDisplayTemplateItem>,
}

export default function ListInstances(props: IListInstancesProps) {
  const [instances, setInstances] = useState<Array<string>>();

  const removeInstance = async (key: string) => {
    await removeInstanceById(key);
    setInstances(undefined);
  };

  useEffect(() => {
    const loadData = async () => {
      const data = await searchInstances('');
      setInstances(data);
    }

    if (!instances) {
      loadData();
    }
  }, [instances]);

  const createButton = props.showCreateButton === true ? ( 
    <div>
      <Button variant="contained" onClick={() => props.onCreateButtonClick && props.onCreateButtonClick()}>Create Instance</Button>
    </div>
  ) : '';

  return(
    <Paper style={{ margin: "1em" }}>
      <Box sx={{ padding: "1em"}}>
        <Typography variant='h4'>
          Instances
        </Typography>
        {createButton}
        <TableContainer>
          <Table>
            <TableBody>
              {instances?.map((item) => (
                <TableRow key={item}>
                  <TableCell>
                    {item.replace(/_/g, ' ')}
                  </TableCell>
                  <TableCell width={'1px'}>
                    <ButtonGroup variant="outlined">
                      <Button onClick={() => props.onItemViewClick && props.onItemViewClick(item)}>View</Button>
                      <Button color="error" onClick={() => removeInstance(item)}>Delete</Button>
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