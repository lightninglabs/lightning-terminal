import React from 'react';
import { styled } from 'components/theme';
import { Title } from './text';

const Styled = {
  TileWrap: styled.div`
    min-height: 100px;
    padding: 15px;
    background-color: ${props => props.theme.colors.tileBack};
    border-radius: 4px;
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
  text?: string;
}

const Tile: React.FC<Props> = ({ title, text, children }) => {
  const { TileWrap, Text } = Styled;

  return (
    <TileWrap>
      <Title>{title}</Title>
      {text ? <Text>{text}</Text> : children}
    </TileWrap>
  );
};

export default Tile;
