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

    this.state = {
      currentTrack: null,
      favorites: null,
      history: [],
      loggedIn: false,
      player: null,
    };
  }

  render() {
    let { favorites, loggedIn, player } = this.state;

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
    } else if (!favorites) {
      return (
        <div>
          <h1>SC Shuffler</h1>
          <p>Loading your favorites songs...</p>
        </div>
      );
    }

    return (
      <div>
        <h1>SC Shuffler</h1>
        {player && player.indexOf('soundcloud.com/player') !== -1 &&
          <div>
            <div dangerouslySetInnerHTML={{ __html: player }} />
            <Queue songs={favorites} />
          </div>
        }
      </div>
    );
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

  _getFavorites() {
    SC.get('/me/favorites', {
      limit: 200,
      linked_partitioning: 1,
    })
      .then((results) => {
        this._getNextBatch(results.collection, results.next_href);
      });
  }

  _getNextBatch(favorites, nextUri) {
    fetch(nextUri)
      .then(results => (results.json()))
      .then(results => {
        favorites = favorites.concat(results.collection);

        if (results.next_href) {
          this._getNextBatch(favorites, results.next_href);
        } else {
          shuffle(favorites);
          this.setState({ favorites }, this._playNextTrack);
        }
      });
  }

  _loadPlayer(trackUrl) {
    SC.oEmbed(trackUrl, { auto_play: true })
      .then(oEmbed => {
        this.setState({ player: oEmbed.html }, this._onWidgetLoaded);
      });
  }

  _onWidgetLoaded() {
    let widget = SC.Widget(document.querySelector('iframe'));
    widget.bind(SC.Widget.Events.FINISH, this._playNextTrack.bind(this));
  }

  _playNextTrack() {
    let { currentTrack, favorites, history } = this.state;
    let nextTrack = favorites.shift();

    if (currentTrack) {
      history.push(currentTrack);
    }

    this._loadPlayer(nextTrack.uri);

    this.setState({
      currentTrack: nextTrack,
      favorites,
      history,
    });
  }
}

export default App;
