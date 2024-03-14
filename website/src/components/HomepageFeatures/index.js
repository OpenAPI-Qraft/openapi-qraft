import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Link from '@docusaurus/Link';

const FeatureList = [
  {
    title: 'Type-safe Requests',
    emoji: '🛡️',
    description: <>OpenAPI Qraft generates a fully-typed API Client with TSDoc from your OpenAPI Document.</>,
  },
  {
    title: 'Minimal amount of runtime code',
    emoji: '⚖️',
    description: <>Qraft CLI generates a minimal amount of runtime code to optimize bundle size and enhance security checks.</>,
  },
  {
    title: 'Powered by TanStack Query',
    emoji: '⚡',
    description: (
      <>
        OpenAPI Qraft is built on top of <Link href="https://tanstack.com/query/latest">TanStack Query</Link>, a powerful data fetching and caching library for
        React.
      </>
    ),
  },
];

function Feature({ emoji, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <div className={styles.featureEmoji} aria-hidden>
          {emoji}
        </div>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
