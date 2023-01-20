import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import Switch from 'rc-switch';

const Styled = {
  Wrapper: styled.div``,
  Switch: styled(Switch)`
    &.rc-switch-checked {
      border: 1px solid ${props => props.theme.colors.iris};
      background-color: ${props => props.theme.colors.iris};
    }
  `,
};

interface Props {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

const FormSelect: React.FC<Props> = ({ checked, onChange }) => {
  const { Wrapper, Switch } = Styled;
  return (
    <Wrapper>
      <Switch checked={checked} onChange={v => onChange && onChange(v)} />
    </Wrapper>
  );
};

export default observer(FormSelect);
