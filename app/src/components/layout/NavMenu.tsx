import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Badge, HeaderFour } from 'components/base';
import { PUBLIC_URL } from '../../config';

const Styled = {
  NavHeader: styled(HeaderFour)`
    padding: 44px 14px 8px;
    font-size: 10px;
    line-height: 16px;
  `,
  Nav: styled.ul`
    padding-left: 0;
    margin-bottom: 0;
    list-style: none;
  `,
  NavItem: styled.li`
    font-size: ${props => props.theme.sizes.xs};
    margin-right: -17px;

    > span {
      display: block;
      height: 50px;
      line-height: 50px;
      padding: 0 12px;
      border-left: 3px solid transparent;
      color: ${props => props.theme.colors.offWhite};
      cursor: pointer;

      &:hover {
        text-decoration: none;
        border-left: 3px solid ${props => props.theme.colors.pink};
        background-color: ${props => props.theme.colors.overlay};
      }
    }

    &.active > span {
      border-left: 3px solid ${props => props.theme.colors.offWhite};
      background-color: ${props => props.theme.colors.blue};

      &:hover {
        border-left: 3px solid ${props => props.theme.colors.pink};
      }
    }
  `,
};

const NavItem: React.FC<{
  page: string;
  badge?: string;
  onClick: () => void;
}> = observer(({ page, badge, onClick }) => {
  const { l } = usePrefixedTranslation('cmps.layout.NavMenu');
  const { router } = useStore();
  const className = router.location.pathname.startsWith(`${PUBLIC_URL}/${page}`)
    ? 'active'
    : '';

  return (
    <Styled.NavItem className={className}>
      <span onClick={onClick}>
        {l(page)}
        {badge && (
          <sup>
            <Badge muted>{badge}</Badge>
          </sup>
        )}
      </span>
    </Styled.NavItem>
  );
});

const NavMenu: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.layout.NavMenu');
  const { appView } = useStore();

  const { NavHeader, Nav } = Styled;
  return (
    <>
      <Nav>
        <NavItem page="home" onClick={appView.goToHome} />
        <NavItem page="settings" onClick={appView.goToSettings} />
      </Nav>
      <NavHeader>{l('liquidityHeader')}</NavHeader>
      <Nav>
        <NavItem page="loop" onClick={appView.goToLoop} />
        <NavItem page="history" onClick={appView.goToHistory} />
        <NavItem page="pool" badge={l('common.preview')} onClick={appView.goToPool} />
      </Nav>
      <NavHeader>{l('connectHeader')}</NavHeader>
      <Nav>
        <NavItem page="connect" badge={l('common.beta')} onClick={appView.goToConnect} />
      </Nav>
    </>
  );
};

export default observer(NavMenu);
