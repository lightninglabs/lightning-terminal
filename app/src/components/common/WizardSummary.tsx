import React, { ReactNode } from 'react';
import styled from '@emotion/styled';
import { HeaderFive, HeaderFour, Small } from 'components/base';

const Styled = {
  Wrapper: styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    max-width: 300px;
  `,
  Description: styled(Small)`
    opacity: 0.5;
  `,
  Channels: styled.div`
    line-height: 40px;
  `,
};

interface Props {
  title: string;
  heading: string;
  description?: string;
  extra?: ReactNode;
}

const WizardSummary: React.FC<Props> = ({ title, heading, description, extra }) => {
  const { Wrapper, Description } = Styled;
  return (
    <Wrapper>
      <div>
        <HeaderFour>{title}</HeaderFour>
        <HeaderFive>{heading}</HeaderFive>
        {description && <Description>{description}</Description>}
      </div>
      <div>{extra}</div>
    </Wrapper>
  );
};

export default WizardSummary;
