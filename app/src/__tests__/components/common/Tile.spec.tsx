import React, { ReactNode } from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from 'util/tests';
import Tile from 'components/common/Tile';

describe('Tile component', () => {
  const handleArrowClick = jest.fn();

  const render = (text?: string, children?: ReactNode) => {
    const cmp = (
      <Tile title="Test Tile" text={text} onMaximizeClick={handleArrowClick}>
        {children}
      </Tile>
    );
    return renderWithProviders(cmp);
  };

  it('should display the title', () => {
    const { getByText } = render();
    expect(getByText('Test Tile')).toBeInTheDocument();
  });

  it('should display the text', () => {
    const { getByText } = render('test text');
    expect(getByText('test text')).toBeInTheDocument();
  });

  it('should display child components', () => {
    const { getByText } = render(undefined, 'test child');
    expect(getByText('test child')).toBeInTheDocument();
  });

  it('should handle the arrow click event', () => {
    const { getByText } = render();
    fireEvent.click(getByText('maximize.svg'));
    expect(handleArrowClick).toBeCalled();
  });
});
