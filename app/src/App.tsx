import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { GetInfoRequest } from './types/generated/lnd_pb';
import { grpc } from '@improbable-eng/grpc-web';
import { Lightning } from './types/generated/lnd_pb_service';

function App() {
  const [info, setInfo] = useState('');
  useEffect(() => {
    const { protocol, hostname, port = '' } = window.location;
    const req = new GetInfoRequest();
    grpc.unary(Lightning.GetInfo, {
      request: req,
      host: `${protocol}//${hostname}:${port}`,
      onEnd: ({ status, statusMessage, headers, message, trailers }) => {
        console.log("status", status, statusMessage);
        console.log("headers", headers);
        if (status === grpc.Code.OK && message) {
          setInfo(JSON.stringify(message.toObject(), null, 2));
          console.log("message", message.toObject());
        } else {
          setInfo(statusMessage);
        }
        console.log("trailers", trailers);
      }
    });
  }, [setInfo]);

  return (
    <div className="App">
      <header className="App-header">
        {info ? (
          <pre className="App-info">
            {info}
          </pre>
        ) : (
          <img src={logo} className="App-logo" alt="logo" />
        )}
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
