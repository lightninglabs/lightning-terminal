import React, { ChangeEvent, useCallback } from 'react';
import { styled } from 'components/theme';
import { RangeInput } from '../base';
import Radio from './Radio';
import Unit from './Unit';

const Styled = {
  RadioGroup: styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 40px;
  `,
  DisplayValue: styled.label`
    display: block;
    text-align: center;
    font-size: ${props => props.theme.sizes.xl};
  `,
};

interface Props {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  showRadios?: boolean;
  onChange?: (value: number) => void;
}

const Range: React.FC<Props> = ({
  value = 50,
  min = 0,
  max = 100,
  step = 1,
  showRadios,
  onChange,
}) => {
  const handleMinClicked = useCallback(() => onChange && onChange(min), [min, onChange]);
  const handleMaxClicked = useCallback(() => onChange && onChange(max), [max, onChange]);
  const handleInputClicked = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => onChange && onChange(parseInt(e.target.value)),
    [onChange],
  );

  const { RadioGroup, DisplayValue } = Styled;
  return (
    <div>
      {showRadios && (
        <RadioGroup>
          <Radio
            text="Min"
            description={<Unit sats={min} />}
            onClick={handleMinClicked}
            active={min === value}
          />
          <Radio
            text="Max"
            description={<Unit sats={max} />}
            onClick={handleMaxClicked}
            active={max === value}
            right
          />
        </RadioGroup>
      )}
      <div>
        <RangeInput
          aria-label="range-slider"
          className="custom-range"
          type="range"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={handleInputClicked}
        />
      </div>
      <DisplayValue>
        <Unit sats={value} />
      </DisplayValue>
    </div>
  );
};

export default Range;
