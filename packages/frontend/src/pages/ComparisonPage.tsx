import { Typography, Box, Avatar, Grid, Chip, Divider, AvatarGroup } from '@mui/material'
import TopNavigation from '../components/TopNavigation';
import { useParams } from 'react-router-dom';
import React from 'react';
import { Artist, Comparison, ComparisonResponse } from '../types';
import { getApiUrl } from '../config';

function remapJson(input: Comparison): Artist[] {
  const artists: Record<string, Artist> = {};

  for (const trackId in input.sharedTracksByUser) {
      const track = input.sharedTracksByUser[trackId];
      
      for (const artist of track.artists) {
          if (!artists.hasOwnProperty(artist.id)) {
              artists[artist.id] = {
                  id: artist.id,
                  name: input.artistInfo[artist.id].name,
                  image: input.artistInfo[artist.id].image,
                  sharedTracks: []
              };
          }
          
          const sharedBy: string[] = [];
          for (const user in input.sharedTracksInfo[trackId]) {
              sharedBy.push(user);
          }
          artists[artist.id].sharedTracks.push({ id: trackId, name: track.name, sharedBy: sharedBy });
      }
  }
  
  const output: Artist[] = Object.values(artists);
  
  output.sort((a, b) => b.sharedTracks.length - a.sharedTracks.length);
  
  return output;
}

function ComparisonPage() {
  let { id } = useParams();
  id = id || "";

  if (!id) {
    return (<h1>Error, no user selected</h1>);
  }

  const [error, setError] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [data, setData] = React.useState<ComparisonResponse>({
    message: "",
    data: null
  });

  const comparisonUrl = getApiUrl() + "/comparisons/" + id;
  React.useEffect(() => {
    fetch(comparisonUrl, { credentials: "include" })
      .then(res => res.json())
      .then(
        (result) => {
          setIsLoaded(true);
          setData(result);
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      )
  }, []);

  if (error) {
    return (<h1>Error</h1>);
  }

  return (
    <Box>
      <TopNavigation title={"Comparison with " + id} />
      <Box sx={{ padding: '0px 20px' }}>
        {
          !isLoaded && (
            <Box key="test" sx={{ padding: '15px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <Typography>Loading...</Typography>
          </Box>
          )
        }
        {
          isLoaded && 
          data.message && (
            <Box key="test" sx={{ padding: '15px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <Typography>{data.message}</Typography>
          </Box>
          )
        }
        {
          isLoaded && 
          data.data &&
          remapJson(data.data).map(artist => {
            return (
              <Box sx={{ padding: '10px 0px' }} key={artist.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', columnGap: '20px', padding: '10px 0px' }}>
                  <Avatar
                    alt={artist.name}
                    src={artist.image}
                    variant="square"
                    sx={{ width: 56, height: 56 }}
                  />
                  <Typography variant="h4">{artist.name}</Typography>
                </Box>
                <Grid container spacing={2} sx={{ paddingBottom: '20px' }} >
                  <Grid item xs={6}>
                    <Typography>Songs</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>Shared: {artist.sharedTracks.length}</Typography>
                  </Grid>
                  {
                    artist.sharedTracks.map(track => {
                      return (
                        <React.Fragment key={track.id}>
                          <Grid item xs={9}>
                            <Typography>{track.name}</Typography>
                          </Grid>
                        </React.Fragment>
                      )
                    })
                  }
                </Grid>
                <Divider />
              </Box>
            )
          })
        }
      </Box>
      <Box sx={{
        display: 'flex',
        flexFlow: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '10px',
      }}
      >

      </Box>
    </Box >
  );
}

export default ComparisonPage;
