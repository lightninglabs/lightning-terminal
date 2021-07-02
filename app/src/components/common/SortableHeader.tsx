import React, { useCallback } from 'react';
import { SortParams } from 'types/state';
import styled from '@emotion/styled';
import { ArrowDown, ArrowUp, HeaderFour } from 'components/base';

const Styled = {
  HeaderFour: styled(HeaderFour)<{ selected: boolean }>`
    ${props =>
      props.selected &&
      `
      color: ${props.theme.colors.white};
    `}

    &:hover {
      cursor: pointer;
      color: ${props => props.theme.colors.white};
    }
  `,
  Icon: styled.span`
    display: inline-block;
    margin-left: 6px;

    svg {
      padding: 0;
    }
  `,
};

interface Props<T> {
  field: keyof T;
  sort: SortParams<T>;
  onSort: (field: SortParams<T>['field'], descending: boolean) => void;
}

const SortableHeader = <T,>({
  field,
  sort,
  onSort,
  children,
}: React.PropsWithChildren<Props<T>>) => {
  const selected = field === sort.field;
  const SortIcon = sort.descending ? ArrowDown : ArrowUp;

  const handleSortClick = useCallback(() => {
    const descending = selected ? !sort.descending : false;
    onSort(field, descending);
  }, [selected, sort.descending, field, onSort]);

  const { HeaderFour, Icon } = Styled;
  return (
    <HeaderFour selected={selected} onClick={handleSortClick}>
      {children}
      {selected && (
        <Icon>
          <SortIcon size="x-small" />
        </Icon>
      )}
    </HeaderFour>
  );
};

export default SortableHeader;
