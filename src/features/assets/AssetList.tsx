import { ArrowUpRight, RotateCw } from 'lucide-react';
import { StatusTag } from '../../components/ui/StatusTag';
import { mainnetAddressUrl } from '../../lib/chains/networks';
import { MAINNET_TOKENS } from '../../lib/chains/tokens';
import { formatClockTime, formatEthAmount, formatTokenAmount, truncateAddress } from '../../lib/format/eth';
import { MAINNET_RPC_URL } from '../../lib/web3/config';
import { RPC_ERROR_MESSAGE } from '../../lib/web3/errors';
import { rpcHost } from '../../lib/web3/rpc';
import { useMainnetBalance } from './useMainnetBalance';
import { useTokenBalances } from './useTokenBalances';

const ROW = 'asset-row grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 py-[12px] border-t border-white/[0.08] font-manrope';
const RETRY = 'inline-flex items-center gap-[6px] text-[12px] text-ice hover:underline underline-offset-4';

function Retry({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className={RETRY} onClick={onClick}>
      <RotateCw className="w-[11px] h-[11px]" strokeWidth={1.5} aria-hidden="true" /> RETRY
    </button>
  );
}

/** Native ETH + allowlisted ERC-20 balances for one address, always read from Ethereum Mainnet. */
export function AssetList({ address }: { address: `0x${string}` }) {
  const eth = useMainnetBalance(address);
  const tokens = useTokenBalances(address);
  const updated = [eth.updatedAt, tokens.updatedAt].filter((t): t is number => t !== null);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
        <p className="font-manrope text-white/50 text-[11px] leading-[16px] tracking-[0.06em]">ASSETS ON ETHEREUM MAINNET</p>
        {eth.state === 'live' && tokens.state === 'live' ? (
          <StatusTag state="live" />
        ) : eth.state === 'error' || tokens.state === 'error' ? (
          <StatusTag state="error" detail="PARTIAL" />
        ) : (
          <StatusTag state="loading" />
        )}
      </div>

      <ul aria-label="Balances on Ethereum Mainnet">
        <li className={ROW}>
          <span>
            <span className="text-white text-[14px] leading-[18px]">ETH</span>
            <span className="block text-white/45 text-[12px] leading-[16px]">Ether · native balance</span>
          </span>
          <span className="text-right">
            {eth.state === 'live' && eth.wei !== null ? (
              <span className="font-graphik text-white text-[18px] leading-[22px] tabular-nums">{formatEthAmount(eth.wei)}</span>
            ) : eth.state === 'error' ? (
              <Retry onClick={eth.retry} />
            ) : (
              <span className="text-white/35 text-[12px]">reading…</span>
            )}
          </span>
        </li>

        {MAINNET_TOKENS.map((token, i) => {
          const row = tokens.rows?.[i];
          return (
            <li key={token.address} className={ROW}>
              <span className="min-w-0">
                <span className="text-white text-[14px] leading-[18px]">{token.symbol}</span>
                <span className="block text-white/45 text-[12px] leading-[16px]">
                  {token.name} ·{' '}
                  <a href={mainnetAddressUrl(token.address)} target="_blank" rel="noopener noreferrer" className="hover:text-ice underline decoration-white/20 underline-offset-4" title={token.address}>
                    {truncateAddress(token.address)}
                    <ArrowUpRight className="inline w-[11px] h-[11px] ml-[2px]" strokeWidth={1.5} aria-hidden="true" />
                    <span className="sr-only">(token contract on Etherscan, opens in a new tab)</span>
                  </a>
                </span>
              </span>
              <span className="text-right">
                {row?.state === 'ok' ? (
                  <>
                    <span className="font-graphik text-white text-[18px] leading-[22px] tabular-nums">{formatTokenAmount(row.balance, token.decimals)}</span>
                    {row.totalSupply !== null && (
                      <span className="block text-white/35 text-[11px] leading-[14px] tabular-nums">
                        supply {formatTokenAmount(row.totalSupply, token.decimals, 0)}
                      </span>
                    )}
                  </>
                ) : row?.state === 'decimals-mismatch' ? (
                  <span className="text-[#ffb4a8] text-[12px]">decimals mismatch ({row.onchainDecimals}); not shown</span>
                ) : row?.state === 'error' || tokens.state === 'error' ? (
                  <Retry onClick={tokens.retry} />
                ) : (
                  <span className="text-white/35 text-[12px]">reading…</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 pt-3 border-t border-white/[0.08] font-manrope text-white/45 text-[12px] leading-[17px]">
        {tokens.errorKind || eth.errorKind
          ? RPC_ERROR_MESSAGE[(tokens.errorKind ?? eth.errorKind)!]
          : `Read via ${rpcHost(MAINNET_RPC_URL)}${updated.length ? ` at ${formatClockTime(Math.min(...updated))}` : ''}. Token balances come from one Multicall3 call. No USD values.`}
      </p>
    </div>
  );
}
