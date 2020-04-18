import React from 'react';

const Nav: React.FC = ({ children }) => {
  return <ul className="nav flex-column">{children}</ul>;
};

const NavLink: React.FC = ({ children }) => {
  return (
    <li className="nav-item">
      <a className="nav-link" href="#top">
        {children}
      </a>
    </li>
  );
};

const Sidebar: React.FC = () => {
  return (
    <>
      <p className="">MENU</p>
      <Nav>
        <NavLink>Nav Link 1</NavLink>
        <NavLink>Nav Link 2</NavLink>
        <NavLink>Nav Link 3</NavLink>
      </Nav>
    </>
  );
};
export default Sidebar;
