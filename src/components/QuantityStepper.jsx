import { Minus, Plus } from './icons.jsx'
import { clampQty, MAX_QTY } from '../context/CartContext.jsx'

// stretch: en celular ocupa todo el ancho (tarjetas del catálogo a dos columnas).
export default function QuantityStepper({ value, onChange, label, size = 'md', stretch = false }) {
  const box = size === 'sm' ? 'h-10' : stretch ? 'h-11 sm:h-12' : 'h-12'
  const button = `grid w-10 shrink-0 cursor-pointer place-items-center text-ink transition-colors duration-200 hover:bg-black/5 disabled:cursor-not-allowed disabled:text-muted/50 ${box}`

  return (
    <div
      role="group"
      aria-label={label}
      className={`shrink-0 items-center overflow-hidden rounded-full bg-surface ring-1 ring-black/10 ${box} ${
        stretch ? 'flex justify-between sm:inline-flex' : 'inline-flex'
      }`}
    >
      <button
        type="button"
        className={button}
        onClick={() => onChange(clampQty(value - 1))}
        disabled={value <= 1}
        aria-label="Restar una unidad"
      >
        <Minus size={14} weight="bold" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={MAX_QTY}
        value={value}
        onChange={(e) => onChange(clampQty(e.target.value))}
        onFocus={(e) => e.target.select()}
        aria-label="Cantidad"
        className={`h-full [appearance:textfield] bg-transparent text-center text-[15px] font-semibold text-ink tabular-nums focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
          stretch ? 'w-full min-w-10 sm:w-10' : 'w-10'
        }`}
      />
      <button
        type="button"
        className={button}
        onClick={() => onChange(clampQty(value + 1))}
        disabled={value >= MAX_QTY}
        aria-label="Sumar una unidad"
      >
        <Plus size={14} weight="bold" />
      </button>
    </div>
  )
}
