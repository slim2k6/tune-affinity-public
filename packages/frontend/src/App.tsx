// import React from 'react';
import { Container, createTheme, ThemeProvider, CssBaseline, } from '@mui/material'
import React, { FC } from 'react';

import LoginPage from './pages/LoginPage'
import { Route, Routes } from 'react-router';
import FriendsPage from './pages/FriendsPage';
import ComparisonPage from './pages/ComparisonPage';
import InvitesPage from './pages/InvitesPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#06b500',
      contrastText: '#e0e0e0',
    },
    secondary: {
      main: '#9836f4', // purple
      contrastText: '#b59a00', // yellow
    },
    text: {
      primary: '#e0e0e0'
    },
    divider: '#878787',
    mode: 'dark'
  },
  typography: {
    body1: {
      fontWeight: 600,
      fontSize: 14
    },
    h2: {
      fontWeight: 600,
      fontSize: 28
    },
    h4: {
      fontWeight: 400,
      fontSize: 18
    }
  },
  components: {
    MuiListItem: {
      defaultProps: {
        sx: {
          fontSize: 16,
          fontWeight: 900,
          gap: "10px",
        }
      }
    },
    MuiListItemAvatar: {
      defaultProps: {
        sx: {
          minWidth: 0
        }
      }
    },
    MuiAvatar: {
      defaultProps: {
        sx: {
          width: 24,
          height: 24
        }
      }
    },
    MuiListItemIcon: {
      defaultProps: {
        sx: {
          minWidth: 0
        }
      }
    }
  }
});

function App() {
  return (
    <React.Fragment>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container disableGutters>
          <Routes>
            <Route path="/" element={<LoginPage />}></Route>
            <Route path="/login" element={<LoginPage />}></Route>
            <Route path="/friends/" element={<FriendsPage />}></Route>
            <Route path="/friends/:id/comparison" element={<ComparisonPage />}></Route>
            <Route path="/invites" element={<InvitesPage />}></Route>
          </Routes>
        </Container>
      </ThemeProvider>
    </React.Fragment>
  );
}

export default App;