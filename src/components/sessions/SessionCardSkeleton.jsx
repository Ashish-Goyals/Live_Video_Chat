const SessionCardSkeleton = () => {
  return (
    <div className="bg-white/70 backdrop-blur rounded-3xl p-6 border border-slate-100/60 shadow-xs">
      <div className="space-y-5 animate-pulse">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-6 w-28 rounded-md bg-slate-200" />

            {/* Status */}
            <div className="h-6 w-16 rounded-full bg-slate-200" />
          </div>

          {/* Title */}
          <div className="h-7 w-3/4 rounded-md bg-slate-200" />

          {/* Date */}
          <div className="h-4 w-44 rounded-md bg-slate-200" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-300/30">
          <div className="h-10 rounded-xl bg-slate-200" />
          <div className="h-10 rounded-xl bg-slate-200" />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <div className="h-10 w-full rounded-full bg-slate-200" />
          <div className="h-10 w-full rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );
};

export default SessionCardSkeleton;
