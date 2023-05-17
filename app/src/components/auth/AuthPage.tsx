import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { ReactComponent as LogoImage } from 'assets/images/logo.svg';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Background, HeaderOne, Input } from 'components/base';
import PurpleButton from 'components/connect/PurpleButton';

const Styled = {
  Wrapper: styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  `,
  Logo: styled(LogoImage)`
    color: ${props => props.theme.colors.white};
    width: 60px;
    height: 80px;
    margin-bottom: 32px;
  `,
  Title: styled(HeaderOne)`
    color: ${props => props.theme.colors.white};
    font-size: 48px;
    line-height: 48px;
    margin-bottom: 0px;
    text-transform: uppercase;
  `,
  Subtitle: styled.div`
    color: ${props => props.theme.colors.gray};
    width: 100%;
    max-width: 400px;
    margin-top: 24px;
    margin-bottom: 24px;
    text-align: center;
  `,
  Form: styled.form`
    display: flex;
    flex-direction: column;
    align-items: center;
  `,
  Input: styled(Input)`
    font-size: ${props => props.theme.sizes.l};
    width: 100%;
    color: ${props => props.theme.colors.white};
    padding: 8px 0px;
    border-width: 0;
    border-bottom: 2px solid ${props => props.theme.colors.gray};
    min-width: 360px;
    outline: none;
  `,
  Label: styled.label`
    margin: 10px 0 80px;
  `,
  ErrMessage: styled.div`
    width: 100%;
    padding: 8px 0;
    color: ${props => props.theme.colors.lightningRed};
    text-align: left;
  `,
  PurpleButton: styled(PurpleButton)`
    font-size: ${props => props.theme.sizes.s};
    margin-top: 32px;
    line-height: 24px;
    padding: 12px 24px;
    width: 100%;
  `,
};

const AuthPage: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.auth.AuthPage');
  const store = useStore();
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPass(e.target.value);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await store.authStore.login(pass);
    } catch (err) {
      setError(err.message);
    }
  };

  // don't display the login UI until the app is fully initialized this prevents
  // a UI flicker while validating credentials stored in session storage
  if (!store.initialized) return null;

  const {
    Wrapper,
    Logo,
    Title,
    Subtitle,
    Form,
    Input,
    ErrMessage,
    PurpleButton,
  } = Styled;
  return (
    <Background gradient>
      <Wrapper>
        <Logo />
        <Title>{l('lightning')}</Title>
        <Title>{l('terminal')}</Title>
        <Subtitle>{l('subtitle')}</Subtitle>
        <Form onSubmit={handleSubmit}>
          <Input
            id="auth"
            type="password"
            autoFocus
            value={pass}
            onChange={handleChange}
            placeholder="Password"
          />
          {error && <ErrMessage>{error}</ErrMessage>}
          <PurpleButton>{l('loginBtn')}</PurpleButton>
        </Form>
      </Wrapper>
    </Background>
  );
};

export default observer(AuthPage);
