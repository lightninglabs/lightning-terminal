import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { useStore } from 'store';
import LncApi from 'api/lncApi';
import {
  ArrowLeft,
  Key,
  Lock,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Shield,
  Zap,
  Sparkles,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Server,
} from 'lucide-react';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const S = {
  Wrapper: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100%;
    padding: 48px 24px 60px;
    background: #030508;
    color: #e5e7eb;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    overflow-y: auto;
  `,
  Back: styled.button`
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    padding: 8px;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    transition: color 0.15s ease;
    &:hover {
      color: #ffffff;
    }
  `,
  Header: styled.div`
    text-align: center;
    margin-bottom: 28px;
    animation: ${fadeUp} 0.5s ease both;
  `,
  PageLabel: styled.div`
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: rgba(255, 255, 255, 0.3);
    margin-bottom: 10px;
  `,
  Title: styled.h1`
    font-size: 32px;
    font-weight: 600;
    letter-spacing: -0.03em;
    color: #ffffff;
    margin: 0;
  `,
  Content: styled.div`
    width: 100%;
    max-width: 460px;
    animation: ${fadeUp} 0.5s ease both;
    animation-delay: 0.08s;
  `,
  MethodToggle: styled.div`
    display: flex;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 12px;
    padding: 3px;
    margin-bottom: 20px;
  `,
  MethodBtn: styled.button<{ active?: boolean }>`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px;
    border-radius: 10px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    background: ${p => (p.active ? 'rgba(255, 255, 255, 0.08)' : 'transparent')};
    color: ${p => (p.active ? '#ffffff' : 'rgba(255, 255, 255, 0.3)')};
    &:hover {
      color: ${p => (p.active ? '#ffffff' : 'rgba(255, 255, 255, 0.5)')};
    }
  `,
  Form: styled.form`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  `,
  Label: styled.label`
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(255, 255, 255, 0.3);
    margin-bottom: -6px;
  `,
  Input: styled.input`
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #ffffff;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 12px 14px;
    width: 100%;
    transition: all 0.15s ease;
    &:focus {
      outline: none;
      border-color: rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.06);
    }
    &::placeholder {
      color: rgba(255, 255, 255, 0.2);
    }
  `,
  TextArea: styled.textarea`
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 13px;
    color: #ffffff;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 12px 14px;
    width: 100%;
    min-height: 52px;
    resize: none;
    transition: all 0.15s ease;
    &:focus {
      outline: none;
      border-color: rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.06);
    }
    &::placeholder {
      color: rgba(255, 255, 255, 0.2);
      font-family: 'Inter', sans-serif;
    }
  `,
  Btn: styled.button<{ variant?: 'primary' | 'outline' }>`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    height: 44px;
    border-radius: 12px;
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    border: none;
    background: ${p =>
      p.variant === 'outline' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)'};
    color: ${p => (p.variant === 'outline' ? 'rgba(255,255,255,0.4)' : '#ffffff')};
    &:hover {
      background: ${p =>
        p.variant === 'outline' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.12)'};
    }
    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  `,
  ErrorMsg: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: rgba(244, 63, 94, 0.08);
    color: #f87171;
    border-radius: 10px;
    font-size: 13px;
  `,
  Divider: styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 4px 0 8px;
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: rgba(255, 255, 255, 0.12);

    &::before,
    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(255, 255, 255, 0.05);
    }
  `,
  HelpToggle: styled.button`
    display: flex;
    align-items: center;
    gap: 7px;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.25);
    font-family: inherit;
    font-size: 13px;
    cursor: pointer;
    padding: 6px 0;
    margin-bottom: 6px;
    transition: color 0.15s ease;
    &:hover {
      color: rgba(255, 255, 255, 0.45);
    }
  `,
  HelpContent: styled.div`
    animation: ${fadeUp} 0.3s ease both;
  `,
  AgentCard: styled.div`
    background: rgba(18, 20, 28, 0.92);
    border-radius: 14px;
    padding: 18px;
    margin-bottom: 10px;
  `,
  AgentCardHeader: styled.div`
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 6px;
  `,
  AgentCardIcon: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 7px;
    background: rgba(139, 92, 246, 0.12);
    color: rgba(167, 139, 250, 0.9);
  `,
  AgentCardTitle: styled.div`
    font-size: 13px;
    font-weight: 600;
    color: #ffffff;
  `,
  AgentCardDesc: styled.p`
    font-size: 12px;
    color: rgba(255, 255, 255, 0.28);
    line-height: 1.5;
    margin: 0 0 10px;
  `,
  PromptBox: styled.div`
    position: relative;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(139, 92, 246, 0.1);
    border-radius: 10px;
    padding: 12px 40px 12px 12px;
  `,
  PromptText: styled.div`
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 11px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.4);
    white-space: pre-wrap;
    word-break: break-word;
  `,
  CopyBtn: styled.button<{ copied?: boolean }>`
    position: absolute;
    top: 9px;
    right: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 6px;
    border: none;
    background: ${p =>
      p.copied ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.06)'};
    color: ${p => (p.copied ? 'rgba(52, 211, 153, 0.9)' : 'rgba(255, 255, 255, 0.25)')};
    cursor: pointer;
    transition: all 0.15s ease;
    &:hover {
      background: ${p =>
        p.copied ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
      color: ${p => (p.copied ? 'rgba(52, 211, 153, 1)' : 'rgba(255, 255, 255, 0.5)')};
    }
  `,
  AccordionGroup: styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 8px;
  `,
  AccordionItem: styled.div`
    background: rgba(18, 20, 28, 0.92);
    border-radius: 12px;
    overflow: hidden;
  `,
  AccordionHeader: styled.button`
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    background: none;
    border: none;
    color: #ffffff;
    cursor: pointer;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    text-align: left;
    transition: background 0.15s ease;
    &:hover {
      background: rgba(255, 255, 255, 0.03);
    }
  `,
  AccordionLogo: styled.img`
    width: 20px;
    height: 20px;
    border-radius: 5px;
    object-fit: cover;
  `,
  AccordionName: styled.span`
    flex: 1;
    font-size: 12px;
  `,
  AccordionChevron: styled.div<{ open?: boolean }>`
    color: rgba(255, 255, 255, 0.15);
    transform: ${p => (p.open ? 'rotate(90deg)' : 'rotate(0)')};
    transition: transform 0.15s ease;
    display: flex;
    align-items: center;
  `,
  AccordionBody: styled.div`
    padding: 0 14px 14px;
    font-size: 12px;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.35);

    ol {
      padding-left: 16px;
      margin: 0;
    }
    li {
      margin-bottom: 2px;
    }
    strong {
      color: rgba(255, 255, 255, 0.55);
    }
  `,
  CommandBlock: styled.div`
    position: relative;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 8px;
    padding: 10px 36px 10px 12px;
    margin: 6px 0 8px;
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    line-height: 1.5;
    word-break: break-all;
    white-space: pre-wrap;
  `,
  SmallCopyBtn: styled.button`
    position: absolute;
    top: 7px;
    right: 7px;
    background: rgba(255, 255, 255, 0.06);
    border: none;
    border-radius: 5px;
    padding: 4px;
    color: rgba(255, 255, 255, 0.2);
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.15s ease;
    &:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.1);
    }
  `,
  SecurityNote: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.2);
    margin-top: 4px;
    svg {
      flex-shrink: 0;
      color: rgba(255, 255, 255, 0.15);
    }
  `,
  ReconnectPanel: styled.div`
    margin-bottom: 16px;
  `,
  ReconnectLabel: styled.div`
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.35);
    margin-bottom: 12px;
    svg {
      color: rgba(255, 255, 255, 0.3);
    }
  `,
  NewSessionBtn: styled.button`
    display: flex;
    align-items: center;
    gap: 7px;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.25);
    font-family: inherit;
    font-size: 13px;
    cursor: pointer;
    padding: 6px 0;
    margin-top: 8px;
    transition: color 0.15s ease;
    &:hover {
      color: rgba(255, 255, 255, 0.45);
    }
  `,
  FooterLink: styled.button`
    display: flex;
    align-items: center;
    gap: 7px;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.25);
    font-family: inherit;
    font-size: 13px;
    cursor: pointer;
    padding: 6px 0;
    margin-top: 8px;
    transition: color 0.15s ease;
    &:hover {
      color: rgba(255, 255, 255, 0.45);
    }
  `,
  Spinner: styled(Loader2)`
    animation: ${spin} 1s linear infinite;
  `,
};

const CMD = 'litcli sessions add --label="Lightning Terminal Web" --type admin';

const AGENT_PROMPT = `I need to generate a Lightning Node Connect pairing phrase from my running litd (Lightning Terminal) instance. Run this command:

litcli sessions add --label="Lightning Terminal Web" --type admin

Give me the 10-word pairing phrase from the output so I can connect my node.`;

const providerHelp: {
  id: string;
  name: string;
  logo: string;
  steps: React.ReactNode;
}[] = [
  {
    id: 'voltage',
    name: 'Voltage',
    logo: '/icons/voltage.png',
    steps: (
      <ol>
        <li>
          Log in to your <strong>Voltage dashboard</strong>
        </li>
        <li>
          Select your node &rarr; <strong>Connect</strong>
        </li>
        <li>
          Under Lightning Terminal, click <strong>Reveal Pairing Phrase</strong>
        </li>
        <li>Copy the 10-word phrase</li>
      </ol>
    ),
  },
  {
    id: 'umbrel',
    name: 'Umbrel',
    logo: '/icons/umbrel.png',
    steps: (
      <ol>
        <li>
          Open <strong>Lightning Terminal</strong> on your Umbrel
        </li>
        <li>
          Go to <strong>Lightning Node Connect</strong> in settings
        </li>
        <li>
          Click <strong>Create</strong> to generate a session
        </li>
        <li>Copy the 10-word phrase</li>
      </ol>
    ),
  },
  {
    id: 'start9',
    name: 'Start9',
    logo: '/icons/start9.png',
    steps: (
      <ol>
        <li>
          Open <strong>Lightning Terminal</strong> on your Start9
        </li>
        <li>
          Navigate to <strong>Properties</strong>
        </li>
        <li>
          Find <strong>LNC Pairing Phrase</strong>
        </li>
        <li>Copy the 10-word phrase</li>
      </ol>
    ),
  },
  {
    id: 'self',
    name: 'Self-Hosted (litd)',
    logo: '/icons/Lit-dark.png',
    steps: null,
  },
];

const ConnectNodePage: React.FC = () => {
  const store = useStore();

  const [method, setMethod] = useState<'lnc' | 'password'>('lnc');
  const [pairingPhrase, setPairingPhrase] = useState('');
  const [lncPassword, setLncPassword] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showNewSession, setShowNewSession] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [openProvider, setOpenProvider] = useState<string | null>(null);
  const [copiedAgent, setCopiedAgent] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const hasSavedSession = LncApi.isPaired;

  const copyAgentPrompt = async () => {
    try {
      await navigator.clipboard.writeText(AGENT_PROMPT);
      setCopiedAgent(true);
      setTimeout(() => setCopiedAgent(false), 2000);
    } catch {
      /* noop */
    }
  };

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(CMD);
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    } catch {
      /* noop */
    }
  };

  const handleLncConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (hasSavedSession && !showNewSession && !pairingPhrase.trim()) {
        await store.authStore.reconnectLnc(lncPassword);
      } else {
        if (showNewSession) {
          LncApi.clearPaired();
        }
        await store.authStore.loginWithLnc(pairingPhrase, lncPassword);
      }
    } catch (err: any) {
      const msg = err?.message || 'Connection failed';
      setError(msg);
      if (msg.includes('expired') || msg.includes('Session')) {
        setShowNewSession(true);
        setLncPassword('');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError('');
    try {
      await store.authStore.login(password);
    } catch (err: any) {
      setError(err?.message || 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  if (!store.initialized) return null;

  const showLncForm = !hasSavedSession || showNewSession;

  return (
    <S.Wrapper>
      <S.Back onClick={() => store.appView.goTo('/')}>
        <ArrowLeft size={16} />
      </S.Back>

      <S.Header>
        <S.PageLabel>Connect</S.PageLabel>
        <S.Title>Connect Your Node</S.Title>
      </S.Header>

      <S.Content>
        <S.MethodToggle>
          <S.MethodBtn
            active={method === 'lnc'}
            onClick={() => {
              setMethod('lnc');
              setError('');
            }}
          >
            <Key size={14} />
            Lightning Node Connect
          </S.MethodBtn>
          <S.MethodBtn
            active={method === 'password'}
            onClick={() => {
              setMethod('password');
              setError('');
            }}
          >
            <Lock size={14} />
            Direct (Password)
          </S.MethodBtn>
        </S.MethodToggle>

        {method === 'lnc' && (
          <>
            {hasSavedSession && !showNewSession ? (
              <S.ReconnectPanel>
                <S.ReconnectLabel>
                  <Zap size={13} />
                  Saved session found — enter your password to reconnect.
                </S.ReconnectLabel>
                <S.Form onSubmit={handleLncConnect}>
                  <S.Input
                    type="password"
                    placeholder="LNC password"
                    value={lncPassword}
                    onChange={e => {
                      setLncPassword(e.target.value);
                      setError('');
                    }}
                    autoFocus
                  />
                  {error && (
                    <S.ErrorMsg>
                      <AlertCircle size={14} /> {error}
                    </S.ErrorMsg>
                  )}
                  <S.Btn type="submit" disabled={loading || !lncPassword.trim()}>
                    {loading ? (
                      <>
                        <S.Spinner size={16} />
                        Connecting...
                      </>
                    ) : (
                      'Reconnect'
                    )}
                  </S.Btn>
                </S.Form>
                <S.NewSessionBtn onClick={() => setShowNewSession(true)}>
                  <Key size={13} />
                  Use a new pairing phrase instead
                  <ChevronRight size={13} style={{ marginLeft: 2 }} />
                </S.NewSessionBtn>
              </S.ReconnectPanel>
            ) : (
              <S.Form onSubmit={handleLncConnect}>
                <S.Label>Pairing Phrase</S.Label>
                <S.TextArea
                  placeholder="Enter your 10-word pairing phrase"
                  value={pairingPhrase}
                  onChange={e => {
                    setPairingPhrase(e.target.value);
                    setError('');
                  }}
                  autoFocus
                />
                <S.Label>Password</S.Label>
                <S.Input
                  type="password"
                  placeholder="Choose a password to encrypt this session"
                  value={lncPassword}
                  onChange={e => {
                    setLncPassword(e.target.value);
                    setError('');
                  }}
                />
                {error && (
                  <S.ErrorMsg>
                    <AlertCircle size={14} /> {error}
                  </S.ErrorMsg>
                )}
                <S.Btn
                  type="submit"
                  disabled={loading || !pairingPhrase.trim() || !lncPassword.trim()}
                >
                  {loading ? (
                    <>
                      <S.Spinner size={16} />
                      Connecting...
                    </>
                  ) : (
                    'Connect'
                  )}
                </S.Btn>
              </S.Form>
            )}

            {showLncForm && (
              <>
                <S.HelpToggle onClick={() => setHelpOpen(!helpOpen)}>
                  <HelpCircle size={13} />
                  How to get your pairing phrase
                  {helpOpen ? (
                    <ChevronDown size={13} style={{ marginLeft: 2 }} />
                  ) : (
                    <ChevronRight size={13} style={{ marginLeft: 2 }} />
                  )}
                </S.HelpToggle>

                {helpOpen && (
                  <S.HelpContent>
                    <S.AgentCard>
                      <S.AgentCardHeader>
                        <S.AgentCardIcon>
                          <Sparkles size={13} />
                        </S.AgentCardIcon>
                        <S.AgentCardTitle>Generate with your AI agent</S.AgentCardTitle>
                      </S.AgentCardHeader>
                      <S.AgentCardDesc>
                        Copy this prompt into Cursor, Claude Code, or any AI agent.
                      </S.AgentCardDesc>
                      <S.PromptBox>
                        <S.PromptText>{AGENT_PROMPT}</S.PromptText>
                        <S.CopyBtn
                          onClick={copyAgentPrompt}
                          copied={copiedAgent}
                          title="Copy prompt"
                        >
                          {copiedAgent ? <Check size={12} /> : <Copy size={12} />}
                        </S.CopyBtn>
                      </S.PromptBox>
                    </S.AgentCard>

                    <S.AccordionGroup>
                      {providerHelp.map(p => (
                        <S.AccordionItem key={p.id}>
                          <S.AccordionHeader
                            onClick={() =>
                              setOpenProvider(prev => (prev === p.id ? null : p.id))
                            }
                          >
                            <S.AccordionLogo src={p.logo} alt={p.name} />
                            <S.AccordionName>{p.name}</S.AccordionName>
                            <S.AccordionChevron open={openProvider === p.id}>
                              <ChevronRight size={13} />
                            </S.AccordionChevron>
                          </S.AccordionHeader>
                          {openProvider === p.id && (
                            <S.AccordionBody>
                              {p.steps ? (
                                p.steps
                              ) : (
                                <>
                                  Run this on the machine where litd is running:
                                  <S.CommandBlock>
                                    {CMD}
                                    <S.SmallCopyBtn onClick={copyCommand}>
                                      {copiedCmd ? (
                                        <Check size={11} />
                                      ) : (
                                        <Copy size={11} />
                                      )}
                                    </S.SmallCopyBtn>
                                  </S.CommandBlock>
                                  Copy the <strong>10-word pairing phrase</strong> from
                                  the output.
                                </>
                              )}
                            </S.AccordionBody>
                          )}
                        </S.AccordionItem>
                      ))}
                    </S.AccordionGroup>
                  </S.HelpContent>
                )}
              </>
            )}
          </>
        )}

        {method === 'password' && (
          <>
            <S.Form onSubmit={handlePasswordSubmit}>
              <S.Label>UI Password</S.Label>
              <S.Input
                type="password"
                placeholder="Enter your litd password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setError('');
                }}
                autoFocus
              />
              {error && (
                <S.ErrorMsg>
                  <AlertCircle size={14} /> {error}
                </S.ErrorMsg>
              )}
              <S.Btn type="submit" disabled={loading || !password.trim()}>
                {loading ? (
                  <>
                    <S.Spinner size={16} />
                    Connecting...
                  </>
                ) : (
                  'Connect'
                )}
              </S.Btn>
            </S.Form>
            <S.SecurityNote>
              <Shield size={12} />
              Direct connection to litd on the same host.
            </S.SecurityNote>
          </>
        )}
        <S.FooterLink onClick={() => store.appView.goTo('/get-node')}>
          <Server size={13} />
          Don&apos;t have a node? Get one
          <ChevronRight size={13} style={{ marginLeft: 2 }} />
        </S.FooterLink>
      </S.Content>
    </S.Wrapper>
  );
};

export default observer(ConnectNodePage);
