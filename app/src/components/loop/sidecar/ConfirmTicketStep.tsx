import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
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
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    max-width: 50%;
  `,
  Input: styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    padding-bottom: 15px;

    code {
      margin-top: 15px;
      word-break: break-all;
      background-color: ${props => props.theme.colors.overlay};
      padding: 15px;
      border-radius: 4px;
    }
  `,
};

const ConfirmTicketStep: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.loop.sidecar.ConfirmTicketStep');
  const { registerSidecarView } = useStore();

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
          <code>{registerSidecarView.ticket}</code>
        </Input>
        <WizardButtons
          onCancel={registerSidecarView.cancel}
          onNext={registerSidecarView.goToNextStep}
          nextLabel={l('common.confirm')}
        />
      </Fields>
    </Wrapper>
  );
};

export default observer(ConfirmTicketStep);
