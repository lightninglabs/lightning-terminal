import React, { ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import { SidecarRegisterSteps } from 'types/state';
import { useStore } from 'store';
import Wizard from 'components/common/Wizard';
import ConfirmTicketStep from './ConfirmTicketStep';
import EnterTicketStep from './EnterTicketStep';
import SidecarComplete from './SidecarComplete';
import TicketProcessingStep from './TicketProcessingStep';

const SidecarWizard: React.FC = () => {
  const { registerSidecarView, settingsStore } = useStore();

  let cmp: ReactNode;
  switch (registerSidecarView.currentStep) {
    case SidecarRegisterSteps.EnterTicket:
      cmp = <EnterTicketStep />;
      break;
    case SidecarRegisterSteps.ConfirmTicket:
      cmp = <ConfirmTicketStep />;
      break;
    case SidecarRegisterSteps.Processing:
      cmp = <TicketProcessingStep />;
      break;
    case SidecarRegisterSteps.Complete:
      cmp = <SidecarComplete />;
      break;
    default:
      return null;
  }

  return (
    <Wizard
      sidebar={settingsStore.sidebarVisible}
      onBackClick={registerSidecarView.goToPrevStep}
    >
      {cmp}
    </Wizard>
  );
};

export default observer(SidecarWizard);
