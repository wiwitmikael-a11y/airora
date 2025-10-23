import React, { useState, useCallback, useRef, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { GoogleGenAI } from '@google/genai';
import { GeneratedVideo } from '../types';
import InputBar from './InputBar';
import VideoModal from './VideoModal';
import { VIDEO_MODEL_ID } from '../constants';
import { FilmIcon, AlertTriangleIcon } from './icons/Icons';
import { playSound } from '../sound';

interface VideoViewProps {
    isAnimatingOut: boolean;
    getAiInstance: () => GoogleGenAI | null;
}

const VideoView: React.FC<VideoViewProps> = ({ isAnimatingOut, getAiInstance }) => {
    const [videos, setVideos] = useState<GeneratedVideo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<GeneratedVideo | null>(null);
    const [apiKeySelected, setApiKeySelected] = useState(true); // Assume true initially
    const pollIntervals = useRef<Record<string, NodeJS.Timeout>>({});
    
    const animationClass = isAnimatingOut ? 'animate-recede' : 'animate-emerge';
    
    const checkApiKey = useCallback(async () => {
        if (window.aistudio && (await window.aistudio.hasSelectedApiKey())) {
            setApiKeySelected(true);
            return true;
        }
        setApiKeySelected(false);
        return false;
    }, []);

    useEffect(() => {
        checkApiKey();
    }, [checkApiKey]);

    const handleSelectKey = async () => {
        if (window.aistudio) {
            playSound('click');
            await window.aistudio.openSelectKey();
            setApiKeySelected(true);
        }
    };

    const pollOperation = useCallback(async (videoToPoll: GeneratedVideo) => {
        // Create a fresh AI instance for polling to ensure the latest key is used.
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        if (!ai) return;

        try {
            let operation = await ai.operations.getVideosOperation({ operation: { name: videoToPoll.operationName } });

            if (operation.done) {
                clearInterval(pollIntervals.current[videoToPoll.id]);
                delete pollIntervals.current[videoToPoll.id];

                if (operation.response?.generatedVideos?.[0]?.video?.uri) {
                    const downloadLink = operation.response.generatedVideos[0].video.uri;
                    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                    const blob = await response.blob();
                    const videoUrl = URL.createObjectURL(blob);
                    setVideos(prev => prev.map(v => v.id === videoToPoll.id ? { ...v, status: 'completed', videoUrl } : v));
                } else {
                    throw new Error(operation.error?.message || "Video generation completed but no URI found.");
                }
            }
        } catch (error: any) {
            console.error('Error polling video operation:', error);
            if (error.message?.includes("Requested entity was not found")) {
                 setApiKeySelected(false); // Reset key selection on auth error
            }
            clearInterval(pollIntervals.current[videoToPoll.id]);
            delete pollIntervals.current[videoToPoll.id];
            setVideos(prev => prev.map(v => v.id === videoToPoll.id ? { ...v, status: 'failed' } : v));
        }
    }, []);

    const handleGenerate = useCallback(async (prompt: string, image?: { base64: string, mimeType: string }) => {
        if (!(await checkApiKey())) {
            handleSelectKey();
            return;
        }
        
        // Always create a fresh AI instance before an API call
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        if (!ai || !prompt) return;

        setIsLoading(true);
        const newVideo: GeneratedVideo = {
            id: nanoid(),
            prompt,
            status: 'processing',
            operationName: '',
            ...(image && { uploadedImage: { url: `data:${image.mimeType};base64,${image.base64}` } }),
        };
        setVideos(prev => [newVideo, ...prev]);

        try {
            const operation = await ai.models.generateVideos({
                model: VIDEO_MODEL_ID,
                prompt,
                ...(image && { image: { imageBytes: image.base64, mimeType: image.mimeType } }),
                config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
            });

            const videoWithOpName = { ...newVideo, operationName: operation.name };
            setVideos(prev => prev.map(v => v.id === newVideo.id ? videoWithOpName : v));
            
            pollIntervals.current[newVideo.id] = setInterval(() => pollOperation(videoWithOpName), 10000);

        } catch (error: any) {
            console.error('Error generating video:', error);
            if (error.message?.includes("Requested entity was not found")) {
                setApiKeySelected(false);
            }
            setVideos(prev => prev.map(v => v.id === newVideo.id ? { ...v, status: 'failed' } : v));
        } finally {
            setIsLoading(false);
        }
    }, [checkApiKey, pollOperation, handleSelectKey]);

    useEffect(() => {
        return () => {
            Object.values(pollIntervals.current).forEach(clearInterval);
        };
    }, []);

    return (
        <div className={`w-full h-full flex flex-col glass-glow rounded-3xl relative overflow-hidden ${animationClass}`}>
            {!apiKeySelected && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-4 rounded-3xl animate-fade-in">
                    <AlertTriangleIcon className="w-12 h-12 text-yellow-400 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">API Key Required for Video Generation</h3>
                    <p className="text-gray-300 max-w-md mb-4">
                        Video generation with Veo models requires you to select your own API key. This is a mandatory step.
                        Make sure your key is enabled for the 'Generative Language API'.
                    </p>
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-sm text-teal-400 hover:underline mb-6">Learn more about billing</a>
                    <button onClick={handleSelectKey} className="px-6 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors">
                        Select API Key
                    </button>
                </div>
            )}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {videos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                        <FilmIcon className="w-16 h-16 mb-4 text-teal-400/50" />
                        <h2 className="text-xl font-bold text-white">Video Generation</h2>
                        <p>Describe the video you want to create. This can take several minutes.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {videos.map(video => (
                            <div key={video.id} className="aspect-video rounded-lg bg-gray-800/50 overflow-hidden group relative cursor-pointer" onClick={() => video.videoUrl && setSelectedVideo(video)}>
                                {video.status === 'processing' && (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                                        <div className="w-8 h-8 border-4 border-t-teal-400 border-gray-600 rounded-full animate-spin mb-4"></div>
                                        <p className="text-sm text-white">Generating video...</p>
                                        <p className="text-xs text-gray-400">This can take a few minutes.</p>
                                    </div>
                                )}
                                {video.status === 'failed' && (
                                    <div className="w-full h-full flex items-center justify-center text-red-400">Failed</div>
                                )}
                                {video.videoUrl && (
                                    <video src={video.videoUrl} className="w-full h-full object-cover" loop autoPlay muted />
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                    <p className="text-sm text-white line-clamp-2">{video.prompt}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="px-6 pb-6 flex-shrink-0">
                <InputBar onSendMessage={handleGenerate} isLoading={isLoading} showImageUpload={true} />
                 <p className="text-[10px] md:text-xs text-gray-500 text-left mt-2">
                    Video generation is an experimental feature and may take several minutes to complete.
                 </p>
            </div>
             {selectedVideo && <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />}
        </div>
    );
};

export default VideoView;
