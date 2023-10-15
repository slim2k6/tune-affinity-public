import { Box } from '@mui/material'
import * as React from 'react';
import BigButton from '../components/BigButton';
import TopNavigation from '../components/TopNavigation';
import { useNavigate } from "react-router-dom";
import FriendsList from '../components/FriendsList';
import { getApiUrl } from '../config';

const friendsUrl = getApiUrl() + "/friends";

function FriendsPage() {
  const navigate = useNavigate();

  const [error, setError] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    fetch(friendsUrl, { credentials: "include" })
      .then(res => res.json())
      .then(
        (result) => {
          setIsLoaded(true);
          setData(result.data);
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      )
  }, [])

  if (error) {
    return <div>Error: Fel</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <Box>
        <TopNavigation title="Friends" />
        <Box sx={{ padding: '0px 10px' }}>
          <FriendsList friends={data} error={error ? true : false} isLoaded={isLoaded} />
        </Box>
        <Box sx={{
          display: 'flex',
          flexFlow: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: '10px',
        }}
        >
          <BigButton text="Add new friend" onClick={() => {
            navigate("../invites");
          }} />
        </Box>
      </Box >
    );
  }
}

export default FriendsPage;
