import React from 'react';
import ReactDOM from 'react-dom';
import { configure } from 'mobx';
import './i18n';
import './index.css';
import { log } from 'util/log';
import App from './App';

log.info('Rendering the App');

// ensure all state updates are made inside of an action
configure({ enforceActions: 'observed' });

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);
