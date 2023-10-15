import { List, ListItem, ListItemText, ListItemIcon, IconButton } from '@mui/material'
import React, { FC } from 'react';
import { ContentCopy } from '@mui/icons-material';

interface IInvitesListProps {
  invites: string[];
  isLoaded: boolean;
  error?: boolean;
}

export const InvitesList: FC<IInvitesListProps> = ({
  invites,
  isLoaded,
  error,
}) => {
  if (error) {
    return <div>Error: Fel</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <List>
        {
          invites.map(invite => {
            return (
              <ListItem key={invite}>
                <ListItemText primary={invite} />
                <ListItemIcon>
                  <IconButton
                    onClick={(event: any) => {
                        const link = `${window.location.origin}/?invite-code=${invite}`;
                        navigator.clipboard.writeText(link); }}>
                    <ContentCopy color="primary" fontSize="inherit" />
                  </IconButton>
                </ListItemIcon>
              </ListItem >
            )
          })
        }
      </List>
    );
  }
}

export default InvitesList;
