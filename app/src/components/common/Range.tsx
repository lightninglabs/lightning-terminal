import React from 'react';
import { styled } from 'components/theme';
import { RangeInput } from './base';
import Radio from './Radio';

const Styled = {
  RadioGroup: styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 40px;
  `,
  DisplayValue: styled.div`
    text-align: center;
    font-size: ${props => props.theme.sizes.xl};
  `,
};

interface Props {
  value: number;
  min: number;
  max: number;
  step?: number;
  showRadios?: boolean;
  onChange: (value: number) => void;
}

const Range: React.FC<Props> = ({ value, min, max, step = 1, showRadios, onChange }) => {
  const { RadioGroup, DisplayValue } = Styled;
  return (
    <div>
      {showRadios && (
        <RadioGroup>
          <Radio
            text="Min"
            description={`${min.toLocaleString()} SAT`}
            onClick={() => onChange(min)}
            active={min === value}
          />
          <Radio
            text="Max"
            description={`${max.toLocaleString()} SAT`}
            onClick={() => onChange(max)}
            active={max === value}
            right
          />
        </RadioGroup>
      )}
      <div>
        <RangeInput
          className="custom-range"
          type="range"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={e => onChange(parseInt(e.target.value))}
        />
      </div>
      <DisplayValue>{value.toLocaleString()} SAT</DisplayValue>
    </div>
  );
};

export default Range;
