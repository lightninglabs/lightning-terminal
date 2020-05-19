import React, { ReactNode } from 'react';
import { ReactComponent as ArrowRight } from 'assets/icons/arrow-right.svg';
import { ReactComponent as Clock } from 'assets/icons/clock.svg';
import { ReactComponent as Download } from 'assets/icons/download.svg';
import { styled } from 'components/theme';

export { ReactComponent as ArrowLeft } from 'assets/icons/arrow-left.svg';
export { ReactComponent as Bolt } from 'assets/icons/bolt.svg';
export { ReactComponent as Bitcoin } from 'assets/icons/bitcoin.svg';
export { ReactComponent as Check } from 'assets/icons/check.svg';
export { ReactComponent as Chevrons } from 'assets/icons/chevrons.svg';
export { ReactComponent as Close } from 'assets/icons/close.svg';
export { ReactComponent as Dot } from 'assets/icons/dot.svg';
export { ReactComponent as Menu } from 'assets/icons/menu.svg';
export { ReactComponent as Minimize } from 'assets/icons/minimize.svg';
export { ReactComponent as Maximize } from 'assets/icons/maximize.svg';
export { ReactComponent as Refresh } from 'assets/icons/refresh-cw.svg';

interface IconComponents {
  'arrow-right': ReactNode;
  clock: ReactNode;
  download: ReactNode;
}

const components: IconComponents = {
  'arrow-right': <ArrowRight />,
  clock: <Clock />,
  download: <Download />,
};

const Styled = {
  Wrapper: styled.span`
    display: inline-block;
    cursor: pointer;
    color: ${props => props.theme.colors.whitish};

    &:hover {
      opacity: 80%;
    }
  `,
  Label: styled.span`
    margin-left: 5px;
  `,
};

interface Props {
  icon: keyof IconComponents;
  text?: string;
  onClick?: () => void;
  className?: string;
}

export const Icon: React.FC<Props> = ({ icon, text, onClick, className }) => {
  const { Wrapper, Label } = Styled;

  return (
    <Wrapper onClick={onClick} className={className}>
      {components[icon]}
      {text && <Label>{text}</Label>}
    </Wrapper>
  );
};
