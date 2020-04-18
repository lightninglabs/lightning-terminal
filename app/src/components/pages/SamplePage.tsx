import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import usePrefixedTranslation from 'hooks/usePrefixedTranslation';
import { channel, node, swap } from 'action';
import store from 'store';

const SamplePage: React.FC = () => {
  const { l } = usePrefixedTranslation('App');
  useEffect(() => {
    // fetch node info when the component is mounted
    const fetchInfo = async () => {
      try {
        await node.getInfo();
      } catch (error) {
        console.log('Failed to fetch node info', error);
      }
    };

    fetchInfo();
  }, []);

  return (
    <>
      <header className="text-center">
        <h3>Lightning Loop</h3>
      </header>
      <section className="mt-4">
        <h1>{l('App.nodeInfo')}</h1>
        {store.info && (
          <table className="table" style={{ color: '#fff' }}>
            <tbody>
              <tr>
                <th>{l('pubkey')}</th>
                <td>{store.info.identityPubkey}</td>
              </tr>
              <tr>
                <th>{l('alias')}</th>
                <td>{store.info.alias}</td>
              </tr>
              <tr>
                <th>{l('version')}</th>
                <td>{store.info.version}</td>
              </tr>
              <tr>
                <th>{l('numChannels')}</th>
                <td>{store.info.numActiveChannels}</td>
              </tr>
            </tbody>
          </table>
        )}
      </section>
      <section className="mt-4">
        <h2>
          {store.channels.length} Channels
          <button
            className="btn btn-outline-light float-right"
            onClick={channel.getChannels}
          >
            Fetch
          </button>
        </h2>
        <table className="table" style={{ color: '#fff' }}>
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
                <td>{c.remotePubkey.substring(0, 12)}</td>
                <td>{c.capacity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="mt-4">
        <h2>
          {store.swaps.length} Swaps
          <button className="btn btn-outline-light float-right" onClick={swap.listSwaps}>
            Fetch
          </button>
        </h2>
        <table className="table" style={{ color: '#fff' }}>
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
      </section>
    </>
  );
};

export default observer(SamplePage);
