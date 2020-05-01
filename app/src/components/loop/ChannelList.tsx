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

    *:focus {
      outline: none;
    }
  `,
};

interface Props {
  channels: Channel[];
  enableSelection: boolean;
  selectedChannels: Channel[];
  onSelectionChange: (selectedChannels: Channel[]) => void;
  disabled: boolean;
}

const ChannelList: React.FC<Props> = ({
  channels,
  enableSelection,
  selectedChannels,
  onSelectionChange,
  disabled,
}) => {
  const handleRowChecked = (channel: Channel, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedChannels, channel]);
    } else {
      onSelectionChange(selectedChannels.filter(c => c.chanId !== channel.chanId));
    }
  };

  const sortedChannels = channels
    .slice()
    .sort((a, b) => b.balancePercent - a.balancePercent);

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
                  rowCount={sortedChannels.length}
                  rowHeight={ROW_HEIGHT}
                  rowRenderer={({ index, key, style }) => (
                    <ChannelRow
                      key={key}
                      style={style}
                      channel={sortedChannels[index]}
                      editable={enableSelection}
                      checked={selectedChannels.includes(sortedChannels[index])}
                      disabled={disabled}
                      dimmed={
                        disabled && !selectedChannels.includes(sortedChannels[index])
                      }
                      onChange={handleRowChecked}
                    />
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
