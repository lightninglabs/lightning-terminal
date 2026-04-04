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
} from 'lucide-react';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

// #region Styles
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
    margin-bottom: 32px;
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
    margin: 0 0 8px;
  `,
  Subtitle: styled.p`
    font-size: 14px;
    color: rgba(255, 255, 255, 0.35);
    margin: 0;
    max-width: 420px;
    line-height: 1.6;
  `,
  Content: styled.div`
    width: 100%;
    max-width: 480px;
    animation: ${fadeUp} 0.5s ease both;
    animation-delay: 0.1s;
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
  Panel: styled.div`
    background: rgba(18, 20, 28, 0.92);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 16px;
  `,
  PanelTitle: styled.h3`
    font-size: 15px;
    font-weight: 600;
    margin: 0 0 6px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #ffffff;
    svg {
      color: rgba(255, 255, 255, 0.4);
    }
  `,
  PanelDesc: styled.p`
    font-size: 13px;
    color: rgba(255, 255, 255, 0.35);
    margin: 0 0 18px;
    line-height: 1.6;
  `,
  Form: styled.form`
    display: flex;
    flex-direction: column;
    gap: 14px;
  `,
  Label: styled.label`
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(255, 255, 255, 0.3);
    margin-bottom: -8px;
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
    min-height: 56px;
    resize: vertical;
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
    height: 46px;
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
    margin: 8px 0;
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: rgba(255, 255, 255, 0.15);

    &::before,
    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(255, 255, 255, 0.06);
    }
  `,
  HelpSection: styled.div`
    animation: ${fadeUp} 0.5s ease both;
    animation-delay: 0.15s;
  `,
  HelpHeader: styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.3);
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    padding: 8px 0;
    margin-bottom: 4px;
    transition: color 0.15s ease;
    &:hover {
      color: rgba(255, 255, 255, 0.5);
    }
  `,
  AgentCard: styled.div`
    background: rgba(18, 20, 28, 0.92);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 12px;
  `,
  AgentCardHeader: styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
  `,
  AgentCardIcon: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 7px;
    background: rgba(139, 92, 246, 0.12);
    color: rgba(167, 139, 250, 0.9);
  `,
  AgentCardTitle: styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
  `,
  AgentCardDesc: styled.p`
    font-size: 12px;
    color: rgba(255, 255, 255, 0.3);
    line-height: 1.5;
    margin: 0 0 12px;
  `,
  PromptBox: styled.div`
    position: relative;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(139, 92, 246, 0.12);
    border-radius: 10px;
    padding: 14px 44px 14px 14px;
  `,
  PromptText: styled.div`
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 11px;
    line-height: 1.65;
    color: rgba(255, 255, 255, 0.45);
    white-space: pre-wrap;
    word-break: break-word;
  `,
  CopyBtn: styled.button<{ copied?: boolean }>`
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 7px;
    border: none;
    background: ${p =>
      p.copied ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.06)'};
    color: ${p => (p.copied ? 'rgba(52, 211, 153, 0.9)' : 'rgba(255, 255, 255, 0.3)')};
    cursor: pointer;
    transition: all 0.15s ease;
    &:hover {
      background: ${p =>
        p.copied ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
      color: ${p => (p.copied ? 'rgba(52, 211, 153, 1)' : 'rgba(255, 255, 255, 0.6)')};
    }
  `,
  AccordionGroup: styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
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
    gap: 12px;
    padding: 14px 16px;
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
    width: 22px;
    height: 22px;
    border-radius: 5px;
    object-fit: cover;
  `,
  AccordionName: styled.span`
    flex: 1;
  `,
  AccordionChevron: styled.div<{ open?: boolean }>`
    color: rgba(255, 255, 255, 0.2);
    transform: ${p => (p.open ? 'rotate(90deg)' : 'rotate(0)')};
    transition: transform 0.15s ease;
    display: flex;
    align-items: center;
  `,
  AccordionBody: styled.div`
    padding: 0 16px 16px;
    font-size: 12px;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.35);

    ol {
      padding-left: 18px;
      margin: 0;
    }
    li {
      margin-bottom: 3px;
    }
    strong {
      color: rgba(255, 255, 255, 0.6);
    }
    code {
      background: rgba(0, 0, 0, 0.35);
      padding: 1px 5px;
      border-radius: 4px;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.45);
    }
  `,
  CommandBlock: styled.div`
    position: relative;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 8px;
    padding: 10px 38px 10px 12px;
    margin: 8px 0 10px;
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.45);
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
    color: rgba(255, 255, 255, 0.25);
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.15s ease;
    &:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.1);
    }
  `,
  ReconnectPanel: styled.div`
    background: rgba(18, 20, 28, 0.92);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 20px;
  `,
  Footer: styled.div`
    margin-top: 8px;
    text-align: center;
    animation: ${fadeUp} 0.5s ease both;
    animation-delay: 0.15s;
  `,
  FooterLink: styled.button`
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.25);
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;
    &:hover {
      color: rgba(255, 255, 255, 0.5);
    }
  `,
};
// #endregion

const CMD = 'litcli sessions add --label="Lightning Terminal Web" --type admin';

const AGENT_PROMPT = `I need to generate a Lightning Node Connect pairing phrase from my running litd (Lightning Terminal) instance. Run this command:

litcli sessions add --label="Lightning Terminal Web" --type admin

Give me the 10-word pairing phrase from the output so I can connect my node.`;

const providerInstructions: {
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
        <li>Log in to your Voltage dashboard</li>
        <li>
          Select your node and go to <strong>Connect</strong>
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
          Open <strong>Lightning Terminal</strong> from your Umbrel dashboard
        </li>
        <li>
          Go to <strong>Lightning Node Connect</strong> in the settings
        </li>
        <li>
          Click <strong>Create</strong> to generate a new session
        </li>
        <li>Copy the 10-word pairing phrase</li>
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
          Open <strong>Lightning Terminal</strong> on your Start9 server
        </li>
        <li>
          Navigate to <strong>Properties</strong>
        </li>
        <li>
          Find the <strong>LNC Pairing Phrase</strong> field
        </li>
        <li>Copy the 10-word phrase</li>
      </ol>
    ),
  },
  {
    id: 'self',
    name: 'Self-Hosted (litd)',
    logo: '/icons/Lit.png',
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
      // fallback
    }
  };

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(CMD);
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    } catch {
      // fallback
    }
  };

  const toggleProvider = (id: string) => {
    setOpenProvider(prev => (prev === id ? null : id));
  };

  const handleLncConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (hasSavedSession && !pairingPhrase.trim()) {
        await store.authStore.reconnectLnc(lncPassword);
      } else {
        await store.authStore.loginWithLnc(pairingPhrase, lncPassword);
      }
    } catch (err: any) {
      setError(err?.message || 'Connection failed');
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

  return (
    <S.Wrapper>
      <S.Back onClick={() => store.appView.goTo('/')}>
        <ArrowLeft size={16} />
      </S.Back>

      <S.Header>
        <S.PageLabel>Connect</S.PageLabel>
        <S.Title>Connect Your Node</S.Title>
        <S.Subtitle>
          Securely connect to your Lightning node. Your keys never leave your node.
        </S.Subtitle>
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
            {hasSavedSession ? (
              <S.ReconnectPanel>
                <S.PanelTitle>
                  <Zap size={16} />
                  Reconnect
                </S.PanelTitle>
                <S.PanelDesc>
                  You have a saved session. Enter your password to reconnect, or use a new
                  pairing phrase below.
                </S.PanelDesc>
                <S.Form onSubmit={handleLncConnect}>
                  <S.Label>Password</S.Label>
                  <S.Input
                    type="password"
                    placeholder="Enter your LNC password"
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
                        <Loader2
                          size={16}
                          style={{ animation: 'spin 1s linear infinite' }}
                        />
                        Connecting...
                      </>
                    ) : (
                      'Reconnect'
                    )}
                  </S.Btn>
                </S.Form>
              </S.ReconnectPanel>
            ) : (
              <S.Panel>
                <S.PanelTitle>
                  <Key size={16} />
                  Enter Pairing Phrase
                </S.PanelTitle>
                <S.PanelDesc>
                  Paste your 10-word pairing phrase and choose a password to encrypt your
                  session.
                </S.PanelDesc>
                <S.Form onSubmit={handleLncConnect}>
                  <S.Label>Pairing Phrase</S.Label>
                  <S.TextArea
                    placeholder="Enter your 10-word pairing phrase..."
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
                        <Loader2
                          size={16}
                          style={{ animation: 'spin 1s linear infinite' }}
                        />
                        Connecting...
                      </>
                    ) : (
                      'Connect'
                    )}
                  </S.Btn>
                </S.Form>
              </S.Panel>
            )}

            <S.Divider>or</S.Divider>

            <S.HelpSection>
              <S.HelpHeader onClick={() => setHelpOpen(!helpOpen)}>
                <HelpCircle size={14} />
                Need a pairing phrase?
                {helpOpen ? (
                  <ChevronDown size={14} style={{ marginLeft: 'auto' }} />
                ) : (
                  <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
                )}
              </S.HelpHeader>

              {helpOpen && (
                <>
                  <S.AgentCard>
                    <S.AgentCardHeader>
                      <S.AgentCardIcon>
                        <Sparkles size={14} />
                      </S.AgentCardIcon>
                      <S.AgentCardTitle>Generate with your AI agent</S.AgentCardTitle>
                    </S.AgentCardHeader>
                    <S.AgentCardDesc>
                      Copy this prompt and paste it into your AI coding agent to generate a
                      pairing phrase from your running node.
                    </S.AgentCardDesc>
                    <S.PromptBox>
                      <S.PromptText>{AGENT_PROMPT}</S.PromptText>
                      <S.CopyBtn
                        onClick={copyAgentPrompt}
                        copied={copiedAgent}
                        title="Copy prompt"
                      >
                        {copiedAgent ? <Check size={13} /> : <Copy size={13} />}
                      </S.CopyBtn>
                    </S.PromptBox>
                  </S.AgentCard>

                  <S.AccordionGroup>
                    {providerInstructions.map(p => (
                      <S.AccordionItem key={p.id}>
                        <S.AccordionHeader onClick={() => toggleProvider(p.id)}>
                          <S.AccordionLogo src={p.logo} alt={p.name} />
                          <S.AccordionName>{p.name}</S.AccordionName>
                          <S.AccordionChevron open={openProvider === p.id}>
                            <ChevronRight size={14} />
                          </S.AccordionChevron>
                        </S.AccordionHeader>
                        {openProvider === p.id && (
                          <S.AccordionBody>
                            {p.steps ? (
                              p.steps
                            ) : (
                              <>
                                Run this command where litd is running:
                                <S.CommandBlock>
                                  {CMD}
                                  <S.SmallCopyBtn onClick={copyCommand}>
                                    {copiedCmd ? (
                                      <Check size={12} />
                                    ) : (
                                      <Copy size={12} />
                                    )}
                                  </S.SmallCopyBtn>
                                </S.CommandBlock>
                                Copy the <strong>10-word pairing phrase</strong> from the
                                output.
                              </>
                            )}
                          </S.AccordionBody>
                        )}
                      </S.AccordionItem>
                    ))}
                  </S.AccordionGroup>
                </>
              )}
            </S.HelpSection>
          </>
        )}

        {method === 'password' && (
          <S.Panel>
            <S.PanelTitle>
              <Lock size={16} />
              Direct Connection
            </S.PanelTitle>
            <S.PanelDesc>Connect directly to litd running on the same host.</S.PanelDesc>
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
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Connecting...
                  </>
                ) : (
                  'Connect'
                )}
              </S.Btn>
            </S.Form>
          </S.Panel>
        )}
      </S.Content>

      <S.Footer>
        <S.FooterLink onClick={() => store.appView.goTo('/get-node')}>
          Don&apos;t have a node? Get one &rarr;
        </S.FooterLink>
      </S.Footer>
    </S.Wrapper>
  );
};

export default observer(ConnectNodePage);
