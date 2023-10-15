import { List, ListItem, ListItemAvatar, Avatar, ListItemButton, ListItemText, ListItemIcon } from '@mui/material'
import React, { FC } from 'react';
import { ArrowForwardIos } from '@mui/icons-material';
import { Link } from "react-router-dom";
import { Friend } from '../types';

interface IFriendsListProps {
  friends: Friend[];
  isLoaded: boolean;
  error?: boolean;
}

export const FriendsList: FC<IFriendsListProps> = ({
  friends,
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
          friends.map(friend => {
            return (
              <ListItem key={friend.id}>
                <ListItemAvatar>
                  <Avatar alt={friend.name} src={''} />
                </ListItemAvatar>
                <ListItemText primary={friend.name} />
                <Link to={'/friends/' + friend.id + '/comparison'}>
                  <ListItemButton
                    sx={{ flexGrow: 0 }}
                  >
                    <ListItemIcon>
                      <ArrowForwardIos color="primary" fontSize="inherit" />
                    </ListItemIcon>
                  </ListItemButton>
                </Link>
              </ListItem >
            )
          })
        }
      </List>
    );
  }
}

export default FriendsList;
