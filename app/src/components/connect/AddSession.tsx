import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
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
  const { sessionStore } = useStore();
  const [label, setLabel] = useState('');
  const [expiry, setExpiry] = useState(30);
  const [editing, setEditing] = useState(false);
  const toggleEditing = useCallback(() => setEditing(e => !e), []);
  const handleSubmit = useCallback(() => {
    const expDate = new Date(Date.now() + expiry * 24 * 60 * 60 * 1000);
    sessionStore.addSession(label, expDate);
    setEditing(false);
  }, [label, expiry]);

  const { Wrapper, AddSection, ActionColumn } = Styled;
  if (!editing) {
    return (
      <AddSection>
        <Button onClick={toggleEditing}>Create a New Session</Button>
      </AddSection>
    );
  }

  return (
    <Wrapper>
      <Row>
        <Column cols={4} className="offset-1">
          <FormField label="Label">
            <FormInput value={label} onChange={setLabel} placeholder="My First Session" />
          </FormField>
        </Column>
        <Column cols={2}>
          <FormField label="Expiration">
            <FormInputNumber value={expiry} onChange={setExpiry} extra="days" />
          </FormField>
        </Column>
        <ActionColumn className="">
          <Button primary onClick={handleSubmit}>
            Submit
          </Button>
          <Button ghost borderless onClick={handleSubmit}>
            Cancel
          </Button>
        </ActionColumn>
      </Row>
    </Wrapper>
  );
};

export default observer(AddSession);
