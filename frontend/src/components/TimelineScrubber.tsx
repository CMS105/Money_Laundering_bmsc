import React from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

interface TimelineScrubberProps {
  minTimestamp: number;
  maxTimestamp: number;
  currentTimestamp: number;
  onChange: (ts: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  minTimestamp,
  maxTimestamp,
  currentTimestamp,
  onChange,
  isPlaying,
  onTogglePlay,
  onReset,
}) => {
  const formatTime = (ts: number) => {
    if (!ts) return '--:--:--';
    const date = new Date(ts * 1000);
    return date.toISOString().replace('T', ' ').substring(0, 19);
  };

  const progressPercent =
    maxTimestamp > minTimestamp
      ? ((currentTimestamp - minTimestamp) / (maxTimestamp - minTimestamp)) * 100
      : 100;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl px-6 py-3 shadow-2xl flex items-center space-x-4 w-[650px] max-w-[90vw] z-40">
      <div className="flex items-center space-x-2">
        <button
          onClick={onTogglePlay}
          className="w-8 h-8 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center transition shadow"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        <button
          onClick={onReset}
          className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          title="Reset Scrubber"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center space-x-1 text-cyan-400">
            <Clock className="w-3 h-3" />
            <span>{formatTime(currentTimestamp)}</span>
          </div>
          <span>Temporal Scrubber ({progressPercent.toFixed(0)}%)</span>
        </div>

        <input
          type="range"
          min={minTimestamp}
          max={maxTimestamp}
          value={currentTimestamp}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
      </div>
    </div>
  );
};

