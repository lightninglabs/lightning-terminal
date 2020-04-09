import React, { useEffect } from 'react';
import './App.css';
import { channel, swap, node } from 'action';
import store from 'store';
import { observer } from 'mobx-react';

const App = () => {
  useEffect(() => {
    // fetch node info when the component is mounted
    const fetchInfo = async () => await node.getInfo();
    fetchInfo();
  }, []);

  return (
    <div className="App">
      {store.info && (
        <>
          <p>Node Info</p>
          <table className="App-table">
            <tbody>
              <tr>
                <th>Pubkey</th>
                <td>{store.info.identityPubkey}</td>
              </tr>
              <tr>
                <th>Alias</th>
                <td>{store.info.alias}</td>
              </tr>
              <tr>
                <th>Version</th>
                <td>{store.info.version}</td>
              </tr>
              <tr>
                <th># Channels</th>
                <td>{store.info.numActiveChannels}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
      <p>
        {store.channels.length} Channels
        <button onClick={channel.getChannels}>Fetch</button>
      </p>
      <table className="App-table">
        <thead>
          <tr>
            <td>Can Receive</td>
            <td>Can Send</td>
            <td>In Fee %</td>
            <td>Up time %</td>
            <td>Volume (24h)</td>
            <td>Peer/Alias</td>
            <td>Capacity</td>
          </tr>
        </thead>
        <tbody>
          {store.channels.map(c => (
            <tr key={c.chanId}>
              <td>{c.remoteBalance}</td>
              <td>{c.localBalance}</td>
              <td></td>
              <td>{c.uptime}</td>
              <td></td>
              <td>{c.remotePubkey}</td>
              <td>{c.capacity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        {store.swaps.length} Swaps
        <button onClick={swap.listSwaps}>Fetch</button>
      </p>
      <table className="App-table">
        <thead>
          <tr>
            <td>Date</td>
            <td>Type</td>
            <td>Amount</td>
            <td>Status</td>
          </tr>
        </thead>
        <tbody>
          {store.swaps.map(s => (
            <tr key={s.id}>
              <td>{s.createdOn.toString()}</td>
              <td>{s.type}</td>
              <td>{s.amount.toString()}</td>
              <td>{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default observer(App);
