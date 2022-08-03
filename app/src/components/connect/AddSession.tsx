import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import * as LIT from 'types/generated/lit-sessions_pb';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { MAX_DATE } from 'util/constants';
import { useStore } from 'store';
import { Button, Column, HeaderFour, Row } from 'components/base';
import FormField from 'components/common/FormField';
import FormInput from 'components/common/FormInput';
import FormSelect from 'components/common/FormSelect';
import PurpleButton from './PurpleButton';

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
  const { sessionStore } = useStore();

  const [label, setLabel] = useState('');
  const [permissions, setPermissions] = useState('admin');
  const [editing, setEditing] = useState(false);

  const toggleEditing = useCallback(() => setEditing(e => !e), []);
  const handleSubmit = useCallback(async () => {
    const sessionType =
      permissions === 'admin'
        ? LIT.SessionType.TYPE_MACAROON_ADMIN
        : LIT.SessionType.TYPE_MACAROON_READONLY;

    const session = await sessionStore.addSession(label, sessionType, MAX_DATE, true);

    if (session) {
      setLabel('');
      setEditing(false);
    }
  }, [label, permissions]);

  const { Wrapper, FormHeader, FormInput, FormSelect } = Styled;
  if (!editing) {
    return (
      <PurpleButton tertiary={!primary} onClick={toggleEditing}>
        {l('create')}
      </PurpleButton>
    );
  }

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
            <FormInput value={label} onChange={setLabel} placeholder={l('labelHint')} />
          </FormField>
        </Column>
        <Column>
          <FormField>
            <FormSelect
              value={permissions}
              onChange={setPermissions}
              options={[
                { label: 'Admin', value: 'admin' },
                { label: 'Read Only', value: 'read-only' },
              ]}
            />
          </FormField>
        </Column>
        <Column>
          <PurpleButton onClick={handleSubmit}>{l('common.submit')}</PurpleButton>
          <Button ghost borderless onClick={toggleEditing}>
            {l('common.cancel')}
          </Button>
        </Column>
      </Row>
    </Wrapper>
  );
};

export default observer(AddSession);
