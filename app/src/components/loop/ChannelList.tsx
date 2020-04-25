import React from 'react';
import { AutoSizer, List, WindowScroller } from 'react-virtualized';
import { Channel } from 'types/state';
import styled from '@emotion/styled';
import ChannelRow, { ChannelRowHeader, ROW_HEIGHT } from './ChannelRow';

const Styled = {
  Wrapper: styled.section`
    margin: 50px 0;
  `,
  ListContainer: styled.div`
    /** 
     * the virtualized list doesn't play nice with the bootstrap row -15px
     * margin. We need to manually offset the container and remove the
     * padding from the last column to get the alignment correct
     */
    margin-right: -15px;

    .col:last-child {
      padding-right: 0;
    }
  `,
};

interface Props {
  channels: Channel[];
}

const ChannelList: React.FC<Props> = ({ channels }) => {
  const { Wrapper, ListContainer } = Styled;
  return (
    <Wrapper>
      <ChannelRowHeader />
      <ListContainer>
        <AutoSizer disableHeight>
          {({ width }) => (
            <WindowScroller>
              {({ height, isScrolling, onChildScroll, scrollTop }) => (
                <List
                  autoHeight
                  height={height}
                  isScrolling={isScrolling}
                  onScroll={onChildScroll}
                  rowCount={channels.length}
                  rowHeight={ROW_HEIGHT}
                  rowRenderer={({ index, key, style }) => (
                    <ChannelRow key={key} channel={channels[index]} style={style} />
                  )}
                  scrollTop={scrollTop}
                  width={width}
                />
              )}
            </WindowScroller>
          )}
        </AutoSizer>
      </ListContainer>
    </Wrapper>
  );
};

export default ChannelList;
