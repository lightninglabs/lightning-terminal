import React from 'react';
import { AutoSizer, List } from 'react-virtualized';
import { Observer, observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useStore } from 'store';
import { Button } from 'components/base';
import LoaderLines from 'components/common/LoaderLines';
import BatchRow, { BatchRowHeader, ROW_HEIGHT } from './BatchRow';

const Styled = {
  Wrapper: styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
  `,
  Content: styled.div`
    flex: 1 1 auto;

    .ReactVirtualized__List {
      // use consistent scrollbars across different platforms
      &::-webkit-scrollbar {
        width: 8px;
        background-color: rgba(0, 0, 0, 0);
        border-radius: 10px;
      }
      &::-webkit-scrollbar:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }
      &::-webkit-scrollbar-thumb:vertical {
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
      }
      &::-webkit-scrollbar-thumb:vertical:active {
        background-color: rgba(255, 255, 255, 0.6);
        border-radius: 10px;
      }
      &:focus {
        outline: none;
      }
    }
  `,
  More: styled.div`
    width: 80%;
    margin: 20px auto 0;
    text-align: center;
    border-top: 1px solid ${props => props.theme.colors.blue};
  `,
};

const BatchList: React.FC = () => {
  const { batchStore } = useStore();

  const { Wrapper, Content, More } = Styled;
  return (
    <Wrapper>
      <BatchRowHeader />
      <Content>
        <AutoSizer>
          {({ width, height }) => (
            <Observer>
              {() => (
                <List
                  rowCount={batchStore.sortedBatches.length}
                  rowHeight={ROW_HEIGHT}
                  rowRenderer={({ index, key, style }) => (
                    <BatchRow
                      key={key}
                      style={style}
                      batch={batchStore.sortedBatches[index]}
                    />
                  )}
                  width={width}
                  height={height}
                />
              )}
            </Observer>
          )}
        </AutoSizer>
      </Content>
      {batchStore.hasMoreBatches && (
        <More>
          {batchStore.loading ? (
            <LoaderLines />
          ) : (
            <Button
              borderless
              ghost
              onClick={batchStore.fetchBatches}
              disabled={batchStore.loading}
            >
              Load Older Batches
            </Button>
          )}
        </More>
      )}
    </Wrapper>
  );
};

export default observer(BatchList);
