import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useStore } from 'store';
import { PUBLIC_URL } from '../../config';
import { Waypoints, Activity, ArrowLeftRight, Zap } from 'lucide-react';

const Styled = {
  Nav: styled.ul`
    padding-left: 0;
    margin-bottom: 0;
    list-style: none;
  `,
  NavItem: styled.li`
    margin-bottom: 2px;

    > span {
      display: flex;
      align-items: center;
      gap: 10px;
      height: 38px;
      padding: 0 12px;
      border-radius: 8px;
      color: ${props => props.theme.colors.gray};
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      letter-spacing: -0.01em;

      &:hover {
        color: ${props => props.theme.colors.white};
        background-color: rgba(255, 255, 255, 0.06);
      }
    }

    &.active > span {
      color: ${props => props.theme.colors.white};
      background-color: rgba(255, 255, 255, 0.08);
    }
  `,
  NavIcon: styled.span`
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    opacity: 0.7;
  `,
  NavLabel: styled.span`
    flex: 1;
  `,
  NavBadge: styled.span`
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(99, 102, 241, 0.15);
    color: ${props => props.theme.colors.iris};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `,
};

interface NavItemProps {
  page: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = observer(
  ({ page, label, icon, badge, active, onClick }) => {
    const { router } = useStore();
    const isActive =
      active !== undefined
        ? active
        : router.location.pathname.startsWith(`${PUBLIC_URL}/${page}`);
    const className = isActive ? 'active' : '';

    return (
      <Styled.NavItem className={className}>
        <span onClick={onClick}>
          <Styled.NavIcon>{icon}</Styled.NavIcon>
          <Styled.NavLabel>{label}</Styled.NavLabel>
          {badge && <Styled.NavBadge>{badge}</Styled.NavBadge>}
        </span>
      </Styled.NavItem>
    );
  },
);

const ICON_SIZE = 16;
const ICON_STROKE = 1.5;

const NavMenu: React.FC = () => {
  const { appView, router, nodeConnectionStore } = useStore();
  const onHome = router.location.pathname.startsWith(`${PUBLIC_URL}/home`);
  const myNodeLabel = nodeConnectionStore.hasMultipleConnected ? 'My Nodes' : 'My Node';

  const { Nav } = Styled;
  return (
    <Nav>
      <NavItem
        page="home"
        label="Network"
        active={onHome && appView.graphViewMode === 'network'}
        icon={<Waypoints size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
        onClick={appView.goToNetwork}
      />
      <NavItem
        page="home"
        label={myNodeLabel}
        active={onHome && appView.graphViewMode === 'mynode'}
        icon={<Zap size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
        onClick={appView.goToMyNode}
      />
      <NavItem
        page="history"
        label="Activity"
        icon={<Activity size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
        onClick={appView.goToHistory}
      />
      <NavItem
        page="loop"
        label="Liquidity"
        icon={<ArrowLeftRight size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
        onClick={appView.goToLoop}
      />
    </Nav>
  );
};

export default observer(NavMenu);
