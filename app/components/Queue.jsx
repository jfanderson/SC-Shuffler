import React from 'react';
import PropTypes from 'prop-types';

const QUEUE_LENGTH = 20;

const Queue = ({ songs }) => {
  songs = songs.slice(0, QUEUE_LENGTH);

  return (
    <div>
      <h3>Queue</h3>
      <ol>
        {songs.map(song => (
          <li key={song.title}>{song.user.username} - {song.title}</li>
        ))}
      </ol>
    </div>
  );
};

Queue.propTypes = {
  songs: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Queue;
