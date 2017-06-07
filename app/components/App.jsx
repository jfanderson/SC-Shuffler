import React from 'react';

export default class App extends React.Component {
  constructor() {
    super();

    this._onLoginClick = this._onLoginClick.bind(this);
  }

  render() {
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

  _onLoginClick() {
    SC.connect().then(() => (SC.get('/me')))
      .then((me) => {
        console.log('Hello?');
        alert(`Hello, ${me.username}`);
      });
  }
}
