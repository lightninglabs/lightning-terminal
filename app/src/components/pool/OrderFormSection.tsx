import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { Unit, Units } from 'util/constants';
import { useStore } from 'store';
import { Button, Section } from 'components/base';
import FormField from 'components/common/FormField';
import FormInputNumber from 'components/common/FormInputNumber';
import Toggle from 'components/common/Toggle';
import { styled } from 'components/theme';

const Styled = {
  Section: styled(Section)`
    flex: 4;
  `,
  Actions: styled.div`
    margin: 30px auto;
    text-align: center;
  `,
};

const OrderFormSection: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.OrderFormSection');
  const { orderFormStore } = useStore();

  const { Section, Actions } = Styled;
  return (
    <Section>
      <Actions>
        <Toggle
          options={orderFormStore.orderOptions}
          value={orderFormStore.orderType}
          onChange={orderFormStore.setOrderType}
        />
      </Actions>
      <FormField
        label={l(`amountLabel${orderFormStore.orderType}`)}
        error={orderFormStore.amountError}
      >
        <FormInputNumber
          placeholder={l('amountPlaceholder')}
          suffix={Units[Unit.sats].suffix}
          value={orderFormStore.amount}
          onChange={orderFormStore.setAmount}
        />
      </FormField>
      <FormField label={l(`premiumLabel${orderFormStore.orderType}`)}>
        <FormInputNumber
          placeholder={l('premiumPlaceholder')}
          suffix={Units[Unit.sats].suffix}
          value={orderFormStore.premium}
          onChange={orderFormStore.setPremium}
        />
      </FormField>
      <FormField label={l('minChanSizeLabel')} error={orderFormStore.minChanSizeError}>
        <FormInputNumber
          placeholder={l('minChanSizePlaceholder')}
          suffix={Units[Unit.sats].suffix}
          value={orderFormStore.minChanSize}
          onChange={orderFormStore.setMinChanSize}
        />
      </FormField>
      <FormField label={l('feeLabel')} error={orderFormStore.feeRateError}>
        <FormInputNumber
          placeholder={l('feePlaceholder')}
          suffix="sats/vByte"
          value={orderFormStore.maxBatchFeeRate}
          onChange={orderFormStore.setMaxBatchFeeRate}
        />
      </FormField>
      <Actions>
        <Button disabled={!orderFormStore.isValid} onClick={orderFormStore.placeOrder}>
          {orderFormStore.placeOrderLabel}
        </Button>
      </Actions>
    </Section>
  );
};

export default observer(OrderFormSection);
