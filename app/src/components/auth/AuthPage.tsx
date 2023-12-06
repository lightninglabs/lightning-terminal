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
    max-width: 550px;
    display: flex;
    flex-direction: column;
    align-items: center;
  `,
  Password: styled.input`
    font-family: ${props => props.theme.fonts.work.light};
    font-weight: 300;
    font-size: ${props => props.theme.sizes.xxl};
    color: ${props => props.theme.colors.offWhite};
    background-color: transparent;
    border-width: 0;
    border-bottom: 3px solid ${props => props.theme.colors.offWhite};
    padding: 5px;
    text-align: center;
    width: 100%;

    &:active,
    &:focus {
      outline: none;
      background-color: ${props => props.theme.colors.overlay};
      border-bottom-color: ${props => props.theme.colors.white};
    }

    &::placeholder {
      color: ${props => props.theme.colors.gray};
    }
  `,
  Label: styled.label``,
  ErrMessage: styled.div`
    width: 100%;
    display: inline-block;
    padding: 5px 0;
    background-color: ${props => props.theme.colors.pink};
    color: ${props => props.theme.colors.offWhite};
    text-align: center;
  `,
  ErrDetail: styled.div`
    width: 100%;
    display: inline-block;
    padding: 5px 0;
    color: ${props => props.theme.colors.offWhite};
    text-align: center;
  `,
  ErrDetailToggle: styled(Button)`
    width: 100%;
    padding: 5px 0;
    background-color: transparent;
  `,
  Submit: styled(Button)`
    margin-top: 80px;
    background-color: transparent;
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
