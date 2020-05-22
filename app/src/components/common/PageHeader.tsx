import React from 'react';
import { observer } from 'mobx-react-lite';
import { styled } from 'components/theme';
import { ArrowLeft, Icon } from './icons';
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
  `,
  BackLink: styled.a`
    text-transform: uppercase;
    font-size: ${props => props.theme.sizes.xs};
    cursor: pointer;
    color: ${props => props.theme.colors.whitish};

    &:hover {
      opacity: 80%;
    }
  `,
  BackIcon: styled(ArrowLeft)`
    margin-right: 5px;
  `,
  ActionIcon: styled(Icon)`
    margin-left: 50px;
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
  const { Wrapper, Left, Center, Right, BackLink, BackIcon, ActionIcon } = Styled;
  return (
    <Wrapper>
      <Left>
        {onBackClick && (
          <BackLink onClick={onBackClick}>
            <BackIcon />
            {backText}
          </BackLink>
        )}
      </Left>
      <Center>
        <HeaderThree>{title}</HeaderThree>
      </Center>
      <Right>
        {onHistoryClick && <ActionIcon icon="clock" onClick={onHistoryClick} />}
        {onExportClick && <ActionIcon icon="download" onClick={onExportClick} />}
      </Right>
    </Wrapper>
  );
};

export default observer(PageHeader);
