import React from 'react';
import styled from '@emotion/styled/macro';

const Title = styled.div`
  font-size: 14px;
  font-family: 'OpenSans SemiBold';
  letter-spacing: 0;
  line-height: 19px;
  padding: 8px 14px;
  color: #848a99; // gray
`;

const Nav = styled.ul`
  padding-left: 0;
  margin-bottom: 0;
  list-style: none;
`;

const NavItem = styled.li`
  font-size: 14px;
  border-left: 3px solid transparent;

  a {
    display: block;
    height: 50px;
    line-height: 50px;
    padding: 0 12px;
    color: #f5f5f5; // white

    &:active,
    &:hover {
      text-decoration: none;
    }
  }

  &.active {
    border-left: 3px solid #f5f5f5; // white
    background-color: #252f4a; // dark blue
    margin-right: -17px;
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
