import styled from '@emotion/styled';
import { ReactComponent as AlertTriangleIcon } from 'assets/icons/alert-triangle.svg';
import { ReactComponent as ArrowDownCircleIcon } from 'assets/icons/arrow-down-circle.svg';
import { ReactComponent as ArrowDownIcon } from 'assets/icons/arrow-down.svg';
import { ReactComponent as ArrowLeftIcon } from 'assets/icons/arrow-left.svg';
import { ReactComponent as ArrowRightIcon } from 'assets/icons/arrow-right.svg';
import { ReactComponent as ArrowUpCircleIcon } from 'assets/icons/arrow-up-circle.svg';
import { ReactComponent as ArrowUpIcon } from 'assets/icons/arrow-up.svg';
import { ReactComponent as BarChartIcon } from 'assets/icons/bar-chart.svg';
import { ReactComponent as BitcoinIcon } from 'assets/icons/bitcoin.svg';
import { ReactComponent as BoltIcon } from 'assets/icons/bolt.svg';
import { ReactComponent as CheckIcon } from 'assets/icons/check.svg';
import { ReactComponent as ChevronDownIcon } from 'assets/icons/chevron-down.svg';
import { ReactComponent as ChevronUpIcon } from 'assets/icons/chevron-up.svg';
import { ReactComponent as ChevronsLeftIcon } from 'assets/icons/chevrons-left.svg';
import { ReactComponent as ChevronsRightIcon } from 'assets/icons/chevrons-right.svg';
import { ReactComponent as ChevronsIcon } from 'assets/icons/chevrons.svg';
import { ReactComponent as ClockIcon } from 'assets/icons/clock.svg';
import { ReactComponent as CloseIcon } from 'assets/icons/close.svg';
import { ReactComponent as CloudLightningIcon } from 'assets/icons/cloud-lightning.svg';
import { ReactComponent as CopyIcon } from 'assets/icons/copy.svg';
import { ReactComponent as DotIcon } from 'assets/icons/dot.svg';
import { ReactComponent as DownloadIcon } from 'assets/icons/download.svg';
import { ReactComponent as HelpCircleIcon } from 'assets/icons/help-circle.svg';
import { ReactComponent as ListIcon } from 'assets/icons/list.svg';
import { ReactComponent as MaximizeIcon } from 'assets/icons/maximize.svg';
import { ReactComponent as MenuIcon } from 'assets/icons/menu.svg';
import { ReactComponent as MinimizeIcon } from 'assets/icons/minimize.svg';
import { ReactComponent as RefreshIcon } from 'assets/icons/refresh-cw.svg';
import { ReactComponent as SettingsIcon } from 'assets/icons/settings.svg';
import { ReactComponent as CancelIcon } from 'assets/icons/slash.svg';
import { ReactComponent as UserPlusIcon } from 'assets/icons/user-plus.svg';
import { ReactComponent as QRCodeIcon } from 'assets/icons/qr.svg';
import { ReactComponent as BoltOutlinedIcon } from 'assets/icons/bolt-outlined.svg';
import { ReactComponent as PlugIcon } from 'assets/icons/plug.svg';

interface IconProps {
  size?: 'x-small' | 'small' | 'medium' | 'large' | 'x-large';
  onClick?: () => void;
  disabled?: boolean;
}

const Icon = styled.span<IconProps>`
  display: inline-block;
  padding: 6px;
  transition: all 0.3s;

  ${props =>
    props.onClick &&
    `
    border-radius: 36px;
    cursor: pointer;
    &:hover {
      color: ${props.theme.colors.blue};
      background-color: ${props.theme.colors.offWhite};
    }
  `}

  ${props =>
    props.disabled &&
    `
    color: ${props.theme.colors.lightBlue};
  `}

  ${props =>
    props.size === 'x-small' &&
    `
      width: 16px;
      height: 16px;
    `}

  ${props =>
    props.size === 'small' &&
    `
      width: 24px;
      height: 24px;
    `}

  ${props =>
    (props.size === 'medium' || !props.size) &&
    `
      width: 30px;
      height: 30px;
    `}

  ${props =>
    props.size === 'large' &&
    `
      width: 36px;
      height: 36px;
    `}

  ${props =>
    props.size === 'x-large' &&
    `
      width: 48px;
      height: 48px;
    `}
`;

export const AlertTriangle = Icon.withComponent(AlertTriangleIcon);
export const ArrowLeft = Icon.withComponent(ArrowLeftIcon);
export const ArrowRight = Icon.withComponent(ArrowRightIcon);
export const ArrowUp = Icon.withComponent(ArrowUpIcon);
export const ArrowDown = Icon.withComponent(ArrowDownIcon);
export const ArrowUpCircle = Icon.withComponent(ArrowUpCircleIcon);
export const ArrowDownCircle = Icon.withComponent(ArrowDownCircleIcon);
export const Cancel = Icon.withComponent(CancelIcon);
export const Clock = Icon.withComponent(ClockIcon);
export const Download = Icon.withComponent(DownloadIcon);
export const Bolt = Icon.withComponent(BoltIcon);
export const Bitcoin = Icon.withComponent(BitcoinIcon);
export const Check = Icon.withComponent(CheckIcon);
export const ChevronDown = Icon.withComponent(ChevronDownIcon);
export const ChevronUp = Icon.withComponent(ChevronUpIcon);
export const Chevrons = Icon.withComponent(ChevronsIcon);
export const ChevronsLeft = Icon.withComponent(ChevronsLeftIcon);
export const ChevronsRight = Icon.withComponent(ChevronsRightIcon);
export const Close = Icon.withComponent(CloseIcon);
export const CloudLightning = Icon.withComponent(CloudLightningIcon);
export const Copy = Icon.withComponent(CopyIcon);
export const Dot = Icon.withComponent(DotIcon);
export const HelpCircle = Icon.withComponent(HelpCircleIcon);
export const Menu = Icon.withComponent(MenuIcon);
export const Minimize = Icon.withComponent(MinimizeIcon);
export const Maximize = Icon.withComponent(MaximizeIcon);
export const Refresh = Icon.withComponent(RefreshIcon);
export const Settings = Icon.withComponent(SettingsIcon);
export const UserPlus = Icon.withComponent(UserPlusIcon);
export const BarChart = Icon.withComponent(BarChartIcon);
export const List = Icon.withComponent(ListIcon);
export const QRCode = Icon.withComponent(QRCodeIcon);
export const BoltOutlined = Icon.withComponent(BoltOutlinedIcon);
export const Plug = Icon.withComponent(PlugIcon);
