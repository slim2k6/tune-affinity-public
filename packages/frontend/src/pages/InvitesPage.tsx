import { Box } from '@mui/material'
import * as React from 'react';
import BigButton from '../components/BigButton';
import TopNavigation from '../components/TopNavigation';
import InvitesList from '../components/InvitesList';
import { getApiUrl } from '../config';

const invitesUrl = getApiUrl() + "/invites";

function InvitesPage() {

  const [error, setError] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [data, setData] = React.useState([]);

  const [isCreateInviteLoaded, setIsCreateInviteLoaded] = React.useState(true);
  const [createInviteError, setCreateInviteError] = React.useState(null);

  React.useEffect(() => {
    fetch(invitesUrl, { credentials: "include" })
      .then(res => res.json())
      .then(
        (result) => {
          setIsLoaded(true);
          setData(result.data);
        },
        (err) => {
          setIsLoaded(true);
          setError(err);
        }
      )
  }, [])

  return (
    <Box>
      <TopNavigation title="Invites" />
      <Box sx={{ padding: '0px 10px' }}>
        <InvitesList invites={data} error={error ? true : false} isLoaded={isLoaded} />
      </Box>
      <Box sx={{
        display: 'flex',
        flexFlow: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '10px',
      }}
      >
        <BigButton text="Create invite link" disabled={!isCreateInviteLoaded} onClick={() => {

          setIsCreateInviteLoaded(false);

          fetch(invitesUrl, {
            method: 'POST',
            credentials: "include",
          })
            .then(res => res.json())
            .then(
              (result) => {
                setIsCreateInviteLoaded(true);

                if (result && result.data && typeof result.data === 'string') {
                  const updatedData = data.concat(result.data);
                  setData(updatedData);
                }
              },
              (err) => {
                setIsCreateInviteLoaded(true);
                setCreateInviteError(err);
              }
            )
        }} />
      </Box>
    </Box >
  );
}

export default InvitesPage;
