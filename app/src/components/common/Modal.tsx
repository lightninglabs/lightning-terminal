import React from 'react';
import { Global, Theme } from '@emotion/react';
import CloseIcon from 'assets/icons/close.svg';
import Dialog from 'rc-dialog';

const GlobalStyles = (theme: Theme) => `
  div.rc-dialog {
    font-family: ${theme.fonts.open.regular};
    font-size: ${theme.sizes.m};
  }
  div.rc-dialog-content {
    color: ${theme.colors.offWhite};
    background-color: ${theme.colors.blue};
  }
  div.rc-dialog-header {
    color: ${theme.colors.offWhite};
    background-color: ${theme.colors.blue};
    border-width: 0px;
    padding: 32px 40px;
  }
  div.rc-dialog-title {
    font-size: 32px;
    line-height: 40px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  button.rc-dialog-close {
    color: ${theme.colors.offWhite};
    font-size: ${theme.sizes.xxl};
    opacity: 1;
    top: 34px;
    right: 34px;
    width: 24px;
    height: 24px;
    padding: 0;
    background-color: ${theme.colors.offWhite};
    mask-image: url(${CloseIcon});
    padding: 0;

    &:hover {
      opacity: 0.6;
    }
  }
  span.rc-dialog-close-x:after {
    content: "";
  }
  div.rc-dialog-body {
    padding: 0 40px 40px;
  }
  div.rc-dialog-mask {
    background-color: rgba(0, 0, 0, 0.8);
  }
  div.rc-dialog-footer {
    border-width: 0px;
    padding: 0 40px 40px;
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
