import React from 'react';
import { AutoSizer, List, WindowScroller } from 'react-virtualized';
import { observer, Observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useStore } from 'store';
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

    *:focus {
      outline: none;
    }
  `,
};

const ChannelList: React.FC = () => {
  const { buildSwapView } = useStore();

  const { Wrapper, ListContainer } = Styled;
  return (
    <Wrapper data-tour="channel-list">
      <ChannelRowHeader />
      <ListContainer>
        <AutoSizer disableHeight>
          {({ width }) => (
            <WindowScroller>
              {({ height, isScrolling, onChildScroll, scrollTop, registerChild }) => (
                <Observer>
                  {() => (
                    <div ref={ref => ref && registerChild(ref)}>
                      <List
                        autoHeight
                        height={height}
                        isScrolling={isScrolling}
                        onScroll={onChildScroll}
                        rowCount={buildSwapView.channels.length}
                        rowHeight={ROW_HEIGHT}
                        rowRenderer={({ index, key, style }) => (
                          <ChannelRow
                            key={key}
                            style={style}
                            channel={buildSwapView.channels[index]}
                          />
                        )}
                        scrollTop={scrollTop}
                        width={width}
                      />
                    </div>
                  )}
                </Observer>
              )}
            </WindowScroller>
          )}
        </AutoSizer>
      </ListContainer>
    </Wrapper>
  );
};

export default observer(ChannelList);
