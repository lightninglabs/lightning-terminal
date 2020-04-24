import React, { useEffect } from 'react';
import { StoryContext } from '@storybook/addons';
import { Store } from 'store';
import { Layout } from '../components/layout';

export default {
  title: 'Layout',
  component: Layout,
};

const SampleContent = () => (
  <>
    <h1 style={{ textAlign: 'center' }}>Lorem ipsum dolor sit amet</h1>
    {[...Array(10)].map((_, i) => (
      <p key={i}>
        At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis
        praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias
        excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui
        officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem
        rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est
        eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere
        possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem
        quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et
        voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic
        tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias
        consequatur aut perferendis doloribus asperiores repellat.
      </p>
    ))}
  </>
);

export const Default = () => <Layout />;

export const WithContent = () => (
  <Layout>
    <SampleContent />
  </Layout>
);

export const Collapsed = (ctx: StoryContext) => {
  useEffect(() => {
    // grab the store from the Storybook parameter defined in preview.tsx
    const store = ctx.parameters.store as Store;
    store.sidebarCollapsed = true;

    // change back to expanded when the component is unmounted
    return () => {
      store.sidebarCollapsed = false;
    };
  }, []);

  return (
    <Layout>
      <SampleContent />
    </Layout>
  );
};
