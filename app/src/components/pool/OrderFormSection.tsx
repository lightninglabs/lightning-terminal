import React from 'react';
import { observer } from 'mobx-react-lite';
import { LeaseDuration } from 'types/state';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { Unit, Units } from 'util/constants';
import { useStore } from 'store';
import { Tier } from 'store/models/order';
import {
  Button,
  ChevronDown,
  ChevronUp,
  Scrollable,
  Section,
  Small,
  SummaryItem,
} from 'components/base';
import BlockTime from 'components/common/BlockTime';
import FormField from 'components/common/FormField';
import FormInputNumber from 'components/common/FormInputNumber';
import FormSelect from 'components/common/FormSelect';
import LoaderLines from 'components/common/LoaderLines';
import StatusDot from 'components/common/StatusDot';
import Tip from 'components/common/Tip';
import Toggle from 'components/common/Toggle';
import UnitCmp from 'components/common/Unit';

const Styled = {
  Section: styled(Section)`
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0;

    > div {
      padding: 15px;
    }
  `,
  OrderType: styled.div`
    margin: 15px auto 30px;
    text-align: center;
  `,
  Small: styled(Small)`
    color: ${props => props.theme.colors.gray};
  `,
  Options: styled.div<{ visible: boolean }>`
    overflow: hidden;
    max-height: ${props => (props.visible ? '360px' : '0')};
    transition: max-height 0.3s linear;
  `,
  OptionsButton: styled(Button)`
    opacity: 0.7;
    padding: 0;
  `,
  OptionsStatus: styled(StatusDot)<{ visible: boolean }>`
    margin-left: ${props => (props.visible ? '0' : '10px')} !important;
    opacity: ${props => (props.visible ? '1' : '0')};
    transition: all 0.5s;
  `,
  Divider: styled.div`
    margin: 15px 0 20px;
    border-bottom: 2px solid ${props => props.theme.colors.blue};
  `,
  Actions: styled.div`
    margin: 30px auto;
    text-align: center;
  `,
  LoaderLines: styled(LoaderLines)`
    .line {
      margin: 0 1px;
    }
  `,
};

const OrderFormSection: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.OrderFormSection');
  const { orderFormView } = useStore();

  const addlOptionsError =
    !!orderFormView.minChanSizeError || !!orderFormView.feeRateError;

  const {
    Section,
    OrderType,
    Small,
    Options,
    OptionsButton,
    OptionsStatus,
    Divider,
    Actions,
    LoaderLines,
  } = Styled;
  return (
    <Section>
      <Scrollable>
        <OrderType>
          <Toggle
            flex
            options={orderFormView.orderOptions}
            value={orderFormView.orderType}
            onChange={orderFormView.setOrderType}
          />
        </OrderType>
        <FormField
          label={l(`amountLabel${orderFormView.orderType}`)}
          error={orderFormView.amountError}
        >
          <FormInputNumber
            label={l(`amountLabel${orderFormView.orderType}`)}
            placeholder={l('amountPlaceholder')}
            extra={Units[Unit.sats].suffix}
            value={orderFormView.amount.toNumber()}
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
            value={orderFormView.premium.toNumber()}
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
        <Options visible={orderFormView.addlOptionsVisible}>
          {orderFormView.durationVisible && (
            <FormField label={l('durationLabel')}>
              <FormSelect
                label={l('durationLabel')}
                value={orderFormView.duration.toString()}
                onChange={v => orderFormView.setDuration(parseInt(v) as LeaseDuration)}
                options={orderFormView.durationOptions}
              />
            </FormField>
          )}
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
          {orderFormView.orderType === 'Bid' && (
            <FormField label={l('tierLabel')}>
              <FormSelect
                label={l('tierLabel')}
                value={orderFormView.minNodeTier.toString()}
                onChange={v => orderFormView.setMinNodeTier(parseInt(v) as Tier)}
                options={orderFormView.nodeTierOptions}
              />
            </FormField>
          )}
        </Options>
        <OptionsButton ghost borderless compact onClick={orderFormView.toggleAddlOptions}>
          {orderFormView.addlOptionsVisible ? <ChevronUp /> : <ChevronDown />}
          {orderFormView.addlOptionsVisible ? l('hideOptions') : l('viewOptions')}
          <OptionsStatus
            status="error"
            visible={!orderFormView.addlOptionsVisible && addlOptionsError}
          />
        </OptionsButton>
        <Divider />
        <Tip overlay={l('executionFeeTip')} capitalize={false} placement="topRight">
          <SummaryItem>
            <span>{l('executionFeeLabel')}</span>
            <span>
              {orderFormView.quoteLoading ? (
                <LoaderLines />
              ) : (
                <UnitCmp sats={orderFormView.executionFee} />
              )}
            </span>
          </SummaryItem>
        </Tip>
        <SummaryItem>
          <Tip overlay={l('chainFeeTip')} capitalize={false} placement="topRight">
            <span>{l('chainFeeLabel')}</span>
          </Tip>
          <span>
            {orderFormView.quoteLoading ? (
              <LoaderLines />
            ) : (
              <UnitCmp sats={orderFormView.worstChainFee} />
            )}
          </span>
        </SummaryItem>
        <SummaryItem>
          <span>{l('durationLabel')}</span>
          <span className="text-right">
            {orderFormView.derivedDuration} blocks
            <br />
            <Small>
              (<BlockTime blocks={orderFormView.derivedDuration} />)
            </Small>
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
        <SummaryItem>
          <span>{l('interestLabel')}</span>
          <span>{orderFormView.interestBps} bps</span>
        </SummaryItem>
        <SummaryItem strong>
          <span>{l('aprLabel')}</span>
          <span>{orderFormView.apr}%</span>
        </SummaryItem>
        <Actions>
          <Button
            primary={orderFormView.orderType === 'Bid'}
            danger={orderFormView.orderType === 'Ask'}
            ghost
            disabled={!orderFormView.isValid}
            onClick={orderFormView.placeOrder}
          >
            {orderFormView.placeOrderLabel}
          </Button>
        </Actions>
      </Scrollable>
    </Section>
  );
};

export default observer(OrderFormSection);
