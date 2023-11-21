import React, { FormEvent, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useStore } from 'store';
import { usePrefixedTranslation } from 'hooks';
import { Collapse } from 'react-collapse';
import { Column, Row, ChevronUp, ChevronDown } from 'components/base';
import { Paragraph, Small, Label } from 'components/common/v2/Text';
import OverlayFormWrap from 'components/common/OverlayFormWrap';
import FormField from 'components/common/FormField';
import FormInput from 'components/common/FormInput';
import FormInputNumber from 'components/common/FormInputNumber';
import FormSelect from 'components/common/FormSelect';
import FormDate from 'components/common/FormDate';
import FormSwitch from 'components/common/v2/FormSwitch';
import PurpleButton from './PurpleButton';
import { PermissionTypeValues } from 'store/views/addSessionView';

const Styled = {
  Wrapper: styled.div`
    padding: 150px 0;
    background-color: ${props => props.theme.colors.blue};
  `,
  PermissionTypes: styled.div``,
  PermissionType: styled.div<{ active?: boolean }>`
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 4px;
    margin-top: 8px;
    transition: background-color 200ms ease-in-out;

    &:hover {
      background-color: ${props => props.theme.colors.lightBlue};
    }

    ${props => props.active && `background-color: ${props.theme.colors.lightBlue};`};
  `,
  Permissions: styled.div`
    background-color: ${props => props.theme.colors.lightningNavy};
    padding: 24px 24px 8px 24px;
    border-radius: 4px;
    margin-top: 8px;
  `,
  Permission: styled.div`
    display: flex;
    justify-content: space-between;
    padding-bottom: 16px;
  `,
  FormSelect: styled(FormSelect)`
    .rc-select {
      font-family: ${props => props.theme.fonts.open.regular};
      font-size: ${props => props.theme.sizes.m};
      background-color: ${props => props.theme.colors.blue};
      padding: 12px 40px 8px 0px;
    }

    .rc-select-selection-item {
      padding-left: 0;
      margin-left: -2px;
    }
  `,
  FormInput: styled(FormInput)`
    input {
      font-family: ${props => props.theme.fonts.open.regular};
      font-size: ${props => props.theme.sizes.m};
      background-color: ${props => props.theme.colors.blue};
      padding: 12px 40px 12px 0px;
    }
  `,
  FormInputNumber: styled(FormInputNumber)`
    input {
      background-color: ${props => props.theme.colors.lightningNavy};
    }
  `,
  FormDate: styled(FormDate)`
    input {
      font-family: ${props => props.theme.fonts.open.regular};
      font-size: ${props => props.theme.sizes.m};
      background-color: ${props => props.theme.colors.blue};
      padding: 12px 40px 12px 0px;
      margin-top: 26px;
    }
  `,
  Small: styled(Small)`
    color: ${props => props.theme.colors.lightningGray};
  `,
  Button: styled(PurpleButton)`
    margin: 16px 16px 0 0;
  `,
  ToggleAdvanced: styled(Paragraph)`
    cursor: pointer;
  `,
  ProxyField: styled(FormField)`
    margin-top: 16px;
  `,
};

const CustomSessionPage: React.FC = () => {
  const { appView, addSessionView } = useStore();
  const { l } = usePrefixedTranslation('cmps.connect.CustomSessionPage');

  const handleBack = useCallback(() => {
    addSessionView.cancel();
    appView.goTo('/connect');
  }, [appView]);

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addSessionView.handleCustomSubmit();
  }, []);

  const setPermissionType = (permissionType: PermissionTypeValues) => {
    return () => {
      addSessionView.setPermissionType(permissionType);
    };
  };

  const togglePermission = (permission: string) => {
    return () => {
      addSessionView.togglePermission(permission);
    };
  };

  const {
    Wrapper,
    PermissionTypes,
    PermissionType,
    Permissions,
    Permission,
    FormSelect,
    FormInput,
    FormInputNumber,
    FormDate,
    Small,
    Button,
    ToggleAdvanced,
    ProxyField,
  } = Styled;
  return (
    <Wrapper>
      <OverlayFormWrap
        title={l('title')}
        description={l('description')}
        onBackClick={handleBack}
      >
        <form onSubmit={handleSubmit}>
          <Row>
            <Column cols={4}>
              <Label semiBold>{l('expiration')}</Label>

              <FormField>
                <FormSelect
                  value={addSessionView.expiration}
                  onChange={addSessionView.setExpiration}
                  options={addSessionView.expirationOptions}
                />
              </FormField>
            </Column>

            {addSessionView.expiration === 'custom' ? (
              <Column cols={4}>
                <FormField>
                  <FormDate
                    value={addSessionView.expirationDate}
                    onChange={addSessionView.setExpirationDate}
                    placeholder={l('date')}
                  />
                </FormField>
              </Column>
            ) : null}
          </Row>

          <Row>
            <Column>
              <Label semiBold>{l('permissionType')}</Label>

              <PermissionTypes>
                <PermissionType
                  active={addSessionView.permissionType === PermissionTypeValues.Admin}
                  onClick={setPermissionType(PermissionTypeValues.Admin)}
                >
                  <Paragraph bold>{l('admin')}</Paragraph>
                  <Small>{l('adminDesc')}</Small>
                </PermissionType>

                <PermissionType
                  active={addSessionView.permissionType === PermissionTypeValues.ReadOnly}
                  onClick={setPermissionType(PermissionTypeValues.ReadOnly)}
                >
                  <Paragraph bold>{l('readonly')}</Paragraph>
                  <Small>{l('readonlyDesc')}</Small>
                </PermissionType>

                <PermissionType
                  active={
                    addSessionView.permissionType === PermissionTypeValues.Liquidity
                  }
                  onClick={setPermissionType(PermissionTypeValues.Liquidity)}
                >
                  <Paragraph bold>{l('liquidity')}</Paragraph>
                  <Small>{l('liquidityDesc')}</Small>
                </PermissionType>

                <PermissionType
                  active={addSessionView.permissionType === PermissionTypeValues.Payments}
                  onClick={setPermissionType(PermissionTypeValues.Payments)}
                >
                  <Paragraph bold>{l('payments')}</Paragraph>
                  <Small>{l('paymentsDesc')}</Small>
                </PermissionType>

                <PermissionType
                  active={
                    addSessionView.permissionType === PermissionTypeValues.Messenger
                  }
                  onClick={setPermissionType(PermissionTypeValues.Messenger)}
                >
                  <Paragraph bold>{l('messenger')}</Paragraph>
                  <Small>{l('messengerDesc')}</Small>
                </PermissionType>

                <PermissionType
                  active={
                    addSessionView.permissionType === PermissionTypeValues.Custodial
                  }
                  onClick={setPermissionType(PermissionTypeValues.Custodial)}
                >
                  <Paragraph bold>{l('custodial')}</Paragraph>
                  <Small>{l('custodialDesc')}</Small>
                </PermissionType>

                <PermissionType
                  active={addSessionView.permissionType === PermissionTypeValues.Custom}
                  onClick={setPermissionType(PermissionTypeValues.Custom)}
                >
                  <Paragraph bold>{l('custom')}</Paragraph>
                  <Small>{l('customDesc')}</Small>
                </PermissionType>
              </PermissionTypes>
            </Column>

            <Column>
              <Label semiBold>Permissions</Label>

              <Permissions>
                {addSessionView.permissionType === PermissionTypeValues.Custodial && (
                  <FormField>
                    <Label semiBold space={8}>
                      {l('addBalance')}
                    </Label>

                    <FormInputNumber
                      value={addSessionView.custodialBalance}
                      onChange={addSessionView.setCustodialBalance}
                      placeholder="1,000,000"
                      extra={<b>sats</b>}
                    />
                  </FormField>
                )}

                <Permission>
                  <div>
                    <Paragraph bold>{l('permView')}</Paragraph>
                    <Small>{l('permViewDesc')}</Small>
                  </div>

                  <FormSwitch checked={true} />
                </Permission>

                <Permission>
                  <div>
                    <Paragraph bold>{l('permOpen')}</Paragraph>
                    <Small>{l('permOpenDesc')}</Small>
                  </div>

                  <FormSwitch
                    checked={addSessionView.permissions.openChannel}
                    onChange={togglePermission('openChannel')}
                  />
                </Permission>

                <Permission>
                  <div>
                    <Paragraph bold>{l('permClose')}</Paragraph>
                    <Small>{l('permCloseDesc')}</Small>
                  </div>

                  <FormSwitch
                    checked={addSessionView.permissions.closeChannel}
                    onChange={togglePermission('closeChannel')}
                  />
                </Permission>

                <Permission>
                  <div>
                    <Paragraph bold>{l('permFees')}</Paragraph>
                    <Small>{l('permFeesDesc')}</Small>
                  </div>

                  <FormSwitch
                    checked={addSessionView.permissions.setFees}
                    onChange={togglePermission('setFees')}
                  />
                </Permission>

                <Permission>
                  <div>
                    <Paragraph bold>{l('permLoop')}</Paragraph>
                    <Small>{l('permLoopDesc')}</Small>
                  </div>

                  <FormSwitch
                    checked={addSessionView.permissions.loop}
                    onChange={togglePermission('loop')}
                  />
                </Permission>

                <Permission>
                  <div>
                    <Paragraph bold>{l('permPool')}</Paragraph>
                    <Small>{l('permPoolDesc')}</Small>
                  </div>

                  <FormSwitch
                    checked={addSessionView.permissions.pool}
                    onChange={togglePermission('pool')}
                  />
                </Permission>

                <Permission>
                  <div>
                    <Paragraph bold>{l('permSend')}</Paragraph>
                    <Small>{l('permSendDesc')}</Small>
                  </div>

                  <FormSwitch
                    checked={addSessionView.permissions.send}
                    onChange={togglePermission('send')}
                  />
                </Permission>

                <Permission>
                  <div>
                    <Paragraph bold>{l('permReceive')}</Paragraph>
                    <Small>{l('permReceiveDesc')}</Small>
                  </div>

                  <FormSwitch
                    checked={addSessionView.permissions.receive}
                    onChange={togglePermission('receive')}
                  />
                </Permission>

                <Permission>
                  <div>
                    <Paragraph bold>{l('permSign')}</Paragraph>
                    <Small>{l('permSignDesc')}</Small>
                  </div>

                  <FormSwitch
                    checked={addSessionView.permissions.sign}
                    onChange={togglePermission('sign')}
                  />
                </Permission>
              </Permissions>
            </Column>
          </Row>

          <ToggleAdvanced bold onClick={addSessionView.toggleAdvanced}>
            {addSessionView.showAdvanced ? (
              <ChevronUp size="large" />
            ) : (
              <ChevronDown size="large" />
            )}
            {l('advanced')}
          </ToggleAdvanced>

          <Collapse isOpened={addSessionView.showAdvanced}>
            <ProxyField>
              <Label semiBold space={8}>
                {l('proxy')}
              </Label>

              <FormInput
                value={addSessionView.proxy}
                onChange={addSessionView.setProxy}
                placeholder={l('custom')}
              />
              <Small>{l('proxyDesc')}</Small>
            </ProxyField>
          </Collapse>

          <Button>{l('common.submit')}</Button>
          <Button secondary type="button" onClick={handleBack}>
            {l('common.cancel')}
          </Button>
        </form>
      </OverlayFormWrap>
    </Wrapper>
  );
};

export default observer(CustomSessionPage);
