export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hourStr, minuteStr] = timeStr.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr || '00';
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute} ${period}`;
};

export const formatSlotRange = (startTime, endTime) =>
  `${formatTime(startTime)} – ${formatTime(endTime)}`;

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const getTodayDate = () => new Date().toISOString().split('T')[0];

export const getDateOptions = (days = 7) => {
  const options = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    options.push(d.toISOString().split('T')[0]);
  }
  return options;
};

// Returns true if the slot's start time has already passed for today's date
export const isSlotPast = (startTime, selectedDate) => {
  const today = getTodayDate();
  if (selectedDate !== today) return false;

  const now = new Date();
  const [hour, minute] = startTime.split(':').map(Number);
  const slotTime = new Date();
  slotTime.setHours(hour, minute, 0, 0);

  return slotTime <= now;
};
