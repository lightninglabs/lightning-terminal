import React from 'react';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { Plug } from '../base';
import { SubServerStatus } from 'types/state';

const Styled = {
  Wrapper: styled.div`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  StatusMessage: styled.div`
    display: inline-block;
    border-radius: 24px;
    padding: 3px 16px 3px 6px;
    font-size: ${props => props.theme.sizes.s};
    color: ${props => props.theme.colors.lightningGray};
    font-weight: 600;
    white-space: nowrap;
    text-align: center;

    svg {
      margin-bottom: 16px;
      color: ${props => props.theme.colors.gold};
    }
  `,
  Error: styled.div`
    font-weight: bold;
  `,
};

interface StatusProps {
  isDisabled: boolean;
  errorMessage?: string;
}

export const SubServerStatusMessage: React.FC<StatusProps> = ({
  isDisabled,
  errorMessage,
}) => {
  const { l } = usePrefixedTranslation('cmps.common.SubServerStatus');
  const { Wrapper, StatusMessage, Error } = Styled;
  return (
    <Wrapper>
      <StatusMessage>
        <Plug size="x-large" />

        {isDisabled ? (
          <p>{l('isDisabled')}</p>
        ) : (
          <>
            <p>{l('isError')}</p>
            <Error>{errorMessage}</Error>
          </>
        )}
      </StatusMessage>
    </Wrapper>
  );
};

interface Props {
  status: SubServerStatus;
}

const SubServerRequired: React.FC<Props> = ({ status, children }) => {
  if (status.disabled) {
    return <SubServerStatusMessage isDisabled />;
  } else if (status.error) {
    return <SubServerStatusMessage isDisabled={false} errorMessage={status.error} />;
  }

  return <>{children}</>;
};

export default SubServerRequired;
