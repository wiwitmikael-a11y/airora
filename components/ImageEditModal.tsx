import React, { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { GoogleGenAI, Modality } from '@google/genai';
import { ImageForEditing, GeneratedImage } from '../types';
import InputBar from './InputBar';
import { CloseIcon, SparklesIcon } from './icons/Icons';
import { EDIT_IMAGE_MODEL_ID } from '../constants';
import { playSound } from '../sound';

interface ImageEditModalProps {
    image: ImageForEditing;
    onClose: () => void;
    getAiInstance: () => GoogleGenAI | null;
    onEditComplete: (newImage: GeneratedImage) => void;
}

const ImageEditModal: React.FC<ImageEditModalProps> = ({ image, onClose, getAiInstance, onEditComplete }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        playSound('open');
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            playSound('close');
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const handleEdit = useCallback(async (prompt: string) => {
        const ai = getAiInstance();
        if (!ai || !prompt) return;

        setIsLoading(true);
        setEditedImage(null);
        setError(null);

        try {
            const imagePart = {
                inlineData: { data: image.base64, mimeType: image.mimeType },
            };
            const textPart = { text: prompt };

            const response = await ai.models.generateContent({
                model: EDIT_IMAGE_MODEL_ID,
                contents: { parts: [imagePart, textPart] },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });
            
            const imagePartResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

            if (imagePartResponse?.inlineData) {
                const base64ImageBytes: string = imagePartResponse.inlineData.data;
                const imageUrl = `data:${imagePartResponse.inlineData.mimeType};base64,${base64ImageBytes}`;
                setEditedImage(imageUrl);
                const newImage: GeneratedImage = {
                    id: nanoid(),
                    prompt: `${image.prompt} (edited: ${prompt})`,
                    imageUrl,
                    status: 'completed'
                };
                onEditComplete(newImage);
            } else {
                throw new Error("No image data returned from API.");
            }
        } catch (err) {
            console.error('Error editing image:', err);
            setError("Failed to edit image. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [getAiInstance, image, onEditComplete]);

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-4xl glass-glow rounded-xl p-6 flex flex-col lg:flex-row gap-6 relative animate-zoom-in" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute -top-3 -right-3 p-1.5 bg-gray-800 rounded-full z-10 hover:bg-gray-700">
                    <CloseIcon className="w-5 h-5 text-white" />
                </button>

                <div className="lg:w-1/2 flex flex-col items-center justify-center">
                    <p className="text-sm text-gray-400 mb-2">Original Image</p>
                    <img src={image.imageUrl} alt="Original" className="rounded-lg max-h-64 lg:max-h-full object-contain" />
                </div>

                <div className="lg:w-1/2 flex flex-col">
                    <div className="flex-1 flex flex-col items-center justify-center bg-gray-800/50 rounded-lg p-4 min-h-[200px]">
                        {isLoading ? (
                            <div className="flex flex-col items-center text-center">
                                <SparklesIcon className="w-12 h-12 text-teal-400 animate-pulse mb-4" />
                                <p className="text-white">Editing your image...</p>
                            </div>
                        ) : editedImage ? (
                            <>
                                <p className="text-sm text-gray-400 mb-2">Edited Image</p>
                                <img src={editedImage} alt="Edited" className="rounded-lg max-h-64 lg:max-h-full object-contain" />
                            </>
                        ) : (
                            <div className="flex flex-col items-center text-center text-gray-400 p-4">
                                <SparklesIcon className="w-12 h-12 mb-4" />
                                <h3 className="font-bold text-lg text-white mb-1">Edit Image</h3>
                                {error ? <p className="text-red-400">{error}</p> : <p>Describe the changes you'd like to make.</p>}
                            </div>
                        )}
                    </div>
                    <div className="mt-4">
                        <InputBar onSendMessage={handleEdit} isLoading={isLoading} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageEditModal;
