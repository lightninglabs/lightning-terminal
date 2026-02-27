import React from 'react';
import { Global, Theme } from '@emotion/react';
import CloseIcon from 'assets/icons/close.svg';
import Dialog from 'rc-dialog';

const GlobalStyles = (theme: Theme) => `
  div.rc-dialog {
    font-family: 'Inter', sans-serif;
    font-size: ${theme.sizes.s};
  }
  div.rc-dialog-content {
    color: ${theme.colors.offWhite};
    background-color: ${theme.colors.lightBlue};
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
  }
  div.rc-dialog-header {
    color: ${theme.colors.white};
    background-color: ${theme.colors.lightBlue};
    border-width: 0px;
    padding: 20px 24px;
  }
  div.rc-dialog-title {
    font-size: 18px;
    font-weight: 600;
    line-height: 24px;
    letter-spacing: -0.02em;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  button.rc-dialog-close {
    color: ${theme.colors.offWhite};
    opacity: 0.5;
    top: 20px;
    right: 20px;
    width: 20px;
    height: 20px;
    padding: 0;
    background-color: ${theme.colors.offWhite};
    mask-image: url(${CloseIcon});
    transition: opacity 0.15s;

    &:hover {
      opacity: 1;
    }
  }
  span.rc-dialog-close-x:after {
    content: "";
  }
  div.rc-dialog-body {
    padding: 0 24px 24px;
  }
  div.rc-dialog-mask {
    background-color: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
  }
  div.rc-dialog-footer {
    border-width: 0px;
    padding: 0 24px 24px;
    text-align: left;
  }
`;

interface Props {
  title: string;
  visible: boolean;
  onClose: () => void;
  className?: string;
}

const Modal: React.FC<Props> = ({ title, visible, onClose, className, children }) => {
  return (
    <Dialog
      title={title}
      animation="zoom"
      maskAnimation="fade"
      visible={visible}
      onClose={onClose}
      maskClosable
      className={className}
    >
      {children}
      <Global styles={GlobalStyles} />
    </Dialog>
  );
};

export default Modal;
