import React, { ReactNode, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { Button, Column, Container, Row, Close } from 'components/base';
import { DisplayLarge, Header } from './v2/Text';

const Styled = {
  Wrapper: styled.div`
    h4 {
      color: ${props => props.theme.colors.offWhite};
    }
  `,
  BackLink: styled(Button)`
    display: inline-block;
    position: absolute;
    top: 30px;
    right: 0px;
    left: auto;
    z-index: 10;

    @media (${props => props.theme.breakpoints.m}) {
      top: 30px;
      right: 0px;
    }
  `,
  Title: styled(DisplayLarge)`
    font-weight: ${props => props.theme.fonts.open.bold};
    margin-bottom: 16px;
  `,
  Content: styled.div``,
};

interface Props {
  title: string;
  description: ReactNode;
  onBackClick?: () => void;
}

const OverlayFormWrap: React.FC<Props> = ({
  title,
  description,
  onBackClick,
  children,
}) => {
  // scroll to the top of the screen when this comp is mounted
  useEffect(() => window.scrollTo(0, 0), []);

  const { Wrapper, BackLink, Title, Content } = Styled;
  return (
    <Wrapper>
      {onBackClick && (
        <BackLink onClick={onBackClick} ghost borderless>
          <Close />
        </BackLink>
      )}
      <Container>
        <Row>
          <Column className="col-md-9 offset-md-1">
            <Title bold>{title}</Title>
            <Header muted space={32}>
              {description}
            </Header>
            <Content>{children}</Content>
          </Column>
        </Row>
      </Container>
    </Wrapper>
  );
};

export default observer(OverlayFormWrap);
