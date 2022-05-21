import React from 'react';
import { Route, Routes } from 'react-router';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import BalanceSettings from './BalanceSettings';
import ExplorerSettings from './ExplorerSettings';
import GeneralSettings from './GeneralSettings';
import UnitSettings from './UnitSettings';

const Styled = {
  Wrapper: styled.div`
    padding: 40px 0;
  `,
};

const SettingsPage: React.FC = () => {
  const { Wrapper } = Styled;

  return (
    <Wrapper>
      <Routes>
        <Route path="/" element={<GeneralSettings />} />
        <Route path="unit" element={<UnitSettings />} />
        <Route path="balance" element={<BalanceSettings />} />
        <Route path="explorers" element={<ExplorerSettings />} />
      </Routes>
    </Wrapper>
  );
};

export default observer(SettingsPage);
