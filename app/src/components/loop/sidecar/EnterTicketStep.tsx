import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { TextArea } from 'components/base';
import WizardButtons from 'components/common/WizardButtons';
import WizardSummary from 'components/common/WizardSummary';

const Styled = {
  Wrapper: styled.div`
    flex-grow: 1;
    display: flex;
    justify-content: space-between;
    padding-top: 5px;
  `,
  Summary: styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  `,
  Fields: styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  `,
  Input: styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    padding-bottom: 15px;

    textarea {
      flex-grow: 1;
    }
  `,
};

const EnterTicketStep: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.loop.sidecar.EnterTicketStep');
  const { registerSidecarView } = useStore();
  const handleTicketChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    registerSidecarView.setTicket(e.target.value);
  }, []);

  const { Wrapper, Summary, Fields, Input } = Styled;
  return (
    <Wrapper>
      <Summary>
        <WizardSummary
          title={l('title')}
          heading={l('heading')}
          description={l('description')}
        />
      </Summary>
      <Fields>
        <Input>
          <TextArea
            placeholder="sidecar1a7be93f8..."
            value={registerSidecarView.ticket}
            onChange={handleTicketChange}
            aria-label="ticket-input"
          />
        </Input>
        <WizardButtons
          onCancel={registerSidecarView.cancel}
          onNext={registerSidecarView.goToNextStep}
        />
      </Fields>
    </Wrapper>
  );
};

export default observer(EnterTicketStep);
