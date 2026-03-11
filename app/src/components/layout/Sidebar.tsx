import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useStore } from 'store';
import { BookOpen, Settings } from 'lucide-react';
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
};

const Sidebar: React.FC = () => {
  const { nodeStore, appView } = useStore();
  const alias = nodeStore.alias || 'My Node';
  const [showOnboarding, setShowOnboarding] = useState(false);

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
  } = Styled;

  return (
    <Wrapper>
      <NodePicker />
      <NavSection>
        <NavMenu />
      </NavSection>
      <BottomSection>
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
