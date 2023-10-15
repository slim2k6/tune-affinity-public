import music from '../music_wide.jpg';
import * as React from 'react';
import { Box, styled, Typography } from '@mui/material'
import { useLocation } from "react-router-dom";
import BigButton from '../components/BigButton';
import { getApiUrl } from '../config';

const MusicImg = styled('img')({
  width: '100%',
  maskImage: 'linear-gradient(to top, transparent, 45%, black );'
});

function LoginPage() {
  const [isRedirectLoading, setIsRedirectLoading] = React.useState(false);
  const location = useLocation();
  const inviteCode = new URLSearchParams(location.search).get("invite-code");

  return (
    <>
      <MusicImg src={music} />
      <Typography variant="h3" component="h1" fontWeight={900} align='center' gutterBottom={true}>
        Tune Affinity
      </Typography>
      <Typography
        variant="h6"
        component="h3"
        fontWeight={300}
        align='center'
        gutterBottom={true}
        sx={{ paddingLeft: '10%', paddingRight: '10%' }} >
        Compare your music taste with your friends
      </Typography>
      <Box sx={{
        display: 'flex',
        flexFlow: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        paddingTop: '100px',
      }}
      >
        <BigButton
          type="submit"
          text="Login with Spotify"
          disabled={isRedirectLoading}
          onClick={() => {
            setIsRedirectLoading(true);
            let redirectUrl = getApiUrl() + "/auth/spotify/login";
            if (inviteCode) {
              redirectUrl += "?invite-code=" + encodeURIComponent(inviteCode);
            }
            window.location.replace(redirectUrl);
          }}
        />
      </Box>
    </>
  );
}

export default LoginPage;
