import React from 'react';
import { usePrefixedTranslation } from 'hooks';
import { H3Text, SmallText, Title } from 'components/common/text';
import { styled } from 'components/theme';

const Styled = {
  Wrapper: styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    max-width: 240px;
  `,
  Title: styled(Title)`
    margin-top: 5px;
  `,
  Heading: styled(H3Text)`
    margin-top: 10px;
  `,
  Description: styled(SmallText)`
    opacity: 0.5;
  `,
  Channels: styled.div`
    line-height: 40px;
  `,
  Pill: styled.span`
    display: inline-block;
    width: 40px;
    height: 40px;
    padding: 5px;
    margin-right: 10px;
    text-align: center;
    background-color: ${props => props.theme.colors.tileBack};
    border-radius: 40px;
  `,
};

interface Props {
  title: string;
  heading: string;
  description: string;
  channelCount: number;
}

const StepSummary: React.FC<Props> = ({ title, heading, description, channelCount }) => {
  const { l } = usePrefixedTranslation('cmps.loop.swaps.StepSummary');

  const { Wrapper, Title, Heading, Description, Pill } = Styled;
  return (
    <Wrapper>
      <div>
        <Title>{title}</Title>
        <Heading>{heading}</Heading>
        <Description>{description}</Description>
      </div>
      <div>
        <Pill>{channelCount}</Pill>
        {l('channelsSelected')}
      </div>
    </Wrapper>
  );
};

export default StepSummary;
