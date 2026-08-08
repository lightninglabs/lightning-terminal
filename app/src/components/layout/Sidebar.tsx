import React, { useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useStore } from 'store';
import { BookOpen, Settings, Copy, Check } from 'lucide-react';
import NavMenu from './NavMenu';
import NodePicker from './NodePicker';
import OnboardingModal from '../tour/OnboardingModal';

const Styled = {
  Wrapper: styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0;
  `,
  NavSection: styled.div`
    flex: 1;
    padding: 8px 10px;
    overflow-y: auto;
  `,
  BottomSection: styled.div`
    padding: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    flex-direction: column;
    gap: 6px;
  `,
  OnboardingWidget: styled.button`
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    border: 1px solid rgba(99, 102, 241, 0.25);
    border-radius: 8px;
    background: rgba(99, 102, 241, 0.08);
    color: ${props => props.theme.colors.offWhite};
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      background: rgba(99, 102, 241, 0.14);
      border-color: rgba(99, 102, 241, 0.4);
    }
  `,
  WidgetIcon: styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    opacity: 0.8;
  `,
  WidgetText: styled.span`
    flex: 1;
    text-align: left;
  `,
  WidgetBadge: styled.span`
    font-size: 10px;
    font-weight: 600;
    background: ${props => props.theme.colors.iris};
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    letter-spacing: 0.02em;
  `,
  NodeInfoButton: styled.button`
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: ${props => props.theme.colors.offWhite};
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.06);
    }
  `,
  NodeDot: styled.span<{ online?: boolean }>`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${props =>
      props.online ? props.theme.colors.green : props.theme.colors.gray};
    flex-shrink: 0;
  `,
  NodeLabel: styled.span`
    flex: 1;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  SettingsIcon: styled.span`
    display: flex;
    align-items: center;
    opacity: 0.4;
    transition: opacity 0.15s ease;
    &:hover {
      opacity: 0.9;
    }
  `,
  CopyNodeBtn: styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    border: 1px solid rgba(139, 92, 246, 0.12);
    border-radius: 8px;
    background: rgba(139, 92, 246, 0.05);
    color: rgba(255, 255, 255, 0.5);
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    overflow: hidden;

    &:hover {
      background: rgba(139, 92, 246, 0.1);
      border-color: rgba(139, 92, 246, 0.25);
      color: rgba(255, 255, 255, 0.7);
    }
  `,
  CopyIcon: styled.span`
    display: flex;
    align-items: center;
    flex-shrink: 0;
    color: #a78bfa;
  `,
  PubkeyText: styled.span`
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 10px;
    letter-spacing: 0.02em;
  `,
};

const Sidebar: React.FC = () => {
  const { nodeStore, appView } = useStore();
  const alias = nodeStore.alias || 'My Node';
  const pubkey = nodeStore.pubkey || '';
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyNodeId = useCallback(async () => {
    if (!pubkey) return;
    try {
      await navigator.clipboard.writeText(pubkey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = pubkey;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [pubkey]);

  const {
    Wrapper,
    NavSection,
    BottomSection,
    OnboardingWidget,
    WidgetIcon,
    WidgetText,
    WidgetBadge,
    NodeInfoButton,
    NodeDot,
    NodeLabel,
    SettingsIcon,
    CopyNodeBtn,
    CopyIcon,
    PubkeyText,
  } = Styled;

  return (
    <Wrapper>
      <NodePicker />
      <NavSection>
        <NavMenu />
      </NavSection>
      <BottomSection>
        {pubkey && (
          <CopyNodeBtn
            onClick={handleCopyNodeId}
            title="Copy your Node ID to share with peers"
          >
            <CopyIcon>
              {copied ? (
                <Check size={12} strokeWidth={2} />
              ) : (
                <Copy size={12} strokeWidth={1.5} />
              )}
            </CopyIcon>
            <PubkeyText>{copied ? 'Copied!' : pubkey}</PubkeyText>
          </CopyNodeBtn>
        )}
        <OnboardingWidget onClick={() => setShowOnboarding(true)}>
          <WidgetIcon>
            <BookOpen size={14} strokeWidth={1.5} />
          </WidgetIcon>
          <WidgetText>Get Started</WidgetText>
          <WidgetBadge>Guide</WidgetBadge>
        </OnboardingWidget>
        <NodeInfoButton onClick={appView.goToSettings}>
          <NodeDot online={true} />
          <NodeLabel>{alias}</NodeLabel>
          <SettingsIcon>
            <Settings size={14} strokeWidth={1.5} />
          </SettingsIcon>
        </NodeInfoButton>
      </BottomSection>
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
    </Wrapper>
  );
};

export default observer(Sidebar);
