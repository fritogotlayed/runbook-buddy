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
  Toolbar,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { searchTemplates } from '../repos/templates';

export type ITemplateSelectedCallback = (
  templateId: string,
) => Promise<void> | void;

export interface ISelectTemplateProps {
  onTemplateSelected: ITemplateSelectedCallback;
}

export default function SelectTemplates(props: ISelectTemplateProps) {
  const [templates, setTemplates] = useState<Array<string>>();
  const { onTemplateSelected } = props;

  useEffect(() => {
    const loadData = async () => {
      const data = await searchTemplates();
      setTemplates(data);
    };

    if (!templates) {
      void loadData();
    }
  }, [templates]);

  return (
    <Paper style={{ margin: '1em' }}>
      <Box sx={{ padding: '1em' }}>
        <Toolbar>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h5" component="div">
            Select a template to proceed
          </Typography>
        </Toolbar>
        <TableContainer>
          <Table>
            <TableBody>
              {templates?.map((item) => (
                <TableRow key={item}>
                  <TableCell>{item.replace(/_/g, ' ')}</TableCell>
                  <TableCell width={'1px'}>
                    <ButtonGroup variant="outlined">
                      <Button
                        onClick={() =>
                          onTemplateSelected && void onTemplateSelected(item)
                        }
                      >
                        Select
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
