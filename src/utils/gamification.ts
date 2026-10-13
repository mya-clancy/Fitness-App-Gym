import confetti from 'canvas-confetti';
import { HunterRank } from '../types/hunter';

export function getXpRequiredForLevel(level: number): number {
  // Base 1000 XP scaling smoothly with level
  return Math.floor(1000 * Math.pow(level, 1.15));
}

export function calculateLevelData(totalXp: number): {
  level: number;
  currentLevelXp: number;
  xpToNextLevel: number;
  progressPercent: number;
  hunterRank: HunterRank;
  hunterTitle: string;
} {
  let level = 1;
  let remainingXp = Math.max(0, totalXp);

  while (true) {
    const requiredForCurrent = getXpRequiredForLevel(level);
    if (remainingXp < requiredForCurrent) {
      const progressPercent = Math.min(100, Math.round((remainingXp / requiredForCurrent) * 100));
      const { rank, title } = getRankAndTitle(level);
      return {
        level,
        currentLevelXp: remainingXp,
        xpToNextLevel: requiredForCurrent,
        progressPercent,
        hunterRank: rank,
        hunterTitle: title,
      };
    }
    remainingXp -= requiredForCurrent;
    level++;
    if (level > 200) break; // Safeguard
  }

  const { rank, title } = getRankAndTitle(level);
  return {
    level,
    currentLevelXp: remainingXp,
    xpToNextLevel: getXpRequiredForLevel(level),
    progressPercent: 100,
    hunterRank: rank,
    hunterTitle: title,
  };
}

export function getRankAndTitle(level: number): { rank: HunterRank; title: string } {
  if (level >= 100) return { rank: 'Shadow Monarch', title: 'Monarch of Shadows' };
  if (level >= 80) return { rank: 'National Hunter', title: 'National Level Sovereign' };
  if (level >= 60) return { rank: 'S-Rank', title: 'S-Rank Awakened Hunter' };
  if (level >= 45) return { rank: 'A-Rank', title: 'Elite Raid Commander' };
  if (level >= 30) return { rank: 'B-Rank', title: 'Dungeon Striker' };
  if (level >= 18) return { rank: 'C-Rank', title: 'Awakened Combatant' };
  if (level >= 8) return { rank: 'D-Rank', title: 'Rookie Dungeon Scout' };
  return { rank: 'E-Rank', title: 'The Weakest Hunter' };
}

export function getRankBadgeColors(rank: HunterRank): {
  text: string;
  bg: string;
  border: string;
  glow: string;
} {
  switch (rank) {
    case 'Shadow Monarch':
      return {
        text: 'text-purple-300',
        bg: 'bg-purple-950/80',
        border: 'border-purple-500',
        glow: 'shadow-[0_0_20px_rgba(168,85,247,0.5)]',
      };
    case 'National Hunter':
      return {
        text: 'text-amber-300',
        bg: 'bg-amber-950/80',
        border: 'border-amber-400',
        glow: 'shadow-[0_0_20px_rgba(251,191,36,0.5)]',
      };
    case 'S-Rank':
      return {
        text: 'text-cyan-300',
        bg: 'bg-cyan-950/80',
        border: 'border-cyan-400',
        glow: 'shadow-[0_0_20px_rgba(34,211,238,0.5)]',
      };
    case 'A-Rank':
      return {
        text: 'text-blue-300',
        bg: 'bg-blue-950/80',
        border: 'border-blue-400',
        glow: 'shadow-[0_0_15px_rgba(96,165,250,0.4)]',
      };
    case 'B-Rank':
      return {
        text: 'text-emerald-300',
        bg: 'bg-emerald-950/80',
        border: 'border-emerald-400',
        glow: 'shadow-[0_0_12px_rgba(52,211,153,0.3)]',
      };
    case 'C-Rank':
      return {
        text: 'text-indigo-300',
        bg: 'bg-indigo-950/80',
        border: 'border-indigo-400',
        glow: 'shadow-[0_0_10px_rgba(129,140,248,0.3)]',
      };
    case 'D-Rank':
      return {
        text: 'text-slate-300',
        bg: 'bg-slate-900/80',
        border: 'border-slate-500',
        glow: 'shadow-[0_0_8px_rgba(148,163,184,0.2)]',
      };
    default:
      return {
        text: 'text-zinc-400',
        bg: 'bg-zinc-900/80',
        border: 'border-zinc-600',
        glow: 'shadow-[0_0_6px_rgba(113,113,122,0.2)]',
      };
  }
}

// Visual fanfare celebration
export function triggerLevelUpConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    colors: ['#00F0FF', '#0066FF', '#A855F7', '#38BDF8', '#E0F2FE', '#F59E0B'],
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

// Audio synthesizer for Solo Leveling system sounds (Web Audio API - zero external assets needed)
class SoundSystem {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play(type: 'quest_complete' | 'level_up' | 'ai_scan' | 'click' | 'xp_gain') {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      if (type === 'click') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'xp_gain') {
        // High-tech cyber chime
        const freqs = [587.33, 880, 1174.66]; // D5, A5, D6
        freqs.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.1, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.25);
        });
      } else if (type === 'level_up') {
        // Grand heroic Solo Leveling System Alert fanfare
        const chords = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
        chords.forEach((freq, i) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = i > 3 ? 'sine' : 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + i * 0.07);
          gain.gain.setValueAtTime(0.12, now + i * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.07);
          osc.stop(now + 1.2);
        });
      } else if (type === 'ai_scan') {
        // Sci-fi scanner pulse
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(1400, now + 0.25);
        osc.frequency.linearRampToValueAtTime(800, now + 0.45);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'quest_complete') {
        const freqs = [523.25, 659.25, 783.99, 1046.5];
        freqs.forEach((freq, i) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          gain.gain.setValueAtTime(0.12, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.45);
        });
      }
    } catch {
      // Ignore audio policy issues
    }
  }
}

export const sound = new SoundSystem();
