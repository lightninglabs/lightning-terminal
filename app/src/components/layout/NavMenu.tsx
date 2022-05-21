import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Badge, HeaderFour } from 'components/base';
import { PUBLIC_URL } from '../../config';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const Styled = {
  NavHeader: styled(HeaderFour)`
    padding: 8px 14px;
  `,
  Nav: styled.ul`
    padding-left: 0;
    margin-bottom: 0;
    list-style: none;
  `,
  NavItem: styled.li`
    font-size: ${props => props.theme.sizes.xs};
    margin-right: -17px;

    > a > span {
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

    &.active > a > span {
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
}> = observer(({ page, badge }) => {
  const { l } = usePrefixedTranslation('cmps.layout.NavMenu');
  const { settingsStore, log } = useStore();
  const location = useLocation();
  const className = location.pathname.startsWith(`/${page}`) ? 'active' : '';

  const onClick = () => {
    settingsStore.autoCollapseSidebar();
    log.info(`Go to the ${page} page`);
  };
  return (
    <Styled.NavItem className={className}>
      <Link to={`/${page}`} onClick={onClick}>
        <span>
          {l(page)}
          {badge && (
            <sup>
              <Badge muted>{badge}</Badge>
            </sup>
          )}
        </span>
      </Link>
    </Styled.NavItem>
  );
});

const NavMenu: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.layout.NavMenu');
  const { NavHeader, Nav } = Styled;
  return (
    <>
      <NavHeader>{l('menu')}</NavHeader>
      <Nav>
        <NavItem page="loop" />
        <NavItem page="history" />
        <NavItem page="pool" badge={l('common.preview')} />
        <NavItem page="settings" />
        <NavItem page="connect" badge={l('common.beta')} />
      </Nav>
    </>
  );
};

export default observer(NavMenu);
