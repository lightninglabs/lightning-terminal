import React, { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { values } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Alert } from 'types/state';
import { useStore } from 'store';
import { styled } from 'components/theme';
import { Close } from './icons';

const Styled = {
  Body: styled.div`
    margin-right: 10px;
  `,
  Title: styled.div`
    font-family: ${props => props.theme.fonts.open.semiBold};
    font-size: ${props => props.theme.sizes.xs};
    text-transform: uppercase;
  `,
  Message: styled.div`
    font-size: ${props => props.theme.sizes.xs};
  `,
  CloseIcon: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    border: 1px solid ${props => props.theme.colors.offWhite};
    border-radius: 18px;
    transition: background-color 0.3s;

    &:hover {
      color: ${props => props.theme.colors.blue};
      background-color: ${props => props.theme.colors.offWhite};
    }

    svg {
      width: 12px;
      height: 12px;
      padding: 0;
    }
  `,
  Container: styled(ToastContainer)`
    .Toastify__toast {
      border-radius: 4px;
    }
    .Toastify__toast--error {
      color: ${props => props.theme.colors.offWhite};
      background-color: ${props => props.theme.colors.pink};
    }
  `,
};

interface AlertToastProps {
  alert: Alert;
  onClose: (id: number) => void;
}

/**
 * The content to be rendered inside of the toast
 */
const AlertToast: React.FC<AlertToastProps> = ({ alert, onClose }) => {
  // use useEffect to only run the side-effect one time
  useEffect(() => {
    const { id, type, message, title } = alert;
    // create a component to display inside of the toast
    const { Body, Title, Message } = Styled;
    const body = (
      <Body>
        {title && <Title>{title}</Title>}
        <Message>{message}</Message>
      </Body>
    );
    // display the toast popup containing the styled body
    toast(body, { type, onClose: () => onClose(id) });
  }, [alert, onClose]);

  // do not render anything to the dom. the toast() func will display the content
  return null;
};

/**
 * A wrapper around the ToastContainer to add custom styling. Also renders
 * each toast message based on the alerts in the mobx store
 */
const AlertContainer: React.FC = () => {
  const { uiStore } = useStore();

  const { Container, CloseIcon } = Styled;
  const closeButton = (
    <CloseIcon>
      <Close />
    </CloseIcon>
  );
  return (
    <>
      {values(uiStore.alerts).map(n => (
        <AlertToast key={n.id} alert={n} onClose={uiStore.clearAlert} />
      ))}
      <Container position="top-right" autoClose={5 * 1000} closeButton={closeButton} />
    </>
  );
};

export default observer(AlertContainer);
