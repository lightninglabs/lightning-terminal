import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import loadingJson from 'assets/animations/loading.json';
import { HeaderFour } from 'components/base';
import Animation from 'components/common/Animation';

const Styled = {
  Wrapper: styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  `,
  Loader: styled(Animation)`
    width: 150px;
    height: 150px;
  `,
  Message: styled.div`
    text-align: center;
  `,
};

interface Props {
  message?: string;
  delay?: number;
}

const Loading: React.FC<Props> = ({ message, delay }) => {
  const [show, setShow] = useState(!delay);

  useEffect(() => {
    if (delay) {
      const timeout = setTimeout(() => setShow(true), delay);
      return () => clearTimeout(timeout);
    }
  }, [delay]);

  const { Wrapper, Loader, Message } = Styled;
  return show ? (
    <Wrapper>
      <Loader animationData={loadingJson} loop />
      {message && (
        <Message>
          <HeaderFour>{message}</HeaderFour>
        </Message>
      )}
    </Wrapper>
  ) : null;
};

export default observer(Loading);
