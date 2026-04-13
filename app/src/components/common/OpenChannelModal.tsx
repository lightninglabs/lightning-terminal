import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import { useStore } from 'store';
import { X, Link2, Check, Loader2, AlertCircle } from 'lucide-react';

interface Props {
  onClose: () => void;
  initialPubkey?: string;
  initialAlias?: string;
  /** Override the API used to open the channel (for cross-node channel opening) */
  sourceApi?: { openChannelSync: (pubkey: string, amount: string) => Promise<any> };
}

const OpenChannelModal: React.FC<Props> = ({
  onClose,
  initialPubkey,
  initialAlias,
  sourceApi,
}) => {
  const { api } = useStore();
  const lndApi = sourceApi || api.lnd;
  const [nodePubkey, setNodePubkey] = useState(initialPubkey || '');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fundingTxid, setFundingTxid] = useState('');

  const handleOpen = async () => {
    if (!nodePubkey.trim() || !amount) return;
    setLoading(true);
    setError('');
    try {
      const res = await lndApi.openChannelSync(nodePubkey.trim(), amount);
      setFundingTxid(res.fundingTxidStr || res.fundingTxid || '');
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to open channel');
    } finally {
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <S.Backdrop onClick={onClose}>
      <S.Modal onClick={e => e.stopPropagation()}>
        <S.Header>
          <S.TitleRow>
            <S.Icon>
              <Link2 size={16} />
            </S.Icon>
            <S.Title>Open Channel</S.Title>
          </S.TitleRow>
          <S.CloseBtn onClick={onClose}>
            <X size={18} />
          </S.CloseBtn>
        </S.Header>

        {error && (
          <S.ErrorBanner>
            <AlertCircle size={14} />
            {error}
          </S.ErrorBanner>
        )}

        {success ? (
          <S.ResultSection>
            <S.SuccessIcon>
              <Check size={32} />
            </S.SuccessIcon>
            <S.ResultLabel>Channel Opening</S.ResultLabel>
            <S.ResultDetail>
              A channel open transaction has been broadcast.
            </S.ResultDetail>
            {fundingTxid && (
              <S.TxBox>
                <S.TxLabel>Funding TXID</S.TxLabel>
                <S.TxValue>{fundingTxid}</S.TxValue>
              </S.TxBox>
            )}
            <S.ActionBtn onClick={onClose}>Done</S.ActionBtn>
          </S.ResultSection>
        ) : (
          <S.FormSection>
            {initialAlias && (
              <S.ConnectingTo>
                Connecting to <strong>{initialAlias}</strong>
              </S.ConnectingTo>
            )}
            <S.FieldLabel>Node Public Key</S.FieldLabel>
            <S.Input
              placeholder="02abc...@host:port or just pubkey"
              value={nodePubkey}
              onChange={e => setNodePubkey(e.target.value)}
              readOnly={!!initialPubkey}
            />
            <S.FieldLabel>Channel Size (sats)</S.FieldLabel>
            <S.Input
              type="number"
              placeholder="e.g. 500000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
            <S.Hint>
              Minimum recommended: 100,000 sats. Funds come from your on-chain wallet.
            </S.Hint>
            <S.ActionBtn
              onClick={handleOpen}
              disabled={loading || !nodePubkey.trim() || !amount}
            >
              {loading ? <S.Spinner size={14} /> : 'Open Channel'}
            </S.ActionBtn>
          </S.FormSection>
        )}
      </S.Modal>
    </S.Backdrop>,
    document.body,
  );
};

export default observer(OpenChannelModal);

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
    width: 420px;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
  `,
  Header: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 0;
  `,
  TitleRow: styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
  `,
  Icon: styled.div`
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(139, 92, 246, 0.12);
    color: #a78bfa;
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
  FormSection: styled.div`
    padding: 20px 24px 24px;
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
    font-size: 14px;
    outline: none;
    box-sizing: border-box;
    &::placeholder {
      color: #475569;
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
  ActionBtn: styled.button<{ disabled?: boolean }>`
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
  ResultSection: styled.div`
    padding: 20px 24px 24px;
    text-align: center;
  `,
  ResultLabel: styled.div`
    font-size: 16px;
    font-weight: 600;
    color: #e2e8f0;
    margin-bottom: 8px;
  `,
  ResultDetail: styled.div`
    font-size: 13px;
    color: #94a3b8;
    margin-bottom: 16px;
  `,
  SuccessIcon: styled.div`
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgba(34, 197, 94, 0.12);
    color: #22c55e;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  `,
  TxBox: styled.div`
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(139, 92, 246, 0.12);
    border-radius: 8px;
    padding: 12px;
    text-align: left;
    margin-bottom: 8px;
  `,
  TxLabel: styled.div`
    font-size: 10px;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
  `,
  TxValue: styled.div`
    font-size: 12px;
    color: #94a3b8;
    font-family: 'SF Mono', 'Fira Code', monospace;
    word-break: break-all;
  `,
  ErrorBanner: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 12px 24px 0;
    padding: 10px 12px;
    border-radius: 8px;
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.2);
    color: #ef4444;
    font-size: 12px;
  `,
  ConnectingTo: styled.div`
    font-size: 13px;
    color: #a78bfa;
    margin-bottom: 12px;
    strong {
      color: #e2e8f0;
    }
  `,
  Spinner: styled(Loader2)`
    animation: spin 1s linear infinite;
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
};
