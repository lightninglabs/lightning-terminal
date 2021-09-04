import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Button, Column, Row } from 'components/base';
import FormField from 'components/common/FormField';
import FormInput from 'components/common/FormInput';
import FormInputNumber from 'components/common/FormInputNumber';

const Styled = {
  Wrapper: styled.div``,
  AddSection: styled.div`
    text-align: center;
  `,
  ActionColumn: styled(Column)`
    padding-top: 20px;
  `,
};

const AddSession: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.connect.AddSession');
  const { sessionStore } = useStore();

  const [label, setLabel] = useState('');
  const [expiry, setExpiry] = useState(30);
  const [editing, setEditing] = useState(false);

  const toggleEditing = useCallback(() => setEditing(e => !e), []);
  const handleSubmit = useCallback(async () => {
    const expDate = new Date(Date.now() + expiry * 24 * 60 * 60 * 1000);
    const session = await sessionStore.addSession(label, expDate);
    if (session) {
      setLabel('');
      setExpiry(30);
      setEditing(false);
    }
  }, [label, expiry]);

  const { Wrapper, AddSection, ActionColumn } = Styled;
  if (!editing) {
    return (
      <AddSection>
        <Button onClick={toggleEditing}>{l('create')}</Button>
      </AddSection>
    );
  }

  return (
    <Wrapper>
      <Row>
        <Column cols={4} className="offset-1">
          <FormField label={l('label')}>
            <FormInput value={label} onChange={setLabel} placeholder={l('labelHint')} />
          </FormField>
        </Column>
        <Column cols={2}>
          <FormField label={l('expiration')}>
            <FormInputNumber
              value={expiry}
              onChange={setExpiry}
              extra={l('common.days_plural')}
            />
          </FormField>
        </Column>
        <ActionColumn className="">
          <Button primary onClick={handleSubmit}>
            {l('common.submit')}
          </Button>
          <Button ghost borderless onClick={toggleEditing}>
            {l('common.cancel')}
          </Button>
        </ActionColumn>
      </Row>
    </Wrapper>
  );
};

export default observer(AddSession);
