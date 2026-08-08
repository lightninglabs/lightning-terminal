import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from 'store';
import {
  X,
  Zap,
  Link2,
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';

type Direction = 'receive' | 'send';
type Method = 'lightning' | 'onchain';

interface Props {
  direction: Direction;
  onClose: () => void;
}

const formatSats = (sats: number): string => {
  if (sats >= 1_000_000) return `${(sats / 1_000_000).toFixed(2)}M`;
  if (sats >= 1_000) return `${(sats / 1_000).toFixed(1)}k`;
  return sats.toLocaleString();
};

const TransactionModal: React.FC<Props> = ({ direction, onClose }) => {
  const { api, paymentActivityStore } = useStore();
  const [method, setMethod] = useState<Method>('lightning');
  const [step, setStep] = useState<'form' | 'result' | 'confirm'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Receive Lightning state
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceMemo, setInvoiceMemo] = useState('');
  const [generatedInvoice, setGeneratedInvoice] = useState('');

  // Receive On-Chain state
  const [generatedAddress, setGeneratedAddress] = useState('');

  // Send Lightning state
  const [payReq, setPayReq] = useState('');
  const [decodedInvoice, setDecodedInvoice] = useState<{
    destination: string;
    numSatoshis: string;
    description: string;
    expiry: string;
  } | null>(null);
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    preimage?: string;
    error?: string;
  } | null>(null);

  // Send On-Chain state
  const [sendAddress, setSendAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [txid, setTxid] = useState('');

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleCreateInvoice = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.lnd.addInvoice(invoiceAmount || '0', invoiceMemo);
      setGeneratedInvoice(res.paymentRequest);
      setStep('result');
    } catch (err: any) {
      setError(err?.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAddress = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.lnd.newAddress();
      setGeneratedAddress(res.address);
      setStep('result');
    } catch (err: any) {
      setError(err?.message || 'Failed to generate address');
    } finally {
      setLoading(false);
    }
  };

  const handleDecodeInvoice = async () => {
    setLoading(true);
    setError('');
    try {
      const decoded = await api.lnd.decodePayReq(payReq.trim());
      setDecodedInvoice({
        destination: decoded.destination,
        numSatoshis: decoded.numSatoshis,
        description: decoded.description,
        expiry: decoded.expiry,
      });
      setStep('confirm');
    } catch (err: any) {
      setError(err?.message || 'Failed to decode invoice');
    } finally {
      setLoading(false);
    }
  };

  const handlePayInvoice = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.lnd.sendPaymentSync(payReq.trim());
      if (res.paymentError) {
        setPaymentResult({ success: false, error: res.paymentError });
      } else {
        const preimage =
          typeof res.paymentPreimage === 'string'
            ? res.paymentPreimage
            : Array.from(new Uint8Array(res.paymentPreimage as any))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        setPaymentResult({ success: true, preimage });
        const amt = decodedInvoice ? parseInt(decodedInvoice.numSatoshis, 10) || 0 : 0;
        paymentActivityStore.onPaymentSent(amt);
      }
      setStep('result');
    } catch (err: any) {
      setError(err?.message || 'Payment failed');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOnChain = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.lnd.sendCoins(sendAddress.trim(), sendAmount);
      setTxid(res.txid);
      setStep('result');
    } catch (err: any) {
      setError(err?.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setStep('form');
    setError('');
    setGeneratedInvoice('');
    setGeneratedAddress('');
    setPayReq('');
    setDecodedInvoice(null);
    setPaymentResult(null);
    setSendAddress('');
    setSendAmount('');
    setTxid('');
  };

  const handleMethodSwitch = (m: Method) => {
    setMethod(m);
    resetState();
  };

  const renderReceiveLightning = () => {
    if (step === 'result' && generatedInvoice) {
      return (
        <S.ResultSection>
          <S.ResultLabel>Lightning Invoice</S.ResultLabel>
          <S.QRWrapper>
            <QRCodeSVG
              value={generatedInvoice}
              size={180}
              bgColor="transparent"
              fgColor="#e2e8f0"
              level="M"
            />
          </S.QRWrapper>
          <S.InvoiceBox onClick={() => copyToClipboard(generatedInvoice)}>
            <S.InvoiceText>{generatedInvoice}</S.InvoiceText>
            <S.CopyBtn>{copied ? <Check size={14} /> : <Copy size={14} />}</S.CopyBtn>
          </S.InvoiceBox>
          {invoiceAmount && (
            <S.ResultDetail>
              Amount: <strong>{formatSats(Number(invoiceAmount))} sats</strong>
            </S.ResultDetail>
          )}
          <S.ResultHint>Share this invoice with the sender</S.ResultHint>
          <S.ActionBtn onClick={resetState}>Create Another</S.ActionBtn>
        </S.ResultSection>
      );
    }
    return (
      <S.FormSection>
        <S.FieldLabel>Amount (sats)</S.FieldLabel>
        <S.Input
          type="number"
          placeholder="0 for any amount"
          value={invoiceAmount}
          onChange={e => setInvoiceAmount(e.target.value)}
        />
        <S.FieldLabel>Memo</S.FieldLabel>
        <S.Input
          placeholder="What's this for?"
          value={invoiceMemo}
          onChange={e => setInvoiceMemo(e.target.value)}
        />
        <S.ActionBtn onClick={handleCreateInvoice} disabled={loading}>
          {loading ? <S.Spinner size={14} /> : 'Create Invoice'}
        </S.ActionBtn>
      </S.FormSection>
    );
  };

  const renderReceiveOnChain = () => {
    if (step === 'result' && generatedAddress) {
      return (
        <S.ResultSection>
          <S.ResultLabel>Bitcoin Address</S.ResultLabel>
          <S.QRWrapper>
            <QRCodeSVG
              value={`bitcoin:${generatedAddress}`}
              size={180}
              bgColor="transparent"
              fgColor="#e2e8f0"
              level="M"
            />
          </S.QRWrapper>
          <S.InvoiceBox onClick={() => copyToClipboard(generatedAddress)}>
            <S.InvoiceText style={{ wordBreak: 'break-all' }}>
              {generatedAddress}
            </S.InvoiceText>
            <S.CopyBtn>{copied ? <Check size={14} /> : <Copy size={14} />}</S.CopyBtn>
          </S.InvoiceBox>
          <S.ResultHint>Send only on-chain Bitcoin to this address</S.ResultHint>
          <S.ActionBtn onClick={resetState}>Generate New Address</S.ActionBtn>
        </S.ResultSection>
      );
    }
    return (
      <S.FormSection>
        <S.FormDescription>
          Generate a new Bitcoin address to receive on-chain funds.
        </S.FormDescription>
        <S.ActionBtn onClick={handleGenerateAddress} disabled={loading}>
          {loading ? <S.Spinner size={14} /> : 'Generate Address'}
        </S.ActionBtn>
      </S.FormSection>
    );
  };

  const renderSendLightning = () => {
    if (step === 'result' && paymentResult) {
      return (
        <S.ResultSection>
          {paymentResult.success ? (
            <>
              <S.SuccessIcon>
                <Check size={32} />
              </S.SuccessIcon>
              <S.ResultLabel>Payment Sent</S.ResultLabel>
              <S.ResultDetail>
                {decodedInvoice && (
                  <>
                    Amount:{' '}
                    <strong>{formatSats(Number(decodedInvoice.numSatoshis))} sats</strong>
                  </>
                )}
              </S.ResultDetail>
            </>
          ) : (
            <>
              <S.ErrorIcon>
                <AlertCircle size={32} />
              </S.ErrorIcon>
              <S.ResultLabel>Payment Failed</S.ResultLabel>
              <S.ErrorText>{paymentResult.error}</S.ErrorText>
            </>
          )}
          <S.ActionBtn onClick={resetState}>Send Another</S.ActionBtn>
        </S.ResultSection>
      );
    }
    if (step === 'confirm' && decodedInvoice) {
      return (
        <S.FormSection>
          <S.ResultLabel>Confirm Payment</S.ResultLabel>
          <S.ConfirmRow>
            <span>To</span>
            <S.ConfirmValue>
              {decodedInvoice.destination.slice(0, 12)}...
              {decodedInvoice.destination.slice(-8)}
            </S.ConfirmValue>
          </S.ConfirmRow>
          <S.ConfirmRow>
            <span>Amount</span>
            <S.ConfirmValue>
              {formatSats(Number(decodedInvoice.numSatoshis))} sats
            </S.ConfirmValue>
          </S.ConfirmRow>
          {decodedInvoice.description && (
            <S.ConfirmRow>
              <span>Memo</span>
              <S.ConfirmValue>{decodedInvoice.description}</S.ConfirmValue>
            </S.ConfirmRow>
          )}
          <S.ButtonRow>
            <S.SecondaryBtn onClick={resetState}>Cancel</S.SecondaryBtn>
            <S.ActionBtn onClick={handlePayInvoice} disabled={loading}>
              {loading ? <S.Spinner size={14} /> : 'Confirm & Pay'}
            </S.ActionBtn>
          </S.ButtonRow>
        </S.FormSection>
      );
    }
    return (
      <S.FormSection>
        <S.FieldLabel>Lightning Invoice</S.FieldLabel>
        <S.TextArea
          placeholder="Paste a lightning invoice (lnbc...)"
          value={payReq}
          onChange={e => setPayReq(e.target.value)}
          rows={4}
        />
        <S.ActionBtn onClick={handleDecodeInvoice} disabled={loading || !payReq.trim()}>
          {loading ? <S.Spinner size={14} /> : 'Review Payment'}
        </S.ActionBtn>
      </S.FormSection>
    );
  };

  const renderSendOnChain = () => {
    if (step === 'result' && txid) {
      return (
        <S.ResultSection>
          <S.SuccessIcon>
            <Check size={32} />
          </S.SuccessIcon>
          <S.ResultLabel>Transaction Sent</S.ResultLabel>
          <S.InvoiceBox onClick={() => copyToClipboard(txid)}>
            <S.InvoiceText style={{ wordBreak: 'break-all' }}>{txid}</S.InvoiceText>
            <S.CopyBtn>{copied ? <Check size={14} /> : <Copy size={14} />}</S.CopyBtn>
          </S.InvoiceBox>
          <S.ResultHint>Transaction ID copied</S.ResultHint>
          <S.ActionBtn onClick={resetState}>Send Another</S.ActionBtn>
        </S.ResultSection>
      );
    }
    return (
      <S.FormSection>
        <S.FieldLabel>Bitcoin Address</S.FieldLabel>
        <S.Input
          placeholder="bc1q..."
          value={sendAddress}
          onChange={e => setSendAddress(e.target.value)}
        />
        <S.FieldLabel>Amount (sats)</S.FieldLabel>
        <S.Input
          type="number"
          placeholder="Amount in satoshis"
          value={sendAmount}
          onChange={e => setSendAmount(e.target.value)}
        />
        <S.ActionBtn
          onClick={handleSendOnChain}
          disabled={loading || !sendAddress.trim() || !sendAmount}
        >
          {loading ? <S.Spinner size={14} /> : 'Send Bitcoin'}
        </S.ActionBtn>
      </S.FormSection>
    );
  };

  const renderContent = () => {
    if (direction === 'receive') {
      return method === 'lightning' ? renderReceiveLightning() : renderReceiveOnChain();
    }
    return method === 'lightning' ? renderSendLightning() : renderSendOnChain();
  };

  return ReactDOM.createPortal(
    <S.Backdrop onClick={onClose}>
      <S.Modal onClick={e => e.stopPropagation()}>
        <S.Header>
          <S.TitleRow>
            <S.DirectionIcon dir={direction}>
              {direction === 'receive' ? (
                <ArrowDownLeft size={16} />
              ) : (
                <ArrowUpRight size={16} />
              )}
            </S.DirectionIcon>
            <S.Title>{direction === 'receive' ? 'Receive' : 'Send'} Bitcoin</S.Title>
          </S.TitleRow>
          <S.CloseBtn onClick={onClose}>
            <X size={18} />
          </S.CloseBtn>
        </S.Header>

        <S.MethodTabs>
          <S.MethodTab
            active={method === 'lightning'}
            onClick={() => handleMethodSwitch('lightning')}
          >
            <Zap size={14} />
            Lightning
          </S.MethodTab>
          <S.MethodTab
            active={method === 'onchain'}
            onClick={() => handleMethodSwitch('onchain')}
          >
            <Link2 size={14} />
            On-Chain
          </S.MethodTab>
        </S.MethodTabs>

        {error && (
          <S.ErrorBanner>
            <AlertCircle size={14} />
            {error}
          </S.ErrorBanner>
        )}

        {renderContent()}
      </S.Modal>
    </S.Backdrop>,
    document.body,
  );
};

export default observer(TransactionModal);

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
    max-height: 90vh;
    overflow-y: auto;
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
  DirectionIcon: styled.div<{ dir: Direction }>`
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${p =>
      p.dir === 'receive' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(139, 92, 246, 0.12)'};
    color: ${p => (p.dir === 'receive' ? '#22c55e' : '#a78bfa')};
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
  MethodTabs: styled.div`
    display: flex;
    gap: 4px;
    padding: 16px 24px 0;
  `,
  MethodTab: styled.button<{ active: boolean }>`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid
      ${p => (p.active ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.06)')};
    background: ${p =>
      p.active ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.02)'};
    color: ${p => (p.active ? '#a78bfa' : '#64748b')};
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    &:hover {
      color: ${p => (p.active ? '#a78bfa' : '#94a3b8')};
    }
  `,
  FormSection: styled.div`
    padding: 20px 24px 24px;
  `,
  FormDescription: styled.p`
    color: #64748b;
    font-size: 13px;
    margin: 0 0 16px;
    line-height: 1.5;
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
  TextArea: styled.textarea`
    width: 100%;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(139, 92, 246, 0.12);
    border-radius: 8px;
    padding: 10px 12px;
    color: #e2e8f0;
    font-size: 13px;
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
  SecondaryBtn: styled.button`
    flex: 1;
    margin-top: 16px;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    color: #94a3b8;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    &:hover {
      background: rgba(255, 255, 255, 0.06);
      color: #e2e8f0;
    }
  `,
  ButtonRow: styled.div`
    display: flex;
    gap: 8px;
  `,
  ResultSection: styled.div`
    padding: 20px 24px 24px;
    text-align: center;
  `,
  ResultLabel: styled.div`
    font-size: 16px;
    font-weight: 600;
    color: #e2e8f0;
    margin-bottom: 12px;
  `,
  QRWrapper: styled.div`
    display: flex;
    justify-content: center;
    padding: 16px;
    margin-bottom: 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    border: 1px solid rgba(139, 92, 246, 0.1);
  `,
  ResultDetail: styled.div`
    font-size: 13px;
    color: #94a3b8;
    margin-bottom: 8px;
  `,
  ResultHint: styled.div`
    font-size: 12px;
    color: #475569;
    margin-top: 8px;
    margin-bottom: 4px;
  `,
  InvoiceBox: styled.div`
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(139, 92, 246, 0.12);
    border-radius: 8px;
    padding: 12px;
    cursor: pointer;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    text-align: left;
    transition: border-color 0.15s;
    &:hover {
      border-color: rgba(139, 92, 246, 0.3);
    }
  `,
  InvoiceText: styled.div`
    flex: 1;
    font-size: 12px;
    color: #94a3b8;
    font-family: 'SF Mono', 'Fira Code', monospace;
    word-break: break-all;
    line-height: 1.5;
  `,
  CopyBtn: styled.div`
    color: #64748b;
    flex-shrink: 0;
    margin-top: 2px;
  `,
  ConfirmRow: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    font-size: 13px;
    color: #64748b;
  `,
  ConfirmValue: styled.span`
    color: #e2e8f0;
    font-weight: 500;
    text-align: right;
    max-width: 60%;
    word-break: break-all;
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
  ErrorIcon: styled.div`
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgba(239, 68, 68, 0.12);
    color: #ef4444;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
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
  ErrorText: styled.div`
    font-size: 13px;
    color: #ef4444;
    margin-bottom: 16px;
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
