import React from 'react';
import { usePrefixedTranslation } from 'hooks';
import { Title } from 'components/common/text';
import { styled } from 'components/theme';

const Styled = {
  NavTitle: styled(Title)`
    padding: 8px 14px;
  `,
  Nav: styled.ul`
    padding-left: 0;
    margin-bottom: 0;
    list-style: none;
  `,
  NavItem: styled.li`
    font-size: ${props => props.theme.sizes.s};

    a {
      display: block;
      height: 50px;
      line-height: 50px;
      padding: 0 12px;
      border-left: 3px solid transparent;
      color: ${props => props.theme.colors.whitish};

      &:hover {
        text-decoration: none;
        border-left: 3px solid ${props => props.theme.colors.pink};
      }
    }

    &.active a {
      border-left: 3px solid ${props => props.theme.colors.whitish};
      background-color: ${props => props.theme.colors.blue};
      margin-right: -17px;

      &:hover {
        border-left: 3px solid ${props => props.theme.colors.pink};
      }
    }
  `,
};

const NavMenu: React.FC = () => {
  const { NavTitle, Nav, NavItem } = Styled;

  const { l } = usePrefixedTranslation('cmps.layout.NavMenu');

  return (
    <>
      <NavTitle>{l('menu')}</NavTitle>
      <Nav>
        <NavItem className="active">
          <a href="#temp">{l('loop')}</a>
        </NavItem>
        <NavItem>
          <a href="#temp">{l('settings')}</a>
        </NavItem>
      </Nav>
    </>
  );
};

export default NavMenu;
