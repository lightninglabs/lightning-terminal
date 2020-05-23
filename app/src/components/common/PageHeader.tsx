import React from 'react';
import { observer } from 'mobx-react-lite';
import { styled } from 'components/theme';
import { ArrowLeft, Clock, Download } from './icons';
import { HeaderThree } from './text';

const Styled = {
  Wrapper: styled.div`
    display: flex;
    justify-content: space-between;
  `,
  Left: styled.span`
    flex: 1;
    text-align: left;
  `,
  Center: styled.span`
    flex: 1;
    text-align: center;
  `,
  Right: styled.span`
    flex: 1;
    text-align: right;

    svg {
      margin-left: 50px;
    }
  `,
  BackLink: styled.a`
    text-transform: uppercase;
    font-size: ${props => props.theme.sizes.xs};
    cursor: pointer;
    line-height: 36px;

    &:hover {
      opacity: 80%;
    }
  `,
};

interface Props {
  title: string;
  onBackClick?: () => void;
  backText?: string;
  onHistoryClick?: () => void;
  onExportClick?: () => void;
}

const PageHeader: React.FC<Props> = ({
  title,
  onBackClick,
  backText,
  onHistoryClick,
  onExportClick,
}) => {
  const { Wrapper, Left, Center, Right, BackLink } = Styled;
  return (
    <Wrapper>
      <Left>
        {onBackClick && (
          <BackLink onClick={onBackClick}>
            <ArrowLeft />
            {backText}
          </BackLink>
        )}
      </Left>
      <Center>
        <HeaderThree>{title}</HeaderThree>
      </Center>
      <Right>
        {onHistoryClick && <Clock size="large" onClick={onHistoryClick} />}
        {onExportClick && <Download size="large" onClick={onExportClick} />}
      </Right>
    </Wrapper>
  );
};

export default observer(PageHeader);
