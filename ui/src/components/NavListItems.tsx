import { useNavigate } from 'react-router-dom';
import { ListAlt, NoteAlt } from "@mui/icons-material";
import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Fragment } from "react";

export function NavListItems() {
  const navigate = useNavigate();

  return (
    <Fragment>
      <ListItemButton onClick={() => navigate('templates')}>
        <ListItemIcon>
          <ListAlt />
        </ListItemIcon>
        <ListItemText primary="Templates" />
      </ListItemButton>
      <ListItemButton onClick={() => navigate('instances') }>
        <ListItemIcon>
          <NoteAlt />
        </ListItemIcon>
        <ListItemText primary="Instances" />
      </ListItemButton>
    </Fragment>
  )
}