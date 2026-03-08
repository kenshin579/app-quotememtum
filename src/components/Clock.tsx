interface ClockProps {
  time: string;
  date: string;
}

export function Clock({ time, date }: ClockProps) {
  return (
    <div className="text-right">
      <div className="text-6xl font-light tracking-wide drop-shadow-lg">{time}</div>
      <div className="mt-1 text-base text-white/80 drop-shadow-md">{date}</div>
    </div>
  );
}
