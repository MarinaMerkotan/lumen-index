import { MotionProvider } from './components/ambient/MotionContext';
import { Web3Provider } from './components/providers/Web3Provider';
import { BlockPulseEmitter } from './features/ecosystem/BlockPulseEmitter';
import { WalletProvider } from './features/wallet/WalletContext';
import { Hero } from './components/hero/Hero';
import { SiteFooter } from './components/layout/SiteFooter';
import { SiteHeader } from './components/layout/SiteHeader';
import { PageGrid } from './components/ambient/PageGrid';
import { SECTION_IDS } from './content/navigation';
import { LumenIndexSection } from './features/assets/LumenIndexSection';
import { EcosystemSection } from './features/ecosystem/EcosystemSection';
import { GovernanceSection } from './features/governance/GovernanceSection';
import { LiquiditySection } from './features/liquidity/LiquiditySection';
import { useActiveSection } from './hooks/useActiveSection';

export default function App() {
  return (
    <Web3Provider>
      <WalletProvider>
        <MotionProvider>
          <BlockPulseEmitter />
          <Page />
        </MotionProvider>
      </WalletProvider>
    </Web3Provider>
  );
}

function Page() {
  const activeId = useActiveSection(SECTION_IDS);

  return (
    <>
      <a href="#main" className="skip-link font-manrope">
        Skip to content
      </a>
      <SiteHeader activeId={activeId} />
      <Hero />
      <main id="main" tabIndex={-1} className="relative outline-none">
        <PageGrid />
        <EcosystemSection />
        <LiquiditySection />
        <LumenIndexSection />
        <GovernanceSection />
        <SiteFooter />
      </main>
    </>
  );
}
