import React from 'react';
import { AutoSizer, List, WindowScroller } from 'react-virtualized';
import { observer, Observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useStore } from 'store';
import { ListContainer } from 'components/base';
import HistoryRow, { HistoryRowHeader, ROW_HEIGHT } from './HistoryRow';

const Styled = {
  Wrapper: styled.div`
    margin: 100px 0;
  `,
};

const HistoryList: React.FC = () => {
  const { swapStore } = useStore();

  const { Wrapper } = Styled;
  return (
    <Wrapper>
      <HistoryRowHeader />
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
                        rowCount={swapStore.sortedSwaps.length}
                        rowHeight={ROW_HEIGHT}
                        rowRenderer={({ index, key, style }) => (
                          <HistoryRow
                            key={key}
                            style={style}
                            swap={swapStore.sortedSwaps[index]}
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

export default observer(HistoryList);
