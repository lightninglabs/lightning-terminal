import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { Unit, Units } from 'util/constants';
import { useStore } from 'store';
import { Button, HeaderFour } from 'components/base';
import FormField from 'components/common/FormField';
import FormInputNumber from 'components/common/FormInputNumber';
import Toggle from 'components/common/Toggle';
import { styled } from 'components/theme';

const Styled = {
  Wrapper: styled.section`
    flex: 4;
    padding: 15px;
    margin: 15px 0;
    background-color: ${props => props.theme.colors.overlay};
    border-radius: 4px;
  `,
  Actions: styled.div`
    margin: 30px auto;
    text-align: center;
  `,
};

const OrderFormSection: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.OrderFormSection');
  const { orderFormStore } = useStore();

  const { Wrapper, Actions } = Styled;
  return (
    <Wrapper>
      <HeaderFour>{l('title')}</HeaderFour>
      <Actions>
        <Toggle
          options={orderFormStore.options}
          value={orderFormStore.orderType}
          onChange={orderFormStore.setOrderType}
        />
      </Actions>
      <FormField
        label={l('amountLabel')}
        info={orderFormStore.amountInfo}
        error={orderFormStore.amountError}
      >
        <FormInputNumber
          placeholder={l('amountPlaceholder')}
          suffix={Units[Unit.sats].suffix}
          value={orderFormStore.amount}
          onChange={orderFormStore.setAmount}
        />
      </FormField>
      <FormField label={orderFormStore.durationLabel} info={orderFormStore.durationInfo}>
        <FormInputNumber
          placeholder={l('durationPlaceholder')}
          suffix={l('durationSuffix')}
          value={orderFormStore.duration}
          onChange={orderFormStore.setDuration}
        />
      </FormField>
      <FormField
        label={l('interestLabel')}
        info={orderFormStore.interestRateInfo}
        error={orderFormStore.interestRateError}
      >
        <FormInputNumber
          placeholder={l('interestPlaceholder')}
          suffix="%"
          value={orderFormStore.interestRate}
          onChange={orderFormStore.setInterestRate}
        />
      </FormField>
      <FormField label={l('feeLabel')} error={orderFormStore.feeRateError}>
        <FormInputNumber
          placeholder={l('feePlaceholder')}
          suffix="sats/kw"
          value={orderFormStore.feeRate}
          onChange={orderFormStore.setFeeRate}
        />
      </FormField>
      <Actions>
        <Button disabled={!orderFormStore.isValid} onClick={orderFormStore.placeOrder}>
          {orderFormStore.placeOrderLabel}
        </Button>
      </Actions>
    </Wrapper>
  );
};

export default observer(OrderFormSection);
