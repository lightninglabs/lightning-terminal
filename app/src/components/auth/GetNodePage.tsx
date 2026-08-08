import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { useStore } from 'store';
import {
  ArrowLeft,
  ExternalLink,
  Sparkles,
  Copy,
  Check,
  ChevronRight,
} from 'lucide-react';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const S = {
  Wrapper: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100%;
    padding: 60px 24px 60px;
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
    margin-bottom: 48px;
    animation: ${fadeUp} 0.5s ease both;
  `,
  PageLabel: styled.div`
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: rgba(255, 255, 255, 0.3);
    margin-bottom: 12px;
  `,
  Title: styled.h1`
    font-size: 36px;
    font-weight: 600;
    letter-spacing: -0.03em;
    color: #ffffff;
    margin: 0 0 10px;
  `,
  Subtitle: styled.p`
    font-size: 14px;
    color: rgba(255, 255, 255, 0.35);
    margin: 0;
    max-width: 420px;
    line-height: 1.6;
  `,
  Section: styled.div`
    width: 100%;
    max-width: 600px;
    margin-bottom: 40px;
    animation: ${fadeUp} 0.5s ease both;
    animation-delay: 0.1s;
  `,
  SectionLabel: styled.div`
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: rgba(255, 255, 255, 0.25);
    margin-bottom: 16px;
    padding-left: 4px;
  `,
  ProviderGrid: styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;

    @media (max-width: 620px) {
      grid-template-columns: 1fr;
    }
  `,
  ProviderTile: styled.a`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 22px 18px;
    background: rgba(18, 20, 28, 0.92);
    border: none;
    border-radius: 16px;
    text-decoration: none;
    color: #e5e7eb;
    cursor: pointer;
    transition: background 0.2s ease;
    min-height: 140px;

    &:hover {
      background: rgba(28, 31, 42, 0.95);
    }
  `,
  ProviderLogo: styled.img`
    width: 36px;
    height: 36px;
    border-radius: 8px;
    margin-bottom: 16px;
    object-fit: cover;
  `,
  ProviderName: styled.div`
    font-size: 15px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 5px;
  `,
  ProviderDesc: styled.div`
    font-size: 12px;
    color: rgba(255, 255, 255, 0.35);
    line-height: 1.45;
  `,
  ProviderArrow: styled.div`
    position: absolute;
    top: 22px;
    right: 18px;
    color: rgba(255, 255, 255, 0.12);
  `,
  AgentCard: styled.div`
    background: rgba(18, 20, 28, 0.92);
    border-radius: 16px;
    padding: 24px;
  `,
  AgentCardHeader: styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  `,
  AgentCardIcon: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(139, 92, 246, 0.12);
    color: rgba(167, 139, 250, 0.9);
  `,
  AgentCardTitle: styled.div`
    font-size: 15px;
    font-weight: 600;
    color: #ffffff;
  `,
  AgentCardDesc: styled.p`
    font-size: 13px;
    color: rgba(255, 255, 255, 0.35);
    line-height: 1.55;
    margin: 0 0 16px;
  `,
  PromptBox: styled.div`
    position: relative;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(139, 92, 246, 0.12);
    border-radius: 12px;
    padding: 16px 48px 16px 16px;
    margin-bottom: 14px;
  `,
  PromptText: styled.div`
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 12px;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.5);
    white-space: pre-wrap;
    word-break: break-word;
  `,
  CopyBtn: styled.button<{ copied?: boolean }>`
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    border: none;
    background: ${p =>
      p.copied ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.06)'};
    color: ${p => (p.copied ? 'rgba(52, 211, 153, 0.9)' : 'rgba(255, 255, 255, 0.35)')};
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      background: ${p =>
        p.copied ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
      color: ${p => (p.copied ? 'rgba(52, 211, 153, 1)' : 'rgba(255, 255, 255, 0.6)')};
    }
  `,
  AgentSteps: styled.div`
    display: flex;
    gap: 20px;
    margin-top: 2px;

    @media (max-width: 500px) {
      flex-direction: column;
      gap: 6px;
    }
  `,
  AgentStep: styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.25);
  `,
  StepNum: styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
    font-size: 10px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.35);
    flex-shrink: 0;
  `,
  DocLink: styled.a`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.3);
    text-decoration: none;
    margin-top: 14px;
    transition: color 0.15s ease;
    &:hover {
      color: rgba(255, 255, 255, 0.7);
    }
  `,
  Footer: styled.div`
    text-align: center;
    animation: ${fadeUp} 0.5s ease both;
    animation-delay: 0.2s;
  `,
  FooterNote: styled.p`
    font-size: 12px;
    color: rgba(255, 255, 255, 0.2);
    max-width: 420px;
    line-height: 1.6;
    margin: 0;
  `,
  FooterLink: styled.button`
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    font-family: inherit;
    font-size: inherit;
    padding: 0;
    &:hover {
      color: #ffffff;
    }
  `,
};

const providers = [
  {
    name: 'Voltage',
    desc: 'Cloud Lightning nodes. Pay monthly, no hardware.',
    url: 'https://voltage.cloud',
    logo: '/icons/voltage.png',
  },
  {
    name: 'Umbrel',
    desc: 'Personal home server. App store with Lightning.',
    url: 'https://umbrel.com',
    logo: '/icons/umbrel.png',
  },
  {
    name: 'Start9',
    desc: 'Sovereign computing. Run your own server.',
    url: 'https://start9.com',
    logo: '/icons/start9.png',
  },
];

const AGENT_PROMPT = `Download and install Lightning Terminal (litd) from github.com/lightninglabs/lightning-terminal/releases for my operating system. Extract the release, then start litd with the following flags:

  --lnd-mode=integrated
  --network=mainnet
  --uipassword=<ask me to choose a password>

Use Neutrino as the Bitcoin backend if I don't have a synced Bitcoin Core node. Once litd is running and healthy, generate a Lightning Node Connect pairing phrase by running:

  litcli sessions add --type admin

Give me the pairing phrase so I can connect my node.

Refer to the docs at docs.lightning.engineering/lightning-network-tools/lightning-terminal if you need more details.`;

const GetNodePage: React.FC = () => {
  const store = useStore();
  const [copied, setCopied] = useState(false);

  if (!store.initialized) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(AGENT_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <S.Wrapper>
      <S.Back onClick={() => store.appView.goTo('/')}>
        <ArrowLeft size={16} />
      </S.Back>

      <S.Header>
        <S.PageLabel>Get Started</S.PageLabel>
        <S.Title>Get a Node</S.Title>
        <S.Subtitle>
          Choose a hosted provider for the easiest setup, or spin up your own with an AI
          agent.
        </S.Subtitle>
      </S.Header>

      <S.Section>
        <S.SectionLabel>Providers</S.SectionLabel>
        <S.ProviderGrid>
          {providers.map(p => (
            <S.ProviderTile key={p.name} href={p.url} target="_blank" rel="noopener">
              <S.ProviderArrow>
                <ExternalLink size={13} />
              </S.ProviderArrow>
              <S.ProviderLogo src={p.logo} alt={p.name} />
              <S.ProviderName>{p.name}</S.ProviderName>
              <S.ProviderDesc>{p.desc}</S.ProviderDesc>
            </S.ProviderTile>
          ))}
        </S.ProviderGrid>
      </S.Section>

      <S.Section style={{ animationDelay: '0.15s' }}>
        <S.SectionLabel>Run Your Own</S.SectionLabel>
        <S.AgentCard>
          <S.AgentCardHeader>
            <S.AgentCardIcon>
              <Sparkles size={16} />
            </S.AgentCardIcon>
            <S.AgentCardTitle>Set up with your AI agent</S.AgentCardTitle>
          </S.AgentCardHeader>
          <S.AgentCardDesc>
            Copy this prompt and paste it into your AI coding agent (Cursor, Windsurf,
            Claude Code, etc.) to set up a Lightning node on your machine.
          </S.AgentCardDesc>

          <S.PromptBox>
            <S.PromptText>{AGENT_PROMPT}</S.PromptText>
            <S.CopyBtn onClick={handleCopy} copied={copied} title="Copy prompt">
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </S.CopyBtn>
          </S.PromptBox>

          <S.AgentSteps>
            <S.AgentStep>
              <S.StepNum>1</S.StepNum>
              Copy prompt
            </S.AgentStep>
            <S.AgentStep>
              <S.StepNum>2</S.StepNum>
              Paste into your agent
            </S.AgentStep>
            <S.AgentStep>
              <S.StepNum>3</S.StepNum>
              Follow along as it installs
            </S.AgentStep>
          </S.AgentSteps>

          <S.DocLink
            href="https://docs.lightning.engineering/lightning-network-tools/lightning-terminal"
            target="_blank"
            rel="noopener noreferrer"
          >
            Full documentation <ChevronRight size={11} style={{ verticalAlign: -1 }} />
          </S.DocLink>
        </S.AgentCard>
      </S.Section>

      <S.Footer>
        <S.FooterNote>
          Once your node is running, generate a pairing phrase with{' '}
          <code style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            litcli sessions add
          </code>{' '}
          and come back to{' '}
          <S.FooterLink onClick={() => store.appView.goTo('/connect-node')}>
            Connect Your Node
          </S.FooterLink>
          .
        </S.FooterNote>
      </S.Footer>
    </S.Wrapper>
  );
};

export default observer(GetNodePage);
