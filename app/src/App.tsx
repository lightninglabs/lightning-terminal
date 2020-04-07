import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { GetInfoRequest } from './types/generated/lnd_pb';
import { TermsRequest } from './types/generated/loop_pb';
import { grpc } from '@improbable-eng/grpc-web';
import { Lightning } from './types/generated/lnd_pb_service';
import { SwapClient } from './types/generated/loop_pb_service';

function App() {
  const [lndInfo, setLndInfo] = useState('');
  const [loopInfo, setLoopInfo] = useState('');
  useEffect(() => {
    const { protocol, hostname, port = '' } = window.location;
    const req = new GetInfoRequest();
    grpc.unary(Lightning.GetInfo, {
      host: `${protocol}//${hostname}:${port}`,
      request: req,
      metadata: {
        'X-Grpc-Backend': 'lnd',
        macaroon: '0201036c6e6402eb01030a109527a0652f02cac93e6b7f540335ecb11201301a160a0761646472657373120472656164120577726974651a130a04696e666f120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a140a086d616361726f6f6e120867656e65726174651a160a076d657373616765120472656164120577726974651a170a086f6666636861696e120472656164120577726974651a160a076f6e636861696e120472656164120577726974651a140a057065657273120472656164120577726974651a180a067369676e6572120867656e6572617465120472656164000006206a2b9f83f666dbf61040686007e5f4435f6a24073f73b125fcdaf728329d8196'
      },
      onEnd: ({ status, statusMessage, headers, message, trailers }) => {
        console.log("GetInfo.status", status, statusMessage);
        console.log("GetInfo.headers", headers);
        if (status === grpc.Code.OK && message) {
          setLndInfo(JSON.stringify(message.toObject(), null, 2));
          console.log("GetInfo.message", message.toObject());
        } else {
          setLndInfo(statusMessage);
        }
        console.log("GetInfo.trailers", trailers);
      }
    });
  }, [setLndInfo]);

  useEffect(() => {
    const { protocol, hostname, port = '' } = window.location;
    const req = new TermsRequest();
    grpc.unary(SwapClient.LoopOutTerms, {
      host: `${protocol}//${hostname}:${port}`,
      request: req,
      metadata: {
        'X-Grpc-Backend': 'loop',
      },
      onEnd: ({ status, statusMessage, headers, message, trailers }) => {
        console.log("LoopOutTerms.status", status, statusMessage);
        console.log("LoopOutTerms.headers", headers);
        if (status === grpc.Code.OK && message) {
          setLoopInfo(JSON.stringify(message.toObject(), null, 2));
          console.log("LoopOutTerms.message", message.toObject());
        } else {
          setLoopInfo(statusMessage);
        }
        console.log("LoopOutTerms.trailers", trailers);
      }
    });
  }, [setLoopInfo]);

  return (
    <div className="App">
      <header className="App-header">
        {lndInfo && loopInfo ? (
          <>
            <p>LND Info</p>
            <pre className="App-info">
              {lndInfo}
            </pre>
            <p>Loop Terms</p>
            <pre className="App-info">
              {loopInfo}
            </pre>
          </>
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
