import { useRef } from 'react';

export default function CodeInput({ value, onChange, disabled }) {
  const fields = useRef([]);

  function enter(index, input) {
    const digits = input.replace(/\D/g, '').slice(0, 6);
    if (input && !digits) return;
    const start = digits.length === 6 ? 0 : Math.min(index, value.length);
    if (!digits) {
      onChange(value.slice(0, start) + value.slice(start + 1));
      return;
    }
    onChange((value.slice(0, start) + digits + value.slice(start + digits.length)).slice(0, 6));
    fields.current[Math.min(start + digits.length, 5)]?.focus();
  }

  return (
    <fieldset disabled={disabled}>
      <legend className="mb-2 text-sm font-medium text-slate-900">Verification code</legend>
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 6 }, (_, index) => (
          <input
            key={index}
            ref={element => { fields.current[index] = element; }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            aria-label={`Digit ${index + 1} of 6`}
            value={value[index] ?? ''}
            className="h-12 min-w-0 rounded-lg border border-slate-300 bg-white text-center text-xl font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-blue-200"
            onFocus={event => event.currentTarget.select()}
            onChange={event => enter(index, event.target.value)}
            onPaste={event => {
              event.preventDefault();
              enter(index, event.clipboardData.getData('text'));
            }}
            onKeyDown={event => {
              if (event.key === 'ArrowLeft') fields.current[index - 1]?.focus();
              if (event.key === 'ArrowRight') fields.current[index + 1]?.focus();
              if (event.key === 'Backspace' && !value[index] && index > 0) {
                event.preventDefault();
                enter(Math.min(index - 1, value.length - 1), '');
                fields.current[index - 1]?.focus();
              }
            }}
          />
        ))}
      </div>
    </fieldset>
  );
}
