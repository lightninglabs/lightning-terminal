import React from 'react';
import styled from '@emotion/styled';

const Styled = {
  Wrapper: styled.a`
    color: ${props => props.theme.colors.offWhite};

    &:hover {
      color: ${props => props.theme.colors.offWhite};
      opacity: 0.8;
    }
  `,
};

interface Props {
  href: string;
  className?: string;
}

const ExternalLink: React.FC<Props> = ({ href, className, children }) => {
  const { Wrapper } = Styled;
  return (
    <Wrapper href={href} target="_blank" className={className}>
      {children}
    </Wrapper>
  );
};

export default ExternalLink;
