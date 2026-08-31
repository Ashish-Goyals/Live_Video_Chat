import { useRef, useCallback } from 'react';

const TONES = {
  join: [660, 880],
  leave: [440, 330],
  message: [520],
  mute: [300],
  unmute: [500],
  end: [440, 330, 220],
};

export const useSound = () => {
  const ctxRef = useRef(null);

  const getCtx = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctxRef.current;
  };

  const play = useCallback((type) => {
    try {
      const ctx = getCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const freqs = TONES[type] || TONES.message;
      let time = ctx.currentTime;

      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.exponentialRampToValueAtTime(0.15, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.2);
        time += 0.12;
      });
    } catch (err) {
      console.error('Sound playback error:', err);
    }
  }, []);

  return { play };
};
