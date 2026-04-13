import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import styled from '@emotion/styled';
import { useStore } from 'store';
import { Zap, Waypoints, ArrowLeftRight, Compass, Rocket, X } from 'lucide-react';

const STEP_ICON_SIZE = 22;
const STEP_ICON_STROKE = 1.5;

const STEPS = [
  {
    id: 'welcome',
    icon: <Zap size={STEP_ICON_SIZE} strokeWidth={STEP_ICON_STROKE} />,
    title: 'Welcome to Lightning Terminal',
    body:
      'Lightning Terminal gives you a visual interface to manage your Lightning node, channels, and liquidity — all in one place.',
    detail:
      'Whether you want to monitor channel health, rebalance liquidity, or open new channels, LiT makes it simple.',
  },
  {
    id: 'graph',
    icon: <Waypoints size={STEP_ICON_SIZE} strokeWidth={STEP_ICON_STROKE} />,
    title: 'Your Node Graph',
    body:
      'The Graph tab shows a live 3D visualization of your node and every channel connected to it.',
    detail:
      'Node size reflects capacity. Hover over any node or channel to see details like balance, capacity, and status. The graph rotates slowly and pauses when you interact.',
  },
  {
    id: 'liquidity',
    icon: <ArrowLeftRight size={STEP_ICON_SIZE} strokeWidth={STEP_ICON_STROKE} />,
    title: 'Manage Liquidity',
    body:
      'The Liquidity tab lets you rebalance your channels using Loop — moving funds on-chain or off-chain to optimize your routing.',
    detail:
      'Use "Rebalance" to perform Loop In (buy inbound) or Loop Out (move funds on-chain). Select channels and choose the direction that fits your needs.',
  },
  {
    id: 'explore',
    icon: <Compass size={STEP_ICON_SIZE} strokeWidth={STEP_ICON_STROKE} />,
    title: 'Explore the Network',
    body: 'Browse your channels, connected peers, and assets in the Explore tab.',
    detail:
      'See all your channels at a glance with capacity, status, and balance info. Use this to identify which channels need attention.',
  },
  {
    id: 'ready',
    icon: <Rocket size={STEP_ICON_SIZE} strokeWidth={STEP_ICON_STROKE} />,
    title: "You're Ready",
    body:
      "That's all you need to get started. You can revisit this guide anytime from the sidebar.",
    detail:
      'Check out the docs at docs.lightning.engineering for deeper dives into Loop, Pool, and channel management.',
  },
];

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  width: 520px;
  max-width: 90vw;
  max-height: 85vh;
  background: #141720;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
`;

const StepIndicator = styled.div`
  display: flex;
  gap: 6px;
`;

const Dot = styled.button<{ active: boolean; visited: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${p =>
    p.active ? '#6366f1' : p.visited ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.12)'};
  transform: ${p => (p.active ? 'scale(1.3)' : 'scale(1)')};

  &:hover {
    background: ${p => (p.active ? '#6366f1' : 'rgba(99,102,241,0.6)')};
  }
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.15s ease;
  line-height: 1;

  &:hover {
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.06);
  }
`;

const Body = styled.div`
  padding: 32px 24px 24px;
  flex: 1;
`;

const StepIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.35);
  color: #a78bfa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 12px;
  letter-spacing: -0.02em;
`;

const BodyText = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 12px;
`;

const Detail = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
`;

const SecondaryBtn = styled.button`
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    color: rgba(255, 255, 255, 0.9);
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.04);
  }
`;

const PrimaryBtn = styled.button`
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  background: #6366f1;
  color: white;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #5355d4;
  }
`;

const StepCount = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  font-variant-numeric: tabular-nums;
`;

interface Props {
  onClose: () => void;
}

const OnboardingModal: React.FC<Props> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const { settingsStore } = useStore();
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  const handleNext = useCallback(() => {
    if (isLast) {
      settingsStore.tourAutoShown = true;
      onClose();
    } else {
      setStep(s => s + 1);
    }
  }, [isLast, onClose, settingsStore]);

  const handleBack = useCallback(() => {
    if (!isFirst) setStep(s => s - 1);
  }, [isFirst]);

  const handleSkip = useCallback(() => {
    settingsStore.tourAutoShown = true;
    onClose();
  }, [onClose, settingsStore]);

  return ReactDOM.createPortal(
    <Overlay onClick={handleSkip}>
      <Modal onClick={e => e.stopPropagation()}>
        <Header>
          <StepIndicator>
            {STEPS.map((s, i) => (
              <Dot
                key={s.id}
                active={i === step}
                visited={i < step}
                onClick={() => setStep(i)}
              />
            ))}
          </StepIndicator>
          <CloseBtn onClick={handleSkip}>
            <X size={16} strokeWidth={1.5} />
          </CloseBtn>
        </Header>
        <Body>
          <StepIcon>{current.icon}</StepIcon>
          <Title>{current.title}</Title>
          <BodyText>{current.body}</BodyText>
          <Detail>{current.detail}</Detail>
        </Body>
        <Footer>
          <div>
            {isFirst ? (
              <SecondaryBtn onClick={handleSkip}>Skip</SecondaryBtn>
            ) : (
              <SecondaryBtn onClick={handleBack}>Back</SecondaryBtn>
            )}
          </div>
          <StepCount>
            {step + 1} / {STEPS.length}
          </StepCount>
          <PrimaryBtn onClick={handleNext}>{isLast ? 'Get Started' : 'Next'}</PrimaryBtn>
        </Footer>
      </Modal>
    </Overlay>,
    document.body,
  );
};

export default OnboardingModal;
