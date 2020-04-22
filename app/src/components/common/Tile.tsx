import React from 'react';
import { styled } from 'components/theme';
import { ArrowRight } from './icons';
import { Title } from './text';

const Styled = {
  TileWrap: styled.div`
    min-height: 105px;
    padding: 15px;
    background-color: ${props => props.theme.colors.tileBack};
    border-radius: 4px;
  `,
  Header: styled.div`
    display: flex;
    justify-content: space-between;
  `,
  ArrowIcon: styled(ArrowRight)`
    width: 16px;
    margin-top: -5px;
    cursor: pointer;
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
  /**
   * optional click handler for the arrow which will not be
   * visible if this prop is not defined
   */
  onArrowClick?: () => void;
}

const Tile: React.FC<Props> = ({ title, text, onArrowClick, children }) => {
  const { TileWrap, Header, ArrowIcon, Text } = Styled;

  return (
    <TileWrap>
      <Header>
        <Title>{title}</Title>
        {onArrowClick && <ArrowIcon title="arrow-right" onClick={onArrowClick} />}
      </Header>
      {text ? <Text>{text}</Text> : children}
    </TileWrap>
  );
};

export default Tile;
