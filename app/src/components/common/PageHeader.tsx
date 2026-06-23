import React, { ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { ArrowLeft, Download, HeaderThree, HelpCircle } from '../base';
import Tip from './Tip';

const Styled = {
  Wrapper: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 0;
    margin-bottom: 4px;
  `,
  Left: styled.span`
    display: flex;
    align-items: center;
  `,
  Center: styled.span`
    flex: 1;
  `,
  Right: styled.span`
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  BackLink: styled.a`
    color: ${props => props.theme.colors.offWhite};
    font-size: ${props => props.theme.sizes.xs};
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: opacity 0.15s;

    &:hover {
      color: ${props => props.theme.colors.white};
      opacity: 0.8;
      text-decoration: none;
    }
  `,
};

interface Props {
  title: ReactNode;
  onBackClick?: () => void;
  backText?: string;
  onHelpClick?: () => void;
  exportTip?: string;
  onExportClick?: () => void;
}

const PageHeader: React.FC<Props> = ({
  title,
  onBackClick,
  backText,
  onHelpClick,
  exportTip,
  onExportClick,
}) => {
  const { l } = usePrefixedTranslation('cmps.common.PageHeader');

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
        <HeaderThree data-tour="welcome">{title}</HeaderThree>
      </Center>
      <Right>
        {onHelpClick && (
          <Tip placement="bottomRight" overlay={l('helpTip')}>
            <HelpCircle size="large" onClick={onHelpClick} />
          </Tip>
        )}
        {onExportClick && (
          <Tip placement="bottomRight" overlay={exportTip || l('exportTip')}>
            <Download data-tour="export" size="large" onClick={onExportClick} />
          </Tip>
        )}
      </Right>
    </Wrapper>
  );
};

export default observer(PageHeader);
