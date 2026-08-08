import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import { useStore } from 'store';
import {
  X,
  Plus,
  Server,
  ExternalLink,
  Zap,
  HardDrive,
  Cloud,
  Globe,
  Loader2,
  AlertCircle,
  Link,
} from 'lucide-react';

const PROVIDERS = [
  {
    name: 'Voltage',
    desc: 'Managed cloud Lightning nodes. Easiest setup.',
    url: 'https://voltage.cloud',
    icon: Cloud,
    tag: 'Recommended',
  },
  {
    name: 'Umbrel',
    desc: 'Run a node at home on a Raspberry Pi or old laptop.',
    url: 'https://umbrel.com',
    icon: HardDrive,
  },
  {
    name: 'Start9',
    desc: 'Sovereign home server with a full app ecosystem.',
    url: 'https://start9.com',
    icon: Server,
  },
  {
    name: 'Nodl',
    desc: 'Plug-and-play dedicated hardware node.',
    url: 'https://www.nodl.it',
    icon: HardDrive,
  },
  {
    name: 'Luna Node',
    desc: 'VPS hosting for self-managed Lightning nodes.',
    url: 'https://www.lunanode.com',
    icon: Globe,
  },
];

export interface SavedNode {
  id: string;
  alias: string;
  type: 'lnc' | 'manual';
  rpcServer?: string;
  macaroonHex?: string;
  tlsCertPath?: string;
}

interface Props {
  onClose: () => void;
  onSave?: (node: SavedNode) => void;
}

const AddNodeModal: React.FC<Props> = ({ onClose, onSave }) => {
  const { nodeConnectionStore } = useStore();
  const [view, setView] = useState<'choose' | 'lnc' | 'manual'>('choose');
  const [label, setLabel] = useState('');
  const [pairingPhrase, setPairingPhrase] = useState('');
  const [lncPassword, setLncPassword] = useState('');
  const [rpcServer, setRpcServer] = useState('');
  const [macaroonHex, setMacaroonHex] = useState('');
  const [tlsCertPath, setTlsCertPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLncConnect = async () => {
    if (!pairingPhrase.trim() || !lncPassword.trim()) return;
    setLoading(true);
    setError('');
    try {
      await nodeConnectionStore.addLncNode(
        label.trim() || 'Remote Node',
        pairingPhrase,
        lncPassword,
      );
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to connect via LNC');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSave = () => {
    if (!rpcServer.trim() || !macaroonHex.trim()) return;
    const node: SavedNode = {
      id: Date.now().toString(36),
      alias: label.trim() || rpcServer.split('.')[0],
      type: 'manual',
      rpcServer: rpcServer.trim(),
      macaroonHex: macaroonHex.trim(),
      tlsCertPath: tlsCertPath.trim(),
    };
    if (onSave) onSave(node);
    onClose();
  };

  const renderChoose = () => (
    <S.Content>
      <S.Section>
        <S.SectionTitle>
          <Plus size={14} />
          Connect Existing Node
        </S.SectionTitle>
        <S.SectionDesc>Already running a Lightning node? Connect it here.</S.SectionDesc>
        <S.ConnectBtnGroup>
          <S.ConnectBtn onClick={() => setView('lnc')}>
            <Link size={14} />
            Lightning Node Connect
            <S.MethodTag>Recommended</S.MethodTag>
          </S.ConnectBtn>
          <S.ConnectBtnSecondary onClick={() => setView('manual')}>
            <Server size={14} />
            Manual gRPC Config
          </S.ConnectBtnSecondary>
        </S.ConnectBtnGroup>
      </S.Section>

      <S.Divider>
        <S.DividerLine />
        <S.DividerText>or get a node</S.DividerText>
        <S.DividerLine />
      </S.Divider>

      <S.Section>
        <S.SectionTitle>
          <Zap size={14} />
          Node Providers
        </S.SectionTitle>
        <S.SectionDesc>
          Don&apos;t have a node yet? These providers make it easy.
        </S.SectionDesc>
        <S.ProviderList>
          {PROVIDERS.map(p => (
            <S.ProviderCard key={p.name} onClick={() => window.open(p.url, '_blank')}>
              <S.ProviderIcon>
                <p.icon size={16} />
              </S.ProviderIcon>
              <S.ProviderInfo>
                <S.ProviderName>
                  {p.name}
                  {p.tag && <S.ProviderTag>{p.tag}</S.ProviderTag>}
                </S.ProviderName>
                <S.ProviderDesc>{p.desc}</S.ProviderDesc>
              </S.ProviderInfo>
              <S.ProviderLink>
                <ExternalLink size={12} />
              </S.ProviderLink>
            </S.ProviderCard>
          ))}
        </S.ProviderList>
      </S.Section>
    </S.Content>
  );

  const renderLnc = () => (
    <S.Content>
      <S.FormSection>
        <S.BackLink
          onClick={() => {
            setView('choose');
            setError('');
          }}
        >
          &larr; Back
        </S.BackLink>

        <S.ConnectHeader>
          <Link size={16} />
          Connect via Lightning Node Connect
        </S.ConnectHeader>
        <S.ConnectDesc>Generate a pairing phrase on your node by running:</S.ConnectDesc>
        <S.CmdBlock>
          litcli sessions add --type admin --label &quot;Lit App&quot;
        </S.CmdBlock>

        {error && (
          <S.ErrorBanner>
            <AlertCircle size={14} />
            {error}
          </S.ErrorBanner>
        )}

        <S.FieldLabel>Node Label</S.FieldLabel>
        <S.Input
          placeholder="e.g. My Voltage Node"
          value={label}
          onChange={e => setLabel(e.target.value)}
        />
        <S.FieldLabel>Pairing Phrase</S.FieldLabel>
        <S.TextArea
          placeholder="Paste the pairing phrase from litcli..."
          value={pairingPhrase}
          onChange={e => setPairingPhrase(e.target.value)}
          rows={3}
        />
        <S.FieldLabel>Encryption Password</S.FieldLabel>
        <S.Input
          type="password"
          placeholder="Choose a local password to encrypt credentials"
          value={lncPassword}
          onChange={e => setLncPassword(e.target.value)}
        />
        <S.Hint>
          This password encrypts the pairing data stored in your browser. You&apos;ll need
          it when reconnecting.
        </S.Hint>
        <S.SaveBtn
          onClick={handleLncConnect}
          disabled={loading || !pairingPhrase.trim() || !lncPassword.trim()}
        >
          {loading ? (
            <>
              <Spinner size={14} />
              Connecting...
            </>
          ) : (
            'Connect Node'
          )}
        </S.SaveBtn>
      </S.FormSection>
    </S.Content>
  );

  const renderManual = () => (
    <S.Content>
      <S.FormSection>
        <S.BackLink
          onClick={() => {
            setView('choose');
            setError('');
          }}
        >
          &larr; Back
        </S.BackLink>
        <S.FieldLabel>Node Name</S.FieldLabel>
        <S.Input
          placeholder="My Voltage Node"
          value={label}
          onChange={e => setLabel(e.target.value)}
        />
        <S.FieldLabel>gRPC Endpoint</S.FieldLabel>
        <S.Input
          placeholder="mynode.m.voltageapp.io:10009"
          value={rpcServer}
          onChange={e => setRpcServer(e.target.value)}
        />
        <S.FieldLabel>Admin Macaroon (hex)</S.FieldLabel>
        <S.TextArea
          placeholder="Paste your admin macaroon hex..."
          value={macaroonHex}
          onChange={e => setMacaroonHex(e.target.value)}
          rows={3}
        />
        <S.FieldLabel>TLS Certificate Path</S.FieldLabel>
        <S.Input
          placeholder="/path/to/tls.cert"
          value={tlsCertPath}
          onChange={e => setTlsCertPath(e.target.value)}
        />
        <S.Hint>Download these from your node provider&apos;s dashboard.</S.Hint>
        <S.SaveBtn
          onClick={handleManualSave}
          disabled={!rpcServer.trim() || !macaroonHex.trim()}
        >
          Save Node
        </S.SaveBtn>
      </S.FormSection>
    </S.Content>
  );

  const renderView = () => {
    switch (view) {
      case 'lnc':
        return renderLnc();
      case 'manual':
        return renderManual();
      default:
        return renderChoose();
    }
  };

  return ReactDOM.createPortal(
    <S.Backdrop onClick={onClose}>
      <S.Modal onClick={e => e.stopPropagation()}>
        <S.Header>
          <S.Title>Add Node</S.Title>
          <S.CloseBtn onClick={onClose}>
            <X size={18} />
          </S.CloseBtn>
        </S.Header>
        {renderView()}
      </S.Modal>
    </S.Backdrop>,
    document.body,
  );
};

export default observer(AddNodeModal);

const Spinner = styled(Loader2)`
  animation: spin 1s linear infinite;
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const S = {
  Backdrop: styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `,
  Modal: styled.div`
    background: #0f0a1e;
    border: 1px solid rgba(139, 92, 246, 0.15);
    border-radius: 16px;
    width: 440px;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
  `,
  Header: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 0;
  `,
  Title: styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: #e2e8f0;
    margin: 0;
  `,
  CloseBtn: styled.button`
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    &:hover {
      color: #e2e8f0;
      background: rgba(255, 255, 255, 0.05);
    }
  `,
  Content: styled.div`
    padding: 20px 24px 24px;
  `,
  Section: styled.div`
    margin-bottom: 4px;
  `,
  SectionTitle: styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: #e2e8f0;
    margin-bottom: 4px;
  `,
  SectionDesc: styled.div`
    font-size: 12px;
    color: #64748b;
    margin-bottom: 12px;
    line-height: 1.4;
  `,
  ConnectBtnGroup: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  ConnectBtn: styled.button`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid rgba(139, 92, 246, 0.25);
    background: rgba(139, 92, 246, 0.08);
    color: #a78bfa;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    &:hover {
      background: rgba(139, 92, 246, 0.15);
      border-color: rgba(139, 92, 246, 0.4);
    }
  `,
  ConnectBtnSecondary: styled.button`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(255, 255, 255, 0.02);
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    &:hover {
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.7);
    }
  `,
  MethodTag: styled.span`
    font-size: 9px;
    font-weight: 600;
    padding: 1px 5px;
    border-radius: 3px;
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  `,
  Divider: styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 20px 0;
  `,
  DividerLine: styled.div`
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.06);
  `,
  DividerText: styled.span`
    font-size: 11px;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
  `,
  ProviderList: styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
  `,
  ProviderCard: styled.button`
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    background: rgba(255, 255, 255, 0.02);
    cursor: pointer;
    transition: all 0.15s;
    text-align: left;
    &:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.1);
    }
  `,
  ProviderIcon: styled.div`
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(139, 92, 246, 0.1);
    color: #a78bfa;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  `,
  ProviderInfo: styled.div`
    flex: 1;
    min-width: 0;
  `,
  ProviderName: styled.div`
    font-size: 13px;
    font-weight: 500;
    color: #e2e8f0;
    display: flex;
    align-items: center;
    gap: 6px;
  `,
  ProviderTag: styled.span`
    font-size: 9px;
    font-weight: 600;
    padding: 1px 5px;
    border-radius: 3px;
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  `,
  ProviderDesc: styled.div`
    font-size: 11px;
    color: #64748b;
    margin-top: 1px;
    line-height: 1.3;
  `,
  ProviderLink: styled.div`
    color: #475569;
    flex-shrink: 0;
  `,
  FormSection: styled.div``,
  BackLink: styled.button`
    background: none;
    border: none;
    color: #64748b;
    font-size: 12px;
    cursor: pointer;
    padding: 0;
    margin-bottom: 16px;
    &:hover {
      color: #a78bfa;
    }
  `,
  ConnectHeader: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #a78bfa;
    margin-bottom: 8px;
  `,
  ConnectDesc: styled.div`
    font-size: 12px;
    color: #64748b;
    margin-bottom: 8px;
    line-height: 1.4;
  `,
  CmdBlock: styled.div`
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 11px;
    color: #c4b5fd;
    background: rgba(139, 92, 246, 0.06);
    border: 1px solid rgba(139, 92, 246, 0.1);
    border-radius: 6px;
    padding: 10px 12px;
    margin-bottom: 16px;
    word-break: break-all;
    line-height: 1.5;
  `,
  ErrorBanner: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding: 10px 12px;
    border-radius: 8px;
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.2);
    color: #ef4444;
    font-size: 12px;
  `,
  FieldLabel: styled.label`
    display: block;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;
    margin-bottom: 6px;
    margin-top: 12px;
    &:first-of-type {
      margin-top: 0;
    }
  `,
  Input: styled.input`
    width: 100%;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(139, 92, 246, 0.12);
    border-radius: 8px;
    padding: 10px 12px;
    color: #e2e8f0;
    font-size: 13px;
    outline: none;
    box-sizing: border-box;
    &::placeholder {
      color: #475569;
    }
    &:focus {
      border-color: rgba(139, 92, 246, 0.35);
    }
  `,
  TextArea: styled.textarea`
    width: 100%;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(139, 92, 246, 0.12);
    border-radius: 8px;
    padding: 10px 12px;
    color: #e2e8f0;
    font-size: 12px;
    font-family: 'SF Mono', 'Fira Code', monospace;
    outline: none;
    resize: vertical;
    box-sizing: border-box;
    &::placeholder {
      color: #475569;
      font-family: 'Inter', sans-serif;
    }
    &:focus {
      border-color: rgba(139, 92, 246, 0.35);
    }
  `,
  Hint: styled.div`
    font-size: 11px;
    color: #475569;
    margin-top: 8px;
  `,
  SaveBtn: styled.button<{ disabled?: boolean }>`
    width: 100%;
    margin-top: 16px;
    padding: 12px;
    border-radius: 8px;
    border: none;
    background: ${p =>
      p.disabled ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.85)'};
    color: white;
    font-size: 14px;
    font-weight: 500;
    cursor: ${p => (p.disabled ? 'not-allowed' : 'pointer')};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: background 0.15s;
    &:hover:not(:disabled) {
      background: rgba(139, 92, 246, 1);
    }
  `,
};
