import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Link from '@docusaurus/Link';

const FeatureList = [
  {
    title: 'Type-safe Requests',
    emoji: '🛡️',
    description: <>API Client for React with strong types and TSDoc generation</>,
  },
  {
    title: 'Lightweight & Secure',
    emoji: '⚖️',
    description: (
      <>
        Minimal amount of generated <em>runtime code</em> optimizes bundle size and enhances security checks
      </>
    ),
  },
  {
    title: 'Powered by TanStack Query',
    emoji: '⚡',
    description: (
      <>
        Built on top of <Link href="https://tanstack.com/query/latest">TanStack Query</Link> with <em>all the power</em> of its features
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
