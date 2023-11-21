import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Button, Column, HeaderFour, Row } from 'components/base';
import FormField from 'components/common/FormField';
import FormInput from 'components/common/FormInput';
import FormSelect from 'components/common/FormSelect';
import PurpleButton from './PurpleButton';
import { PermissionTypeValues } from 'store/views/addSessionView';

const Styled = {
  Wrapper: styled.div``,
  FormHeader: styled(HeaderFour)`
    color: ${props => props.theme.colors.white};
  `,
  FormInput: styled(FormInput)`
    > input {
      font-family: ${props => props.theme.fonts.open.regular};
      font-size: ${props => props.theme.sizes.m};
      padding: 12px 16px;
    }
  `,
  FormSelect: styled(FormSelect)`
    .rc-select {
      font-family: ${props => props.theme.fonts.open.regular};
      font-size: ${props => props.theme.sizes.m};
      padding: 12px 40px 8px 0px;
    }

    .rc-select-selection-item {
      padding-left: 14px;
    }
  `,
};

interface Props {
  primary?: boolean;
}

const AddSession: React.FC<Props> = ({ primary }) => {
  const { l } = usePrefixedTranslation('cmps.connect.AddSession');
  const { addSessionView } = useStore();
  const { Wrapper, FormHeader, FormInput, FormSelect } = Styled;
  if (!addSessionView.editing) {
    return (
      <PurpleButton tertiary={!primary} onClick={addSessionView.toggleEditing}>
        {l('create')}
      </PurpleButton>
    );
  }

  const validatePermissionType = (v: string) => {
    const permissionType = Object.values(PermissionTypeValues).find(value => value === v);

    if (!permissionType) return;

    addSessionView.setPermissionType(permissionType);
  };

  return (
    <Wrapper>
      <Row>
        <Column>
          <FormHeader>{l('label')}</FormHeader>
        </Column>
        <Column>
          <FormHeader>{l('permissions')}</FormHeader>
        </Column>
      </Row>
      <Row>
        <Column cols={6}>
          <FormField>
            <FormInput
              value={addSessionView.label}
              onChange={addSessionView.setLabel}
              placeholder={l('labelHint')}
            />
          </FormField>
        </Column>
        <Column>
          <FormField>
            <FormSelect
              value={addSessionView.permissionType}
              onChange={validatePermissionType}
              options={[
                { label: l('admin'), value: PermissionTypeValues.Admin },
                { label: l('readonly'), value: PermissionTypeValues.ReadOnly },
                { label: l('custom'), value: PermissionTypeValues.Custom },
              ]}
            />
          </FormField>
        </Column>
        <Column>
          <PurpleButton onClick={addSessionView.handleSubmit}>
            {addSessionView.permissionType === PermissionTypeValues.Custom
              ? l('common.next')
              : l('common.submit')}
          </PurpleButton>
          <Button ghost borderless onClick={addSessionView.toggleEditing}>
            {l('common.cancel')}
          </Button>
        </Column>
      </Row>
    </Wrapper>
  );
};

export default observer(AddSession);
