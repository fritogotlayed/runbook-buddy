// import { useNavigate } from 'react-router-dom';
import { useRouter } from 'next/router';
import { ListAlt, NoteAlt } from "@mui/icons-material";
import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Fragment } from "react";

export function NavListItems() {
  const router = useRouter();

  return (
    <Fragment>
      <ListItemButton onClick={() => router.push('/templates')}>
        <ListItemIcon>
          <ListAlt />
        </ListItemIcon>
        <ListItemText primary="Templates" />
      </ListItemButton>
      <ListItemButton onClick={() => router.push('/instances') }>
        <ListItemIcon>
          <NoteAlt />
        </ListItemIcon>
        <ListItemText primary="Instances" />
      </ListItemButton>
    </Fragment>
  )
}