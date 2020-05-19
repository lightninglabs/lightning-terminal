import React from 'react';
import { observer } from 'mobx-react-lite';
import { RadioButton } from 'components/common/base';
import { Icon } from 'components/common/icons';
import { styled } from 'components/theme';

const Styled = {
  Wrapper: styled.div`
    display: flex;
    line-height: 80px;
    cursor: pointer;
    border-bottom: 0.5px solid ${props => props.theme.colors.darkGray};

    &:last-child {
      border-bottom-width: 0;
    }

    &:hover {
      opacity: 0.8;
    }
  `,
  Name: styled.span`
    flex: 1;
    font-size: ${props => props.theme.sizes.l};
  `,
  Value: styled.span`
    color: ${props => props.theme.colors.gray};
    margin-right: 20px;
  `,
  Icon: styled(Icon)`
    line-height: 80px;
  `,
  Radio: styled(RadioButton)`
    margin-top: 32px;
  `,
};

interface Props {
  name: string;
  value?: string;
  icon: 'arrow' | 'radio';
  checked?: boolean;
  onClick: () => void;
}

const SettingItem: React.FC<Props> = ({ name, value, icon, checked, onClick }) => {
  const { Wrapper, Name, Value, Radio, Icon } = Styled;
  return (
    <Wrapper onClick={onClick}>
      <Name>{name}</Name>
      {value && <Value>{value}</Value>}
      {icon === 'radio' && <Radio checked={checked} />}
      {icon === 'arrow' && <Icon icon="arrow-right" />}
    </Wrapper>
  );
};

export default observer(SettingItem);
