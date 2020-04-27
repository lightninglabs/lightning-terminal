import React from 'react';
import StatusDot from 'components/common/StatusDot';

export default {
  title: 'Components/Status Dot',
  component: StatusDot,
  parameters: { centered: true },
};

export const Success = () => <StatusDot status="success" />;

export const Warn = () => <StatusDot status="warn" />;

export const Error = () => <StatusDot status="error" />;

export const Idle = () => <StatusDot status="idle" />;
