import React from 'react';
import { fireEvent } from '@testing-library/react';
import Big from 'big.js';
import { renderWithProviders } from 'util/tests';
import Range from 'components/common/Range';

describe('Range component', () => {
  const handleChange = jest.fn();

  const render = (options?: {
    value?: Big;
    min?: Big;
    max?: Big;
    step?: number;
    showRadios?: boolean;
  }) => {
    const cmp = (
      <Range
        value={options && options.value}
        min={options && options.min}
        max={options && options.max}
        step={options && options.step}
        showRadios={options && options.showRadios}
        onChange={handleChange}
      />
    );
    return renderWithProviders(cmp);
  };

  it('should display slider and value by default', () => {
    const { getByText, getByLabelText } = render();
    expect(getByLabelText('range-slider')).toBeInTheDocument();
    expect(getByText('50 sats')).toBeInTheDocument();
  });

  it('should accept custom props', () => {
    const { getByText, getByLabelText } = render({
      value: Big(5000),
      min: Big(2500),
      max: Big(7500),
      step: 100,
      showRadios: true,
    });
    expect(getByLabelText('range-slider')).toBeInTheDocument();
    expect(getByText('5,000 sats')).toBeInTheDocument();
    expect(getByText('2,500 sats')).toBeInTheDocument();
    expect(getByText('7,500 sats')).toBeInTheDocument();
    expect(getByText('Min')).toHaveAttribute('aria-checked', 'false');
    expect(getByText('Max')).toHaveAttribute('aria-checked', 'false');
  });

  it('should highlight Min radio when value equals min', () => {
    const { getByText } = render({ value: Big(0), showRadios: true });
    expect(getByText('Min')).toHaveAttribute('aria-checked', 'true');
  });

  it('should highlight Max radio when value equals max', () => {
    const { getByText } = render({ value: Big(100), showRadios: true });
    expect(getByText('Max')).toHaveAttribute('aria-checked', 'true');
  });

  it('should trigger the event when slider changed', () => {
    const { getByLabelText } = render();
    fireEvent.change(getByLabelText('range-slider'), { target: { value: '25' } });
    expect(handleChange).toBeCalledWith(Big(25));
  });

  it('should trigger the event when min button clicked', () => {
    const { getByText } = render({ showRadios: true });
    fireEvent.click(getByText('Min'));
    expect(handleChange).toBeCalledWith(Big(0));
  });

  it('should trigger the event when max button clicked', () => {
    const { getByText } = render({ showRadios: true });
    fireEvent.click(getByText('Max'));
    expect(handleChange).toBeCalledWith(Big(100));
  });
});
