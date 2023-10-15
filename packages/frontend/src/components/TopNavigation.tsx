import * as React from 'react';
import { Box, Typography, Divider, AppBar, Toolbar, IconButton, Menu, MenuItem } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config';


function TopNavigation(prop: { title: string }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <AppBar position="static" color="transparent" >
        <Toolbar >
          <Typography variant="h2" component="div" sx={{ flexGrow: 1 }}>
            {prop.title}
          </Typography>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            aria-controls={open ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
          >
            <MenuIcon color="primary" fontSize="large" />
          </IconButton>
        </Toolbar>
        <Divider variant="middle" />
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem onClick={() => {
            handleClose();
            navigate("../friends");
          }}>Friends</MenuItem>
          <MenuItem onClick={() => {
            handleClose();
            navigate("../invites");
          }}>Invites</MenuItem>
          <MenuItem onClick={() => {
            handleClose();
            let logoutUrl = getApiUrl() + "/auth/logout";
            window.location.replace(logoutUrl);
          }}>Logout</MenuItem>
        </Menu>
      </AppBar>
    </Box>
  );
}

export default TopNavigation;