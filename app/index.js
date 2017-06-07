import React from 'react';
import ReactDOM from 'react-dom';
import { devClientId } from './keys.js';
import App from './components/App.jsx';

SC.initialize({
  client_id: devClientId,
  redirect_uri: 'http://localhost:8080/callback',
});

ReactDOM.render(<App />, document.getElementById('root'));
