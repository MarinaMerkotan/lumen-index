import { SectionShell } from '../../components/sections/SectionShell';
import { Frame } from '../../components/ui/Frame';
import { Readout } from '../../components/ui/Readout';
import { StatusTag } from '../../components/ui/StatusTag';
import { WalletControl } from '../wallet/WalletControl';

export function LumenIndexSection() {
  return (
    <SectionShell
      id="lumen-index"
      number="03"
      label="LUMEN_INDEX"
      seed={37}
      title="Your public address, read on your terms."
      intro={
        <>
          <p>
            After you connect a wallet yourself, this index will show the public address, the active network and the native ETH balance read from
            the chain. Nothing is requested on page load.
          </p>
          <p>No valuation, no portfolio scoring, and nothing about your wallet is stored by this site.</p>
        </>
      }
      tags={
        <>
          <StatusTag state="disconnected" />
          <StatusTag state="next" />
        </>
      }
    >
      <Frame className="p-6 md:p-8">
        <div className="pb-6 mb-2 border-b border-white/[0.08]">
          <WalletControl variant="stacked" />
        </div>
        <Readout
          rows={[
            { label: 'Address', value: 'Not connected' },
            { label: 'Network', value: '—', note: 'Reported by your wallet after connection.' },
            { label: 'ETH balance', value: '—', note: 'Read from the chain for the connected address.' },
          ]}
        />
      </Frame>
    </SectionShell>
  );
}
