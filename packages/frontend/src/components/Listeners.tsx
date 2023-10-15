import { Avatar, AvatarGroup } from '@mui/material'
import React from 'react';

enum ListenerRank {
  None,
  Playlist,
  Short,
  Medium,
  Long
}

function listenersFunc(x: number) {
  return [
    {
      username: "Nicklas",
      rank: (x + 1) % 5,
      src: "/static/images/avatar/3.jpg"
    },
    {
      username: "Johan",
      rank: (x + 2) % 5,
      src: "/static/images/avatar/3.jpg"
    },
    {
      username: "Erik",
      rank: (x + 3) % 5,
      src: "/static/images/avatar/3.jpg"
    }
  ]
}

function color(rank: number) {
  if (rank === ListenerRank.None) {
    return 'white';
  } else if (rank === ListenerRank.Playlist) {
    return 'yellow';
  } else if (rank === ListenerRank.Short) {
    return 'blue';
  } else if (rank === ListenerRank.Medium) {
    return 'green';
  } else if (rank === ListenerRank.Long) {
    return 'red';
  }
}

interface IListeners {
  score: number;
}

function Listeners(props: IListeners) {
  const listeners = listenersFunc(props.score);

  return (
    <AvatarGroup max={5}>
      {
        listeners
          .filter(listener => listener.rank > 0)
          .sort((a, b) => a.rank - b.rank)
          .map(listener => {
            return (
              <Avatar key={listener.username} alt={listener.username} src={listener.username} sx={{ width: 20, height: 20, bgcolor: color(listener.rank) }} />
            )
          })
      }
    </AvatarGroup>
  );
}

export default Listeners;
