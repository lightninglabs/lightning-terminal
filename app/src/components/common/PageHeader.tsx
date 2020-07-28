import React, { ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { styled } from 'components/theme';
import { ArrowLeft, Download, HeaderThree, HelpCircle } from '../base';
import Tip from './Tip';

const Styled = {
  Wrapper: styled.div`
    display: flex;
    justify-content: space-between;
  `,
  Left: styled.span<{ sidebar?: boolean }>`
    flex: 1;
    text-align: left;
    padding-left: ${props => (props.sidebar ? '0' : '40px')};
  `,
  Center: styled.span`
    flex: 1;
    text-align: center;
  `,
  Right: styled.span`
    flex: 1;
    text-align: right;

    svg {
      margin-left: 20px;
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
  title: ReactNode;
  onBackClick?: () => void;
  backText?: string;
  onHelpClick?: () => void;
  onExportClick?: () => void;
}

const PageHeader: React.FC<Props> = ({
  title,
  onBackClick,
  backText,
  onHelpClick,
  onExportClick,
}) => {
  const { l } = usePrefixedTranslation('cmps.common.PageHeader');
  const { settingsStore } = useStore();

  const { Wrapper, Left, Center, Right, BackLink } = Styled;
  return (
    <Wrapper>
      <Left sidebar={settingsStore.sidebarVisible}>
        {onBackClick && (
          <BackLink onClick={onBackClick}>
            <ArrowLeft />
            {backText}
          </BackLink>
        )}
      </Left>
      <Center>
        <HeaderThree data-tour="welcome">{title}</HeaderThree>
      </Center>
      <Right>
        {onHelpClick && (
          <Tip placement="bottomRight" overlay={l('helpTip')}>
            <HelpCircle size="large" onClick={onHelpClick} />
          </Tip>
        )}
        {onExportClick && (
          <Tip placement="bottomRight" overlay={l('exportTip')}>
            <Download data-tour="export" size="large" onClick={onExportClick} />
          </Tip>
        )}
      </Right>
    </Wrapper>
  );
};

export default observer(PageHeader);
