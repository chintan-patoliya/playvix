import { formatTime } from '../utils/formatTime';
import { isSlotPast } from '../utils/formatTime';
import { SLOT_STATUS_CONFIG, SLOT_STATUSES } from '../constants';

export default function SlotCard({ slot, onClick, selectedDate }) {
  const past = isSlotPast(slot.startTime, selectedDate);
  const effectiveStatus = past ? 'past' : slot.status;
  const config = SLOT_STATUS_CONFIG[effectiveStatus] || SLOT_STATUS_CONFIG.available;
  const isClickable = !past && slot.status === SLOT_STATUSES.AVAILABLE;

  return (
    <button
      onClick={() => isClickable && onClick(slot)}
      disabled={!isClickable}
      className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 w-full ${config.bg}`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className={`w-2 h-2 rounded-full ${config.dot}`} />
        <span className={`text-xs font-semibold uppercase tracking-wide ${config.labelColor}`}>
          {config.label}
        </span>
      </div>
      <p className={`text-sm font-bold ${config.text}`}>
        {formatTime(slot.startTime)}
      </p>
      <p className={`text-xs ${config.text} opacity-70`}>
        to {formatTime(slot.endTime)}
      </p>
    </button>
  );
}
