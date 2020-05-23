import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from 'util/tests';
import Checkbox from 'components/common/Checkbox';

describe('Checkbox component', () => {
  const handleChange = jest.fn();

  const render = (checked?: boolean, disabled?: boolean) => {
    const cmp = (
      <Checkbox checked={checked} disabled={disabled} onChange={handleChange} />
    );
    return renderWithProviders(cmp);
  };

  it('should display checked', () => {
    const { getByText } = render(true);
    expect(getByText('check.svg')).toBeInTheDocument();
  });

  it('should display unchecked', () => {
    const { queryByText } = render(false);
    expect(queryByText('check.svg')).not.toBeInTheDocument();
  });

  it('should trigger onChange event', () => {
    const { getByText } = render(true);
    fireEvent.click(getByText('check.svg'));
    expect(handleChange).toBeCalledWith(false);
  });
});
