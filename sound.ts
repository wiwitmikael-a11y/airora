// sound.ts

let audioContext: AudioContext | null = null;
let isMutedGlobally = false;

const initializeAudio = () => {
    // This function can be called safely on module load.
    // It checks for window to avoid SSR errors and handles user interaction requirement for AudioContext.
    if (typeof window === 'undefined') return;
    try {
        isMutedGlobally = localStorage.getItem('airora_isMuted') === 'true';
        // We only create the AudioContext once.
        // It should ideally be created/resumed after a user gesture.
        // We will handle resuming on the first playSound call if it's suspended.
        if (!audioContext) {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    } catch (e) {
        console.error("Failed to initialize Web Audio API or access localStorage.", e);
    }
};

// Initialize on module load.
initializeAudio();

export const getMutedState = (): boolean => {
    // Re-read from localStorage in case it was changed in another tab.
    if (typeof window !== 'undefined') {
        isMutedGlobally = localStorage.getItem('airora_isMuted') === 'true';
    }
    return isMutedGlobally;
};

export const setMutedState = (muted: boolean) => {
    isMutedGlobally = muted;
    try {
        localStorage.setItem('airora_isMuted', String(muted));
        // If unmuting, and the context is suspended, try to resume it.
        // This might not work without a direct user gesture but is a good attempt.
        if (!muted && audioContext?.state === 'suspended') {
            audioContext.resume();
        }
    } catch (e) {
        console.error("Failed to save mute state to localStorage.", e);
    }
};

export type SoundType = 'click' | 'open' | 'close' | 'send' | 'endSession' | 'hover' | 'receive_start' | 'receive_end';

export const playSound = (type: SoundType) => {
    if (isMutedGlobally) return;

    // Check for AudioContext and try to create/resume it on first user interaction.
    if (!audioContext) {
       initializeAudio();
    }
    if (!audioContext) return; // Still couldn't initialize it.

    // The AudioContext may be in a 'suspended' state if it was created before any user interaction.
    // We must resume it inside a user-initiated event handler.
    if (audioContext.state === 'suspended') {
        audioContext.resume().catch(e => console.error("AudioContext resume failed", e));
        // If it's still suspended after trying to resume, we can't play a sound yet.
        if (audioContext.state === 'suspended') return;
    }


    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const now = audioContext.currentTime;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    gainNode.gain.setValueAtTime(0, now);

    let stopTime = now + 0.3;

    switch (type) {
        case 'hover':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(1200, now);
            gainNode.gain.setValueAtTime(0.001, now);
            gainNode.gain.exponentialRampToValueAtTime(0.05, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
            stopTime = now + 0.1;
            break;
        case 'click':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(900, now);
            gainNode.gain.setValueAtTime(0.001, now);
            gainNode.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
            stopTime = now + 0.15;
            break;
        case 'open':
            oscillator.type = 'triangle';
            gainNode.gain.setValueAtTime(0.001, now);
            gainNode.gain.exponentialRampToValueAtTime(0.3, now + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
            oscillator.frequency.setValueAtTime(300, now);
            oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
            break;
        case 'close':
        case 'endSession':
            oscillator.type = 'triangle';
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
            oscillator.frequency.setValueAtTime(1200, now);
            oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.3);
            break;
        case 'send':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(500, now);
            oscillator.frequency.exponentialRampToValueAtTime(700, now + 0.1);
            gainNode.gain.setValueAtTime(0.001, now);
            gainNode.gain.exponentialRampToValueAtTime(0.15, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
            stopTime = now + 0.2;
            break;
        case 'receive_start':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(600, now);
            oscillator.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
            gainNode.gain.setValueAtTime(0.001, now);
            gainNode.gain.exponentialRampToValueAtTime(0.1, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
            stopTime = now + 0.2;
            break;
        case 'receive_end':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(1000, now);
            oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.1);
            gainNode.gain.setValueAtTime(0.001, now);
            gainNode.gain.exponentialRampToValueAtTime(0.1, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
            stopTime = now + 0.2;
            break;
    }

    oscillator.start(now);
    oscillator.stop(stopTime);
};