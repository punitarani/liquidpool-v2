// create nav bar component with 3 options: home, existing pools, create pools
import Link from "next/link";
import ConnectWalletButton from "./ConnectWalletButton.js";

import styles from "../styles/NavBar.module.css";

export default function Navbar({ connectedAddress, setAddress }) {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <Link href="/">Liquid Pool</Link>
        </div>
        <div className={styles.navMenu}>
          <Link href="/">Home</Link>
          <Link href="/existingpools">Existing Pools</Link>
          <Link href="/createpool">Create Pool</Link>
          <Link href="/contracts">Contracts</Link>
        </div>
        <div className={styles.connectWalletButton}>
        <ConnectWalletButton
          connectedAddress={connectedAddress}
          setAddress={setAddress}
        />
      </div>
      </nav>
    </header>
  );
}
