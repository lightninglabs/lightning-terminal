import React from 'react';
import { renderWithProviders } from 'util/tests';
import { prefixTranslation } from 'util/translate';
import { SubServerStatusMessage } from 'components/common/SubServerRequired';

describe('SubServer Status Message Component', () => {
  const render = (isDisabled: boolean, errorMessage?: string) => {
    const cmp = (
      <SubServerStatusMessage isDisabled={isDisabled} errorMessage={errorMessage} />
    );
    return renderWithProviders(cmp);
  };

  it('should display disabled', () => {
    const { getByText } = render(true);
    const { l } = prefixTranslation('cmps.common.SubServerStatus');
    expect(getByText(l('isDisabled'))).toBeInTheDocument();
  });

  it('should display error', () => {
    const { getByText } = render(false);
    const { l } = prefixTranslation('cmps.common.SubServerStatus');
    expect(getByText(l('isError'))).toBeInTheDocument();
  });

  it('should match error message', () => {
    const { getByText } = render(false, 'Test error message');
    expect(getByText('Test error message')).toBeInTheDocument();
  });
});
