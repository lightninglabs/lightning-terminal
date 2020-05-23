import React, { ReactNode } from 'react';
import { styled } from 'components/theme';
import { Maximize } from './icons';
import { HeaderFour } from './text';

const Styled = {
  TileWrap: styled.div`
    min-height: 105px;
    padding: 15px;
    background-color: ${props => props.theme.colors.overlay};
    border-radius: 4px;
  `,
  Header: styled.div`
    display: flex;
    justify-content: space-between;
  `,
  MaximizeIcon: styled(Maximize)`
    width: 20px;
    height: 20px;
    padding: 4px;
    margin-top: -5px;
    cursor: pointer;

    &:hover {
      border-radius: 24px;
      background-color: ${props => props.theme.colors.purple};
    }
  `,
  Text: styled.div`
    font-size: ${props => props.theme.sizes.xl};
    line-height: 37px;
    letter-spacing: 0.43px;
    margin-top: 10px;
  `,
};

interface Props {
  /**
   * the title to display in the tile
   */
  title: string;
  /**
   * optional text to display in the tile. if this is not
   * provided, then the `children` will be displayed instead
   */
  text?: ReactNode;
  /**
   * optional click handler for the icon which will not be
   * visible if this prop is not defined
   */
  onMaximizeClick?: () => void;
}

const Tile: React.FC<Props> = ({ title, text, onMaximizeClick, children }) => {
  const { TileWrap, Header, MaximizeIcon, Text } = Styled;

  return (
    <TileWrap>
      <Header>
        <HeaderFour marginless>{title}</HeaderFour>
        {onMaximizeClick && <MaximizeIcon title="maximize" onClick={onMaximizeClick} />}
      </Header>
      {text ? <Text>{text}</Text> : children}
    </TileWrap>
  );
};

export default Tile;
