import React from 'react';
import { AutoSizer, List, WindowScroller } from 'react-virtualized';
import { observer, Observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useStore } from 'store';
import { ListContainer } from 'components/base';
import SessionRow, { ROW_HEIGHT, SessionRowHeader } from './SessionRow';

const Styled = {
  Wrapper: styled.div`
    margin: 40px 0;
  `,
};

const SessionList: React.FC = () => {
  const { sessionStore } = useStore();

  if (sessionStore.sortedSessions.length === 0) return null;

  const { Wrapper } = Styled;
  return (
    <Wrapper>
      <SessionRowHeader />
      <ListContainer>
        <AutoSizer disableHeight>
          {({ width }: { width: number }) => (
            <WindowScroller>
              {({
                height,
                isScrolling,
                onChildScroll,
                scrollTop,
                registerChild,
              }: any) => (
                <Observer>
                  {() => (
                    <div ref={(ref: any) => ref && registerChild(ref)}>
                      <List
                        autoHeight
                        height={height}
                        isScrolling={isScrolling}
                        onScroll={onChildScroll}
                        rowCount={sessionStore.sortedSessions.length}
                        rowHeight={ROW_HEIGHT}
                        rowRenderer={({ index, key, style }: any) => (
                          <div key={key} style={style}>
                            <SessionRow session={sessionStore.sortedSessions[index]} />
                          </div>
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

export default observer(SessionList);
