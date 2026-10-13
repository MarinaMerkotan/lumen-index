import { FormEvent, useId, useState } from 'react';
import { Search } from 'lucide-react';
import { INPUT_ERROR_MESSAGE, parseAddressInput } from '../../lib/web3/validate';

interface ExploreAddressFormProps {
  onInspect: (address: `0x${string}`) => void;
}

/** Address entry for Explore mode. Validated with viem; held in memory only, never stored. */
export function ExploreAddressForm({ onInspect }: ExploreAddressFormProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const errorId = useId();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const parsed = parseAddressInput(value);
    if (!parsed.ok) {
      setError(parsed.reason === 'format' ? 'An address is 0x followed by exactly 40 hex characters.' : INPUT_ERROR_MESSAGE[parsed.reason]);
      return;
    }
    setError(null);
    setValue(parsed.address);
    onInspect(parsed.address);
  };

  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor={inputId} className="block mb-2 font-manrope text-white/50 text-[11px] leading-[16px] tracking-[0.06em]">
        PUBLIC ADDRESS TO INSPECT
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          id={inputId}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="0x… (40 hex characters)"
          spellCheck={false}
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="explorer-input flex-1 min-w-0"
        />
        <button type="submit" className="wallet-cta justify-center">
          <Search className="w-[14px] h-[14px]" strokeWidth={2} aria-hidden="true" /> INSPECT
        </button>
      </div>
      {error && (
        <p id={errorId} className="mt-2 font-manrope text-[#ffb4a8] text-[12px] leading-[17px]">
          {error}
        </p>
      )}
      <p className="mt-2 font-manrope text-white/40 text-[12px] leading-[17px]">No wallet needed. Nothing you type here is stored or sent anywhere except the public RPC.</p>
    </form>
  );
}
