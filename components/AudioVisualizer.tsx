import React, { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
    mediaStream: MediaStream | null;
    audioContext: AudioContext | null;
    isLive: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ mediaStream, audioContext, isLive }) => {
    // FIX: Initialize useRef with null to provide an explicit initial value.
    // This resolves a potential TypeScript error with useRef overloads by making the intended usage explicit.
    const animationFrameId = useRef<number | null>(null);
    const analyser = useRef<AnalyserNode | null>(null);
    const visualizerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (mediaStream && audioContext && audioContext.state === 'running') {
            if (!analyser.current) {
                analyser.current = audioContext.createAnalyser();
                analyser.current.fftSize = 64; 
                const source = audioContext.createMediaStreamSource(mediaStream);
                source.connect(analyser.current);
            }

            const bufferLength = analyser.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const draw = () => {
                animationFrameId.current = requestAnimationFrame(draw);

                if (!analyser.current || !visualizerRef.current) return;

                analyser.current.getByteTimeDomainData(dataArray);

                let sumSquares = 0.0;
                for (const amplitude of dataArray) {
                    const value = (amplitude / 128.0) - 1.0; // Normalize to -1.0 to 1.0
                    sumSquares += value * value;
                }
                const rms = Math.sqrt(sumSquares / dataArray.length);

                const baseScale = isLive ? 0.75 : 0.65;
                const sensitivity = 6.0; // Adjust sensitivity of the pulse
                const scale = baseScale + (rms * sensitivity);

                visualizerRef.current.style.transform = `translate(-50%, -50%) scale(${Math.min(scale, 1.5)})`;
            };
            draw();

        } else if (visualizerRef.current) {
            // Set a default idle scale
            visualizerRef.current.style.transform = `translate(-50%, -50%) scale(0.65)`;
        }

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            // Do not nullify the analyser here to avoid re-creating it if the component re-renders
        };
    }, [mediaStream, audioContext, isLive]);

    return (
      <div
          ref={visualizerRef}
          style={{transition: 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)'}}
          className={`aurora-visualizer-container transition-opacity duration-500 pointer-events-none ${isLive ? 'opacity-80' : 'opacity-40'}`}
      >
          <div className="aurora-blob"></div>
          <div className="aurora-blob"></div>
          <div className="aurora-blob"></div>
          <div className="aurora-blob"></div>
      </div>
    );
};

export default AudioVisualizer;