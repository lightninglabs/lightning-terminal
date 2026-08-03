import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Global, Theme } from '@emotion/react';
import styled from '@emotion/styled';
import debounce from 'lodash/debounce';
import { useStore } from 'store';
import { AUTO_COLLAPSE_MAX_WIDTH } from 'store/stores/settingsStore';
import { Background, Menu } from 'components/base';
import Sidebar from './Sidebar';

interface CollapsedProps {
  collapsed: boolean;
  fullWidth?: boolean;
}

const GlobalStyles = (theme: Theme) => `
  .rc-select-dropdown {
    padding-top: 10px;
    background-color: transparent;

    & > div {
      color: ${theme.colors.offWhite};
      background-color: ${theme.colors.lightBlue};
      border-width: 0;
      border-radius: 8px;
      box-shadow: 0px 16px 16px rgba(0, 0, 0, 0.15);
      overflow: hidden;
    }
  }

  .rc-select-item {
    color: ${theme.colors.white};
    font-family: ${theme.fonts.open.regular};
    font-weight: 600;
    font-size: ${theme.sizes.s};
    line-height: 24px;
    padding: 16px;
    border-bottom: 1px solid ${theme.colors.paleBlue};

    &:last-of-type {
      border-bottom: none;
    }

    &:hover {
      color: ${theme.colors.white};
      background-color: ${theme.colors.blue};
      cursor: pointer;
    }

    & > .rc-select-item-option-state {
        top: 16px;
        right: 12px;
      }
  }

  .ReactCollapse--collapse {
    transition: height 500ms;
  }
`;

/** the width that the pages which do not reflow are laid out for */
const DESKTOP_MIN_WIDTH = 1024;

/** the space the sidebar toggle occupies at the top of the page, including its offset */
const HAMBURGER_HEIGHT = 80;

/** the width of the expanded sidebar */
const SIDEBAR_WIDTH = 285;

const Styled = {
  Container: styled.div<{ fullWidth: boolean; responsive: boolean }>`
    position: relative;
    height: 100%;
    max-width: ${props => (props.fullWidth ? '100%' : '1440px')};
    width: ${props => (props.fullWidth ? '100%' : '100%')};
    margin: 0 auto;

    /* pages which do not reflow scroll horizontally rather than being squeezed */
    ${props => !props.responsive && `min-width: ${DESKTOP_MIN_WIDTH}px;`}
  `,
  Hamburger: styled.span<CollapsedProps>`
    display: inline-block;
    position: ${props => (props.collapsed ? 'absolute' : 'fixed')};
    top: 35px;
    left: 0;
    margin-left: 10px;
    z-index: 2;
    padding: 4px;

    &:hover {
      color: ${props => props.theme.colors.blue};
      background-color: ${props => props.theme.colors.offWhite};
      border-radius: 24px;
      cursor: pointer;
    }
  `,
  Aside: styled.aside<CollapsedProps>`
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    z-index: 1;
    background-color: ${props => props.theme.colors.darkBlue};
    overflow: hidden;

    /* change sidebar dimensions based on collapsed toggle */
    width: ${props => (props.collapsed ? '0' : `${SIDEBAR_WIDTH}px`)};
    padding: ${props => (props.collapsed ? '0' : '0 15px')};
    transition: all 0.2s;

    /* set a width on the child to improve the collapse animation */
    & > div {
      width: 255px;
    }
  `,
  Content: styled.div<CollapsedProps>`
    height: 100%;
    /* the sidebar's width is reserved whether it is expanded or collapsed, so that the
       content stays in place instead of sliding sideways every time it is toggled */
    margin-left: ${props => (props.fullWidth ? '0' : `${SIDEBAR_WIDTH}px`)};
    padding: ${props => (props.fullWidth ? '0' : '0 15px')};
    transition: ${props => (props.fullWidth ? 'none' : 'all 0.2s')};

    @media (max-width: ${AUTO_COLLAPSE_MAX_WIDTH}px) {
      margin-left: 0;

      /* the sidebar's toggle floats over the top left of the page, so leave room for
         it rather than letting the content run underneath it. the space is reserved in
         both states, otherwise the content would jump up and down by the height of the
         toggle each time the sidebar is opened or closed */
      padding-top: ${HAMBURGER_HEIGHT}px;
    }
  `,
  Fluid: styled.div`
    height: 100%;
  `,
};

export const Layout: React.FC = ({ children }) => {
  const { settingsStore, appView } = useStore();

  // the breakpoint is only checked on startup, so the sidebar would remain expanded
  // and cover the content when the window is resized down to a smaller width
  useEffect(() => {
    const handleResize = debounce(() => settingsStore.syncAutoCollapse(), 100);
    window.addEventListener('resize', handleResize);

    return () => {
      handleResize.cancel();
      window.removeEventListener('resize', handleResize);
    };
  }, [settingsStore]);

  const { Container, Hamburger, Aside, Content, Fluid } = Styled;
  return (
    <Background>
      {/*
        the sidebar and its toggle are rendered outside of the Container so that they
        are always pinned to the left edge of the window. inside of the Container they
        would be positioned relative to it, which shifts them horizontally when the
        Container switches between its max-width and full-width layouts
      */}
      <Hamburger
        collapsed={!settingsStore.sidebarVisible}
        onClick={settingsStore.toggleSidebar}
      >
        <Menu size="large" />
      </Hamburger>
      <Aside collapsed={!settingsStore.sidebarVisible}>
        <Sidebar />
      </Aside>
      <Container fullWidth={appView.fullWidth} responsive={appView.responsive}>
        <Content collapsed={!settingsStore.sidebarVisible} fullWidth={appView.fullWidth}>
          <Fluid className="container-fluid">{children}</Fluid>
        </Content>
      </Container>
      <Global styles={GlobalStyles} />
    </Background>
  );
};

export default observer(Layout);
