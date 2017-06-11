import React from 'react';
import 'whatwg-fetch';

function shuffle(array) {
  for (let i = array.length; i; i--) {
    let j = Math.floor(Math.random() * i);
    [array[i - 1], array[j]] = [array[j], array[i - 1]];
  }
}

export default class App extends React.Component {
  constructor() {
    super();

    this._onLoginClick = this._onLoginClick.bind(this);

    this.state = {
      favorites: null,
      loggedIn: false,
    };
  }

  render() {
    let { favorites, loggedIn } = this.state;

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
    }

    return (
      <div>
        <h1>SC Shuffler</h1>
        {!favorites &&
          <p>Loading your favorite songs...</p>
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
          this.setState({ favorites });
        }
      });
  }
}
