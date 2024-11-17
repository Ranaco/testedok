"use client";

import styles from "./page.module.css";

export default function AboutPage() {

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1>About Tested OK</h1>
        <p>
          Tested OK is the ultimate solution for testing and verifying Solidity
          code on-chain. Built for developers, by developers.
        </p>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2>Core Features</h2>
        <div className={styles.featureCards}>
          <div className={styles.card}>
            <h3>On-Chain Verification</h3>
            <p>
              Verify Solidity code with cryptographic proofs, ensuring
              transparency and trust.
            </p>
          </div>
          <div className={styles.card}>
            <h3>Incentivized Contributions</h3>
            <p>
              Earn rewards for completing tasks and bounties in a safe Web3
              ecosystem.
            </p>
          </div>
          <div className={styles.card}>
            <h3>Robust Testing Environment</h3>
            <p>
              Run tests in secure Linux environments with detailed output logs.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className={styles.mission}>
        <h2>Our Mission</h2>
        <p>
          At Tested OK, we aim to make the Web3 ecosystem safer and more
          reliable by providing developers with the tools they need to deliver
          high-quality, secure, and verifiable smart contracts.
        </p>
      </section>
    </div>
  );
}
