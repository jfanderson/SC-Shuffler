import React from 'react';
import 'whatwg-fetch';
import Queue from './Queue.jsx';

function shuffle(array) {
  for (let i = array.length; i; i--) {
    let j = Math.floor(Math.random() * i);
    [array[i - 1], array[j]] = [array[j], array[i - 1]];
  }
}

class App extends React.Component {
  constructor() {
    super();

    this._onLoginClick = this._onLoginClick.bind(this);
    this._playNextTrack = this._playNextTrack.bind(this);
    this._playPreviousTrack = this._playPreviousTrack.bind(this);
    this._widget = null;

    this.state = {
      // Track currently being played.
      currentTrack: null,

      // Array of songs queued up to play next.
      queue: null,

      // Array of previously played songs.
      history: [],

      // Is the user logged in?
      loggedIn: false,

      // HTML string for SoundCloud Widget player.
      player: null,
    };
  }

  render() {
    let { loggedIn, player, queue } = this.state;

    if (!loggedIn) {
      return (
        <div>
          <div>Hello</div>
          <img
            src="http://connect.soundcloud.com/2/btn-connect-l.png"
            onClick={this._onLoginClick}
          />
        </div>
      );
    } else if (!queue) {
      return (
        <div>
          <h1>SC Shuffler</h1>
          <p>Loading your favorite songs...</p>
        </div>
      );
    }

    return (
      <div>
        <h1>SC Shuffler</h1>
        {player && player.indexOf('soundcloud.com/player') !== -1 &&
          <div>
            <div dangerouslySetInnerHTML={{ __html: player }} />
            <button
              onClick={this._playPreviousTrack}
            >{'<<'}</button>
            <button
              onClick={this._playNextTrack}
            >{'>>'}</button>
            <Queue songs={queue} />
          </div>
        }
      </div>
    );
  }

  _getFavorites() {
    SC.get('/me/favorites', {
      limit: 200,
      linked_partitioning: 1,
    })
      .then((results) => {
        this._getNextFavoritesBatch(results.collection, results.next_href);
      });
  }

  // Recursively fetch paginated favorites b/c SoundCloud won't return all at once.
  _getNextFavoritesBatch(favorites, nextUri) {
    fetch(nextUri)
      .then(results => (results.json()))
      .then(results => {
        favorites = favorites.concat(results.collection);

        // If there is not a next_href prop, then all tracks have been fetched.
        if (results.next_href) {
          this._getNextFavoritesBatch(favorites, results.next_href);
        } else {
          shuffle(favorites);
          this.setState({ queue: favorites }, this._loadPlayer);
        }
      });
  }

  _loadPlayer() {
    let { queue } = this.state;
    let currentTrack = queue.shift();

    SC.oEmbed(currentTrack.uri, {
      auto_play: true,
      maxheight: 166,
    })
      .then(oEmbed => {
        this.setState({
          currentTrack,
          player: oEmbed.html,
          queue,
        }, this._onWidgetLoaded);
      });
  }

  _onLoginClick() {
    SC.connect()
      .then(() => {
        this.setState({ loggedIn: true });
        this._getFavorites();
      })
      .catch((error) => {
        console.log('[Error] ', error.message);
      });
  }

  // Add event listener for when track has finished playing.
  _onWidgetLoaded() {
    this._widget = SC.Widget(document.querySelector('iframe'));
    this._widget.bind(SC.Widget.Events.FINISH, this._playNextTrack.bind(this));
  }

  _playNextTrack() {
    let { currentTrack, history, queue } = this.state;
    let nextTrack = queue.shift();

    history.push(currentTrack);
    this._widget.load(nextTrack.uri, { auto_play: true });

    this.setState({
      currentTrack: nextTrack,
      queue,
      history,
    });
  }

  _playPreviousTrack() {
    let { currentTrack, history, queue } = this.state;
    let previousTrack = history.pop();

    if (!previousTrack) {
      return;
    }

    queue.unshift(currentTrack);
    this._widget.load(previousTrack.uri, { auto_play: true });

    this.setState({
      currentTrack: previousTrack,
      queue,
      history,
    });
  }
}

export default App;
