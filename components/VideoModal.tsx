

import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon, DownloadIcon, CopyIcon, CheckIcon, ShareIcon, BookOpenIcon } from './icons/Icons';
import { GeneratedVideo } from '../types';
import { playSound } from '../sound';

interface VideoModalProps {
    video: GeneratedVideo;
    onClose: () => void;
    onUseForStory: (prompt: string) => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ video, onClose, onUseForStory }) => {
    const [copied, setCopied] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleCopy = () => {
        playSound('click');
        navigator.clipboard.writeText(video.prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = async () => {
        playSound('click');
        if (!video.videoUrl) return;
        try {
            const response = await fetch(video.videoUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const safePrompt = video.prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            link.download = `${safePrompt.slice(0, 30)}.mp4`;
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Could not download the video.");
        }
    };

    const fetchToFile = async (url: string, fileName: string): Promise<File | null> => {
        try {
            const res = await fetch(url);
            const blob = await res.blob();
            return new File([blob], fileName, { type: blob.type });
        } catch (e) {
            console.error("Could not fetch video for sharing:", e);
            return null;
        }
    };

    const handleShare = async () => {
        playSound('click');
        if (!video.videoUrl) return;
        if (navigator.share) {
            try {
                const file = await fetchToFile(video.videoUrl, 'airora-generated-video.mp4');
                if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: 'Video from AIRORA',
                        text: video.prompt,
                        files: [file],
                    });
                } else {
                     await navigator.share({ title: 'Video from AIRORA', text: video.prompt });
                }
            } catch (error) {
                const err = error as Error;
                if (err.name !== 'AbortError') {
                     console.error('Error sharing:', err);
                     alert('Could not share video.');
                }
            }
        } else {
            alert('Sharing not supported on this browser.');
        }
    };

    return (
        <div 
            ref={modalRef}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in"
            onClick={(e) => { if(modalRef.current === e.target) onClose(); }}
        >
            <div className="relative w-11/12 max-w-4xl max-h-[90vh] flex flex-col glass-glow rounded-2xl">
                <div className="overflow-y-auto custom-scrollbar p-6">
                    <div className="flex-1 min-h-0 flex items-center justify-center mb-4">
                         <video src={video.videoUrl} controls autoPlay loop className="max-w-full max-h-[70vh] object-contain rounded-lg" />
                    </div>
                    
                    <div className="flex-shrink-0 bg-gray-900/50 p-4 rounded-lg">
                        <p className="text-gray-300 text-sm mb-3">{video.prompt}</p>
                        <div className="flex flex-wrap items-center gap-2">
                            <button onClick={handleCopy} onMouseEnter={() => playSound('hover')} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 text-xs transition-colors">
                                {copied ? <CheckIcon className="w-4 h-4 text-teal-400" /> : <CopyIcon className="w-4 h-4" />}
                                <span>{copied ? 'Copied!' : 'Copy Prompt'}</span>
                            </button>
                             <button onClick={handleDownload} onMouseEnter={() => playSound('hover')} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 text-xs transition-colors">
                                <DownloadIcon className="w-4 h-4" />
                                <span>Download</span>
                            </button>
                            <button onClick={handleShare} onMouseEnter={() => playSound('hover')} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 text-xs transition-colors">
                                <ShareIcon className="w-4 h-4" />
                                <span>Share</span>
                            </button>
                            <button onClick={() => { playSound('click'); onUseForStory(video.prompt); }} onMouseEnter={() => playSound('hover')} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 text-xs transition-colors">
                                <BookOpenIcon className="w-4 h-4" />
                                <span>Jadikan Narasi Puitis</span>
                            </button>
                        </div>
                    </div>
                </div>

                <button onClick={() => { playSound('close'); onClose(); }} onMouseEnter={() => playSound('hover')} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-10">
                    <CloseIcon className="w-6 h-6 text-gray-400"/>
                </button>
            </div>
        </div>
    );
};

export default VideoModal;