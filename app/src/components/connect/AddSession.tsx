import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { MAX_DATE } from 'util/constants';
import { useStore } from 'store';
import { Button, Column, HeaderFour, Row } from 'components/base';
import FormField from 'components/common/FormField';
import FormInput from 'components/common/FormInput';
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
};

interface Props {
  primary?: boolean;
}

const AddSession: React.FC<Props> = ({ primary }) => {
  const { l } = usePrefixedTranslation('cmps.connect.AddSession');
  const { sessionStore } = useStore();

  const [label, setLabel] = useState('');
  const [editing, setEditing] = useState(false);

  const toggleEditing = useCallback(() => setEditing(e => !e), []);
  const handleSubmit = useCallback(async () => {
    const session = await sessionStore.addSession(label, MAX_DATE);
    if (session) {
      setLabel('');
      setEditing(false);
    }
  }, [label]);

  const { Wrapper, FormHeader, FormInput } = Styled;
  if (!editing) {
    return (
      <PurpleButton tertiary={!primary} onClick={toggleEditing}>
        {l('create')}
      </PurpleButton>
    );
  }

  return (
    <Wrapper>
      <FormHeader>{l('label')}</FormHeader>
      <Row>
        <Column cols={6}>
          <FormField>
            <FormInput value={label} onChange={setLabel} placeholder={l('labelHint')} />
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
