import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { WELCOME_MESSAGES } from '../constants';
import { ViewType, TranscriptionLine, MessageRole } from '../types';
import { MicrophoneIcon, StopCircleIcon, AiroraLogo, UserIcon, ChatBubbleIcon } from './icons/Icons';
import { LIVE_MODEL_ID, SYSTEM_INSTRUCTIONS, TEXT_MODEL_ID } from '../constants';
import { playSound } from '../sound';
import AudioVisualizer from './AudioVisualizer';

// --- Helper Functions for Audio Processing ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}
// --- End Helper Functions ---

type LiveStatus = 'idle' | 'connecting' | 'live' | 'error';

interface LiveViewProps {
    isAnimatingOut: boolean;
    getAiInstance: () => GoogleGenAI | null;
}

const LiveView: React.FC<LiveViewProps> = ({ isAnimatingOut, getAiInstance }) => {
    const [status, setStatus] = useState<LiveStatus>('idle');
    const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionLine[]>([]);
    
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const nextStartTimeRef = useRef(0);
    const playingSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');
    const aiRef = useRef<GoogleGenAI | null>(null);
    const transcriptEndRef = useRef<HTMLDivElement>(null);


    const animationClass = isAnimatingOut ? 'animate-recede' : 'animate-emerge';

    const stopLiveSession = useCallback(async () => {
        console.log("Stopping live session...");
        setStatus('idle');

        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (e) {
                console.error("Error closing session:", e);
            }
            sessionPromiseRef.current = null;
        }

        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current.onaudioprocess = null;
            scriptProcessorRef.current = null;
        }
        if(sourceNodeRef.current) {
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            await inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
             playingSourcesRef.current.forEach(source => source.stop());
             playingSourcesRef.current.clear();
             await outputAudioContextRef.current.close();
             outputAudioContextRef.current = null;
        }
        nextStartTimeRef.current = 0;
        
    }, []);

    const summarizeTurn = useCallback(async (userInput: string, aiOutput: string): Promise<string> => {
        if (!aiRef.current) return '';
        const prompt = `Buat ringkasan singkat dalam bentuk poin-poin dari percakapan berikut:\n\nPENGGUNA: "${userInput}"\n\nAI: "${aiOutput}"`;
        try {
            const response = await aiRef.current.models.generateContent({
                model: TEXT_MODEL_ID,
                contents: prompt,
            });
            return response.text;
        } catch (error) {
            console.error("Error summarizing turn:", error);
            return "Tidak dapat membuat ringkasan.";
        }
    }, []);

    const startLiveSession = useCallback(async () => {
        aiRef.current = getAiInstance();
        if (!aiRef.current) {
            setStatus('error');
            console.error("AI instance not available");
            return;
        }
        
        setStatus('connecting');
        playSound('open');

        // Reset transcriptions
        setTranscriptionHistory([]);
        currentInputTranscriptionRef.current = '';
        currentOutputTranscriptionRef.current = '';

        try {
            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            inputAudioContextRef.current = new (window.AudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext)({ sampleRate: 24000 });

            sessionPromiseRef.current = aiRef.current.live.connect({
                model: LIVE_MODEL_ID,
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction: SYSTEM_INSTRUCTIONS[ViewType.LIVE],
                    outputAudioTranscription: {},
                    inputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        console.log('Session opened.');
                        setStatus('live');
                        playSound('receive_start');
                        
                        sourceNodeRef.current = inputAudioContextRef.current!.createMediaStreamSource(mediaStreamRef.current!);
                        scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessorRef.current.onaudioprocess = (event) => {
                            const inputData = event.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                        };
                        
                        sourceNodeRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.outputTranscription) {
                            currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                        }
                        if (message.serverContent?.turnComplete) {
                            const userInput = currentInputTranscriptionRef.current;
                            const aiOutput = currentOutputTranscriptionRef.current;
                            const userLineId = `user-${Date.now()}`;
                            const aiLineId = `ai-${Date.now()}`;

                            setTranscriptionHistory(prev => [
                                ...prev,
                                { id: userLineId, role: MessageRole.USER, text: userInput },
                                { id: aiLineId, role: MessageRole.AI, text: aiOutput, isSummarizing: true }
                            ]);
                            currentInputTranscriptionRef.current = '';
                            currentOutputTranscriptionRef.current = '';

                            summarizeTurn(userInput, aiOutput).then(summary => {
                                setTranscriptionHistory(prev => prev.map(line => 
                                    line.id === aiLineId ? { ...line, summary, isSummarizing: false } : line
                                ));
                            });
                        }
                        
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            const oac = outputAudioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, oac.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), oac, 24000, 1);
                            const source = oac.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(oac.destination);
                            
                            source.addEventListener('ended', () => playingSourcesRef.current.delete(source));
                            
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            playingSourcesRef.current.add(source);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session error:', e);
                        setStatus('error');
                        stopLiveSession();
                    },
                    onclose: (e: CloseEvent) => {
                        console.log('Session closed.');
                        if (status !== 'idle') {
                            stopLiveSession();
                        }
                    },
                }
            });

            await sessionPromiseRef.current;

        } catch (error) {
            console.error("Failed to start live session:", error);
            setStatus('error');
            await stopLiveSession();
        }
    }, [getAiInstance, stopLiveSession, summarizeTurn]);

    useEffect(() => {
        return () => {
            stopLiveSession();
        };
    }, [stopLiveSession]);
    
    // Auto-scroll effect
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcriptionHistory]);

    const renderStatus = () => {
        switch (status) {
            case 'idle':
                return "Tekan untuk mulai berbicara";
            case 'connecting':
                return "Menghubungkan...";
            case 'live':
                return "Langsung: Saya mendengarkan...";
            case 'error':
                return "Error. Coba lagi.";
        }
    };
    
    return (
        <div className={`w-full h-full max-w-5xl flex flex-col glass-glow rounded-3xl p-4 ${animationClass}`}>
            <div className="flex-1 relative flex flex-col justify-center items-center min-h-0">
                <AudioVisualizer mediaStream={mediaStreamRef.current} audioContext={inputAudioContextRef.current} isLive={status === 'live'} />
                
                <div className="w-full h-full overflow-y-auto custom-scrollbar pr-2 space-y-4 z-10">
                     {transcriptionHistory.length === 0 && (status === 'idle' || status === 'error') && (
                        <div className="flex items-center justify-center h-full text-center">
                            <p className="text-gray-400">{WELCOME_MESSAGES[ViewType.LIVE]}</p>
                        </div>
                     )}
                    {transcriptionHistory.map(line => (
                        <div key={line.id} className={`flex items-start gap-3 ${line.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}>
                            {line.role === MessageRole.AI && <div className="w-6 h-6 flex-shrink-0 rounded-full bg-gray-800/50 flex items-center justify-center"><AiroraLogo className="w-4 h-4" /></div>}
                            <div className={`max-w-xl text-left text-sm`}>
                                <p className={`px-3 py-2 rounded-lg ${line.role === MessageRole.USER ? 'bg-teal-500/30' : 'bg-gray-800/50'}`}>
                                    {line.text}
                                </p>
                                {line.role === MessageRole.AI && (line.isSummarizing || line.summary) && (
                                    <div className="mt-2 pl-3 border-l-2 border-teal-500/30">
                                        <p className="text-xs font-semibold text-teal-400 mb-1 flex items-center gap-2"><ChatBubbleIcon className="w-3 h-3"/> Poin Pembicaraan</p>
                                        {line.isSummarizing ? (
                                            <div className="flex items-center space-x-1">
                                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                            </div>
                                        ) : (
                                            <div className="text-xs text-gray-400 whitespace-pre-wrap">{line.summary}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {line.role === MessageRole.USER && <div className="w-6 h-6 flex-shrink-0 rounded-full bg-gray-800/50 flex items-center justify-center"><UserIcon className="w-4 h-4 text-gray-400" /></div>}
                        </div>
                    ))}
                     <div ref={transcriptEndRef} />
                </div>
            </div>

            <div className="flex-shrink-0 flex flex-col items-center justify-center pt-4 mt-4 border-t border-white/10">
                <button
                    onClick={status === 'live' || status === 'connecting' ? stopLiveSession : startLiveSession}
                    className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 ease-out z-10
                        ${status === 'live' ? 'bg-red-500/50' : 'bg-teal-500/50'}
                        ${status === 'connecting' ? 'animate-pulse' : ''}
                        hover:scale-105 border-2 border-white/20
                    `}
                    disabled={status === 'connecting'}
                    aria-label={status === 'live' ? 'Stop conversation' : 'Start conversation'}
                >
                    {status === 'live' || status === 'connecting' ? <StopCircleIcon className="w-12 h-12 text-white" /> : <MicrophoneIcon className="w-12 h-12 text-white" />}
                </button>
                <p className="text-gray-400 mt-4 h-5 z-10">{renderStatus()}</p>
            </div>
             <p className="text-[10px] md:text-xs text-gray-500 text-left mt-2 px-2 flex-shrink-0">
                Fitur ini eksperimental. Kualitas dapat bervariasi.
             </p>
        </div>
    );
};

export default LiveView;