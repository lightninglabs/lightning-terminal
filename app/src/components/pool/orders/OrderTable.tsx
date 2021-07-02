import styled from '@emotion/styled';

export const Table = styled.table`
  width: 100%;
`;

export const TableHeader = styled.th<{ right?: boolean }>`
  font-size: ${props => props.theme.sizes.xs};
  padding: 2px 10px;
  text-align: ${props => (props.right ? 'right' : 'left')};

  &:first-of-type {
    padding-left: 0;
  }

  &:last-of-type {
    padding-right: 0;
  }
`;

export const TableRow = styled.tr<{ selectable?: boolean; selected?: boolean }>`
  background-color: ${props =>
    props.selected ? props.theme.colors.overlay : 'transparent'};

  ${props =>
    props.selectable &&
    `  
    &:hover {
      cursor: pointer;
      background-color: ${props.theme.colors.overlay};
    }
  `}
`;

export const TableCell = TableHeader.withComponent('td');
