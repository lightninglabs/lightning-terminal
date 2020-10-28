import React from 'react';
import { observer } from 'mobx-react-lite';
import { HeaderFour, Section } from 'components/base';
import { styled } from 'components/theme';

const Styled = {
  Section: styled(Section)`
    flex: 1;
  `,
};

const Chart: React.FC = () => {
  const { Section } = Styled;
  return (
    <Section>
      <HeaderFour>TODO: Chart</HeaderFour>
    </Section>
  );
};

export default observer(Chart);
