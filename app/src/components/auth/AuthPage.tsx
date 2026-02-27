import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { ReactComponent as LogoImage } from 'assets/images/logo.svg';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Background, Button, ChevronDown, ChevronUp, HeaderOne } from 'components/base';

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
    width: 48px;
    height: 96px;
    margin-bottom: 24px;
    opacity: 0.8;
  `,
  Title: styled(HeaderOne)`
    font-size: 36px;
    margin-bottom: 8px;
    letter-spacing: -0.03em;
    font-weight: 600;
  `,
  Subtitle: styled.div`
    width: 100%;
    max-width: 400px;
    margin-bottom: 48px;
    text-align: center;
    color: ${props => props.theme.colors.gray};
    font-size: 14px;
  `,
  Form: styled.form`
    max-width: 360px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  `,
  Password: styled.input`
    font-family: 'Inter', sans-serif;
    font-weight: 400;
    font-size: 15px;
    color: ${props => props.theme.colors.offWhite};
    background-color: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 12px 16px;
    width: 100%;
    transition: border-color 0.15s ease;

    &:active,
    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.iris};
      background-color: rgba(255, 255, 255, 0.06);
    }

    &::placeholder {
      color: ${props => props.theme.colors.gray};
    }
  `,
  Label: styled.label`
    font-size: 13px;
    color: ${props => props.theme.colors.gray};
  `,
  ErrMessage: styled.div`
    width: 100%;
    padding: 10px 14px;
    background-color: rgba(244, 63, 94, 0.15);
    color: ${props => props.theme.colors.pink};
    border: 1px solid rgba(244, 63, 94, 0.2);
    border-radius: 8px;
    text-align: center;
    font-size: 13px;
  `,
  ErrDetail: styled.div`
    width: 100%;
    padding: 6px 0;
    color: ${props => props.theme.colors.gray};
    text-align: center;
    font-size: 12px;
  `,
  ErrDetailToggle: styled(Button)`
    width: 100%;
    padding: 4px 0;
    background-color: transparent;
    font-size: 12px;
  `,
  Submit: styled(Button)`
    margin-top: 8px;
    width: 100%;
    height: 40px;
    background: ${props => props.theme.colors.iris};
    border: none;
    border-radius: 10px;
    font-weight: 500;
    font-size: 14px;

    &:hover {
      background: #5355d4;
      color: white;
    }
  `,
};

const AuthPage: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.auth.AuthPage');
  const store = useStore();
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [errorDetailLit, setErrorDetailLit] = useState('');
  const [errorDetailLnd, setErrorDetailLnd] = useState('');
  const [errorDetailVisible, setErrorDetailVisible] = useState(false);
  const [showDetailButton, setShowDetailButton] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPass(e.target.value);
    setError('');
    setErrorDetailLit('');
    setErrorDetailLnd('');
    setShowDetailButton(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await store.authStore.login(pass);
    } catch (err) {
      setError(err.message);
      const errors = store.authStore.errors;
      setErrorDetailLit(errors.litDetail);
      setErrorDetailLnd(errors.lndDetail);

      // don't display the detail toggle button if there is nothing to display
      setShowDetailButton(errors.litDetail.length > 0 || errors.litDetail.length > 0);
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
    Password,
    Label,
    ErrMessage,
    ErrDetail,
    ErrDetailToggle,
    Submit,
  } = Styled;
  return (
    <Background gradient>
      <Wrapper>
        <Logo />
        <Title>{l('lightning')}</Title>
        <Title>{l('terminal')}</Title>
        <Subtitle>{l('subtitle')}</Subtitle>
        <Form onSubmit={handleSubmit}>
          <Password
            id="auth"
            type="password"
            autoFocus
            value={pass}
            onChange={handleChange}
          />
          {error ? (
            <>
              <ErrMessage>{error}</ErrMessage>
              {errorDetailVisible && errorDetailLit.length > 0 ? (
                <ErrDetail>{errorDetailLit}</ErrDetail>
              ) : (
                ''
              )}
              {errorDetailVisible && errorDetailLnd.length > 0 ? (
                <ErrDetail>{errorDetailLnd}</ErrDetail>
              ) : (
                ''
              )}
              {showDetailButton ? (
                <ErrDetailToggle
                  ghost
                  borderless
                  compact
                  type="button"
                  onClick={() => {
                    setErrorDetailVisible(!errorDetailVisible);
                  }}
                >
                  {!errorDetailVisible ? <ChevronDown /> : <ChevronUp />}
                  {!errorDetailVisible ? l('showDetail') : l('hideDetail')}
                </ErrDetailToggle>
              ) : (
                ''
              )}
            </>
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
