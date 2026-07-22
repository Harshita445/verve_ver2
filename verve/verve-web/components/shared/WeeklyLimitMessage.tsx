"use client";

interface Props {
  resetsAt: string;
}

const TEMPLATES = [
  "You've given it everything this week — that's exactly the kind of effort that adds up. Come back in {days} {day/days} and let's keep going.",
  "Six strong sessions down. Rest that voice for {days} {day/days} — you've more than earned it.",
  "This week's spotlight is taking a short intermission. It'll be back on in {days} {day/days}, ready when you are.",
  "You showed up every time this week, and it shows. See you back on stage in {days} {day/days}.",
];

export default function WeeklyLimitMessage({ resetsAt }: Props) {
  const days = Math.max(1, Math.ceil((new Date(resetsAt).getTime() - Date.now()) / 86400000));
  const dayWord = days === 1 ? "day" : "days";
  const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
  const message = template.replace("{days}", String(days)).replace("{day/days}", dayWord);

  return (
    <div className="w-full rounded-card border border-gold/20 bg-gold/5 p-6 text-center">
      <p className="text-sm leading-relaxed text-text-primary">{message}</p>
    </div>
  );
}
