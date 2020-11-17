import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { Unit, Units } from 'util/constants';
import { useStore } from 'store';
import { Button, Section, Small, SummaryItem } from 'components/base';
import FormField from 'components/common/FormField';
import FormInputNumber from 'components/common/FormInputNumber';
import Toggle from 'components/common/Toggle';
import { styled } from 'components/theme';

const Styled = {
  Section: styled(Section)`
    flex: 1;
  `,
  ApySummaryItem: styled(SummaryItem)`
    margin-top: 50px;
  `,
  Small: styled(Small)`
    color: ${props => props.theme.colors.gray};
  `,
  Actions: styled.div`
    margin: 30px auto;
    text-align: center;
  `,
};

const OrderFormSection: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.OrderFormSection');
  const { orderFormView } = useStore();

  const { Section, ApySummaryItem, Small, Actions } = Styled;
  return (
    <Section>
      <Actions>
        <Toggle
          flex
          options={orderFormView.orderOptions}
          value={orderFormView.orderType}
          onChange={orderFormView.setOrderType}
        />
      </Actions>
      <FormField
        label={l(`amountLabel${orderFormView.orderType}`)}
        error={orderFormView.amountError}
      >
        <FormInputNumber
          label={l(`amountLabel${orderFormView.orderType}`)}
          placeholder={l('amountPlaceholder')}
          extra={Units[Unit.sats].suffix}
          value={orderFormView.amount}
          onChange={orderFormView.setAmount}
        />
      </FormField>
      <FormField
        label={l(`premiumLabel${orderFormView.orderType}`)}
        error={orderFormView.premiumError}
      >
        <FormInputNumber
          label={l(`premiumLabel${orderFormView.orderType}`)}
          placeholder={l('premiumPlaceholder')}
          value={orderFormView.premium}
          onChange={orderFormView.setPremium}
          extra={
            <>
              <Button
                ghost
                borderless
                compact
                onClick={orderFormView.setSuggestedPremium}
              >
                {l('premiumSuggested')}
              </Button>
              <span>{Units[Unit.sats].suffix}</span>
            </>
          }
        />
      </FormField>
      <FormField label={l('minChanSizeLabel')} error={orderFormView.minChanSizeError}>
        <FormInputNumber
          label={l('minChanSizeLabel')}
          placeholder={l('minChanSizePlaceholder')}
          extra={Units[Unit.sats].suffix}
          value={orderFormView.minChanSize}
          onChange={orderFormView.setMinChanSize}
        />
      </FormField>
      <FormField label={l('feeLabel')} error={orderFormView.feeRateError}>
        <FormInputNumber
          label={l('feeLabel')}
          placeholder={l('feePlaceholder')}
          extra="sats/vbyte"
          value={orderFormView.maxBatchFeeRate}
          onChange={orderFormView.setMaxBatchFeeRate}
        />
      </FormField>
      <SummaryItem>
        <span>{l('durationLabel')}</span>
        <span className="text-right">
          2016
          <br />
          <Small>(~{l('durationWeeks')})</Small>
        </span>
      </SummaryItem>
      <SummaryItem>
        <span>{l('fixedRateLabel')}</span>
        <span>
          {orderFormView.perBlockFixedRate < 1
            ? `< 1`
            : `${orderFormView.perBlockFixedRate}`}
        </span>
      </SummaryItem>
      <ApySummaryItem strong>
        <span>{l('apyLabel')}</span>
        <span>{orderFormView.apy}%</span>
      </ApySummaryItem>
      <Actions>
        <Button disabled={!orderFormView.isValid} onClick={orderFormView.placeOrder}>
          {orderFormView.placeOrderLabel}
        </Button>
      </Actions>
    </Section>
  );
};

export default observer(OrderFormSection);
