import { createStore } from 'store';

describe('OrderFormView duration options', () => {
  it('does not list the open market on screen a second time', async () => {
    const store = createStore();
    await store.batchStore.fetchLeaseDurations();

    const options = store.orderFormView.durationOptions;
    const values = options.map(option => option.value);

    expect(options.some(option => option.label.startsWith('Viewing'))).toBe(false);
    expect(new Set(values).size).toBe(values.length);
    expect(values).toContain('2016');
    expect(store.orderFormView.durationSelectValue).toBe('2016');
  });

  it('keeps a viewing option when the market on screen is closed', async () => {
    const store = createStore();
    await store.batchStore.fetchLeaseDurations();
    store.batchStore.selectedLeaseDuration = 8064;

    const options = store.orderFormView.durationOptions;

    expect(options[0]).toEqual({
      label: 'Viewing (2 months, closed)',
      value: '0',
    });
    expect(options.filter(option => option.value === '8064')).toHaveLength(0);
    expect(store.orderFormView.durationSelectValue).toBe('0');
  });

  it('selects an explicit duration over the market on screen', async () => {
    const store = createStore();
    await store.batchStore.fetchLeaseDurations();
    store.orderFormView.setDuration(4032);

    expect(store.orderFormView.durationSelectValue).toBe('4032');
  });
});
