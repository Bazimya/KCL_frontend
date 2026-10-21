// An order-code search field with a fixed, non-editable "KCL-" prefix - the
// customer only ever types the digits, never the prefix itself. `value` and
// onChange still deal in the FULL code (e.g. "KCL-0000001") so every caller
// keeps working with the same string it always stored/sent to the API;
// this component only changes what's shown and editable on screen.
export default function OrderCodeInput({ value, onChange, placeholder = '0000001', className = '', autoFocus }) {
  const digits = (value || '').replace(/^KCL-/i, '')

  return (
    <div className={`flex items-stretch rounded-xl border border-espresso-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-gold focus-within:border-gold transition ${className}`}>
      <span className="flex items-center pl-4 pr-1 font-mono font-bold text-espresso-400 select-none bg-espresso-50 border-r border-espresso-100">
        KCL-
      </span>
      <input
        className="flex-1 min-w-0 px-2 py-2.5 font-mono outline-none placeholder:text-espresso-300"
        value={digits}
        onChange={(e) => onChange(`KCL-${e.target.value.replace(/[^0-9]/g, '')}`)}
        placeholder={placeholder}
        inputMode="numeric"
        autoFocus={autoFocus}
      />
    </div>
  )
}
