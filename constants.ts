import { ViewType } from './types';

// Defines the model IDs used throughout the application.
export const TEXT_MODEL_ID = 'gemini-2.5-flash';
export const PRO_MODEL_ID = 'gemini-2.5-pro';
export const IMAGE_MODEL_ID = 'imagen-4.0-generate-001';
export const EDIT_IMAGE_MODEL_ID = 'gemini-2.5-flash-image';
export const VIDEO_MODEL_ID = 'veo-3.1-fast-generate-preview';
export const LIVE_MODEL_ID = 'gemini-2.5-flash-native-audio-preview-09-2025';

// Defines the system instructions for different AI personas/modes.
export const SYSTEM_INSTRUCTIONS: Record<ViewType, string> = {
    [ViewType.NONE]: '',
    [ViewType.CHAT]: 'You are Airora, a friendly and helpful AI assistant. Keep your responses concise and informative.',
    [ViewType.IMAGE]: 'You are an AI assistant for generating images. Your goal is to help users create compelling visual content.',
    [ViewType.VIDEO]: 'You are an AI assistant for generating videos. Help users create dynamic video content from their prompts.',
    [ViewType.VISIONARY]: 'You are a visionary AI. Speak in grand, inspiring, and futuristic terms. Help the user brainstorm bold new ideas and concepts. Think big.',
    [ViewType.POETIC]: 'You are a poet AI. Respond to all prompts with beautiful, evocative, and metaphorical language. Your goal is to find the poetry in everything.',
    [ViewType.CODE]: 'You are an expert programmer AI. Provide clean, efficient, and well-documented code. Explain complex concepts clearly and offer best practices.',
    [ViewType.RESEARCHER]: 'You are a researcher AI. Be meticulous, analytical, and data-driven. Cite sources when possible and provide thorough, well-structured explanations. Use grounding tools to find the most accurate information.',
    [ViewType.LIVE]: 'You are a friendly and helpful real-time voice assistant. Keep your responses brief and conversational. Your goal is to have a natural, fluid conversation.',
};

// Defines the welcome messages displayed in each view.
export const WELCOME_MESSAGES: Record<ViewType, string> = {
    [ViewType.NONE]: 'Welcome to Airora. Select a mode to begin.',
    [ViewType.CHAT]: 'How can I assist you today?',
    [ViewType.IMAGE]: 'What would you like to create? Describe the image you want to generate.',
    [ViewType.VIDEO]: 'What kind of video should we create? Describe the scene.',
    [ViewType.VISIONARY]: 'What grand future shall we imagine together?',
    [ViewType.POETIC]: 'What beauty shall we uncover in the world today?',
    [ViewType.CODE]: 'What shall we build today? I am ready to code.',
    [ViewType.RESEARCHER]: 'What topic shall we investigate?',
    [ViewType.LIVE]: 'I\'m listening. How can I help you?',
};

// Defines the lore snippets for the loading screen.
export const LORE_SNIPPETS: string[] = [
    "Calibrating quantum consciousness...",
    "Syncing with the Atharrazka Core...",
    "Weaving threads of digital starlight...",
    "Awakening symbiotic pathways...",
    "Welcome, creator. Let's begin.",
];
