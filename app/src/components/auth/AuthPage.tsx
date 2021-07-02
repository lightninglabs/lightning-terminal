import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { ReactComponent as LogoImage } from 'assets/images/logo.svg';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Background, Button, HeaderOne, Input } from 'components/base';

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
    color: ${props => props.theme.colors.offWhite};
    width: 80px;
    height: 156px;
    margin-bottom: 30px;
  `,
  Title: styled(HeaderOne)`
    font-size: 75px;
    margin-bottom: 30px;
    text-transform: uppercase;
  `,
  Subtitle: styled.div`
    width: 100%;
    max-width: 500px;
    margin-bottom: 80px;
    text-align: center;
  `,
  Form: styled.form`
    display: flex;
    flex-direction: column;
    align-items: center;
  `,
  Label: styled.label`
    margin: 10px 0 80px;
  `,
  ErrMessage: styled.div`
    width: 100%;
    margin: 0 0 80px;
    padding: 5px 0;
    background-color: ${props => props.theme.colors.pink};
    color: ${props => props.theme.colors.offWhite};
    text-align: center;
  `,
  Submit: styled(Button)`
    background-color: transparent;
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

  const { Wrapper, Logo, Title, Subtitle, Form, Label, ErrMessage, Submit } = Styled;
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
          />
          {error ? (
            <ErrMessage>{error}</ErrMessage>
          ) : (
            <Label htmlFor="auth">{l('passLabel')}</Label>
          )}
          <Submit>{l('submitBtn')}</Submit>
        </Form>
      </Wrapper>
    </Background>
  );
};

export default observer(AuthPage);
