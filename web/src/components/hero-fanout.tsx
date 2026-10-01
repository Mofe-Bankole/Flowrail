import styles from "./hero-fanout.module.css";

const standing = [
  ["Ada Okonkwo", "$65.00"],
  ["Ben Castillo", "$40.00"],
  ["Chi Nwosu", "$120.00"],
  ["Daniel Park", "$85.00"],
  ["Elena Voss", "$55.00"],
] as const;

export function HeroFanout() {
  return (
    <figure className={styles.figure}>
      <div className={styles.sheet}>
        <header className={styles.head}>
          <div>
            <p className={styles.kicker}>Run · INV-2500</p>
            <p className={styles.total}>$2,500.00</p>
          </div>
          <p className={styles.meta}>
            39 auto
            <span className={styles.dot} aria-hidden="true" />
            1 finance
            <span className={styles.dot} aria-hidden="true" />
            pathUSD
          </p>
        </header>

        <div className={styles.exception}>
          <div>
            <p className={styles.name}>Jane Adeyemi</p>
            <p className={styles.why}>Over the $500 cap. Address stable 40 days.</p>
          </div>
          <div className={styles.amountCol}>
            <p className={styles.amount}>$1,850.00</p>
            <p className={styles.tag}>Needs a person</p>
          </div>
        </div>

        <ul className={styles.rows}>
          {standing.map(([name, amount], index) => (
            <li key={name} className={styles.row} style={{ animationDelay: `${0.15 + index * 0.04}s` }}>
              <span>{name}</span>
              <span className={styles.rowAmount}>{amount}</span>
            </li>
          ))}
          <li className={styles.more}>34 more standing payees, none over the cap.</li>
        </ul>

        <footer className={styles.foot}>
          <span>Each key dies in 7 days or 12 hours.</span>
          <span>No weekly window.</span>
        </footer>
      </div>
      <figcaption className={styles.caption}>
        One approval covers the standing payees. Jane is the signature that is not automatic.
      </figcaption>
    </figure>
  );
}
