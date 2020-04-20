import React from 'react';
import { styled } from 'components/theme';

const Title = styled.div`
  font-size: ${props => props.theme.sizes.s};
  font-family: ${props => props.theme.fonts.semiBold};
  letter-spacing: 0;
  line-height: 19px;
  padding: 8px 14px;
  color: ${props => props.theme.colors.gray};
`;

const Nav = styled.ul`
  padding-left: 0;
  margin-bottom: 0;
  list-style: none;
`;

const NavItem = styled.li`
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
`;

const Sidebar: React.FC = () => {
  return (
    <>
      <Title>MENU</Title>
      <Nav>
        <NavItem className="active">
          <a href="#temp">Lightning Loop</a>
        </NavItem>
        <NavItem>
          <a href="#temp">Settings</a>
        </NavItem>
      </Nav>
    </>
  );
};
export default Sidebar;
