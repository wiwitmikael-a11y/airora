import React from 'react';

export const AiroraLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
            <linearGradient id="aurora-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: 'rgba(0, 255, 255, 1)', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: 'rgba(138, 43, 226, 1)', stopOpacity: 1}} />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <g filter="url(#glow)" opacity="0.8">
            {/* Main 'A' shape */}
            <path d="M 100,20 L 170,180 L 140,180 L 100,80 L 60,180 L 30,180 Z" stroke="url(#aurora-gradient)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Inner line */}
            <path d="M 65,130 L 135,130" stroke="url(#aurora-gradient)" strokeWidth="4" strokeLinecap="round" />
            {/* Swirl element */}
            <path d="M 50 80 C 80 50, 120 50, 150 80" stroke="url(#aurora-gradient)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7"/>
             {/* Bottom arc */}
            <path d="M 60 180 Q 100 200, 140 180" stroke="rgba(0, 255, 255, 0.5)" strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>
    </svg>
);

export const AtharrazkaCoreLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
         <defs>
            <linearGradient id="aurora-gradient-core" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: 'rgba(0, 255, 255, 1)', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: 'rgba(138, 43, 226, 1)', stopOpacity: 1}} />
            </linearGradient>
            <filter id="glow-core" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="7" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <g filter="url(#glow-core)" opacity="0.9">
            {/* Central glowing orb */}
            <circle cx="100" cy="100" r="20" fill="url(#aurora-gradient-core)" />
             {/* Quantum orbits */}
            <ellipse cx="100" cy="100" rx="60" ry="30" stroke="url(#aurora-gradient-core)" strokeWidth="4" strokeDasharray="5 10" strokeLinecap="round" transform="rotate(45 100 100)" />
            <ellipse cx="100" cy="100" rx="70" ry="40" stroke="url(#aurora-gradient-core)" strokeWidth="3" opacity="0.6" transform="rotate(-30 100 100)" />
            <path d="M 40,150 Q 100,100 160,150" stroke="rgba(0, 255, 255, 0.5)" strokeWidth="2" fill="none" />
            <path d="M 40,50 Q 100,100 160,50" stroke="rgba(138, 43, 226, 0.5)" strokeWidth="2" fill="none" />
        </g>
    </svg>
);

export const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
);

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...props}>
        <defs>
            <linearGradient id="sparkles-gradient-animated" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="24" y2="24">
                <animateTransform
                    attributeName="gradientTransform"
                    type="rotate"
                    from="0 12 12"
                    to="360 12 12"
                    dur="4s" 
                    repeatCount="indefinite"
                />
                <stop stopColor="#00FFFF" />
                <stop offset="0.5" stopColor="#8A2BE2" />
                <stop offset="1" stopColor="#FF00FF" />
            </linearGradient>
            <filter id="sparkles-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                 <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <g filter="url(#sparkles-glow)" stroke="url(#sparkles-gradient-animated)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            {/* Main 6 arms of the snowflake, perfectly symmetrical and bold */}
            <path d="M12 2 L 12 22" />
            <path d="M20.66 7 L 3.34 17" />
            <path d="M3.34 7 L 20.66 17" />
            
            {/* Central hexagon, larger for more presence */}
            <path d="M12 5 L 16.33 7.5 L 16.33 16.5 L 12 19 L 7.67 16.5 L 7.67 7.5 Z" />
        </g>
    </svg>
);

export const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
);

export const PaperclipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.122 2.122l7.81-7.81" />
    </svg>
);

export const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
);

export const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

export const ShareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.195.025.39.044.588.05H11a2.25 2.25 0 012.25 2.25v.015c0 .537.213 1.03.567 1.397m-2.133 2.133V15.5a2.25 2.25 0 00-2.25-2.25H5.25m9.75 3.375l-3.375-3.375m0 0a2.25 2.25 0 013.182 0l3.375 3.375a2.25 2.25 0 01-3.182 0z" />
    </svg>
);

export const ChatBubbleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 01-2.53-.388A5.863 5.863 0 0111.43 14.5c-.027-.015-.053-.03-.08-.046a1.97 1.97 0 00-2.22-.042A5.863 5.863 0 016 11.43c.015-.027.03-.053.046-.08a1.97 1.97 0 00.042-2.22A5.863 5.863 0 013.388 6.53 9.76 9.76 0 013 3.75c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
);

// New, more familiar chat icon
export const ChatAltIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72.372a11.25 11.25 0 01-8.584 0l-3.72-.372A2.093 2.093 0 013 14.894V10.608c0-.97.616-1.813 1.5-2.097m16.5 0a2.25 2.25 0 00-1.88-2.29l-3.72-.372a11.25 11.25 0 00-8.584 0l-3.72.372A2.25 2.25 0 003.75 6.22v4.388z" />
    </svg>
);

export const LightbulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-11.39a6.01 6.01 0 00-3 0m1.5 11.39a6.01 6.01 0 01-1.5-11.39m0 0A23.93 23.93 0 0112 3c1.007 0 1.992.023 2.974.068m-4.948 3.552A23.93 23.93 0 0012 6.75c1.007 0 1.992-.023 2.974-.068m-7.404 6.082A23.93 23.93 0 0112 12.75c1.007 0 1.992-.023 2.974-.068m-4.948 3.552A23.93 23.93 0 0012 15.75c1.007 0 1.992-.023 2.974-.068m0 0a2.25 2.25 0 012.25 2.25v.75a2.25 2.25 0 01-2.25-2.25h-4.5a2.25 2.25 0 01-2.25-2.25v-.75a2.25 2.25 0 012.25-2.25h1.5z" />
    </svg>
);

export const FeatherIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 15.66l-4.288-4.288a1.5 1.5 0 010-2.121l4.288-4.288a1.5 1.5 0 012.121 0l4.288 4.288a1.5 1.5 0 010 2.121l-4.288 4.288a1.5 1.5 0 01-2.121 0zM4.5 5.625a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM4.5 13.875a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
    </svg>
);

export const CodeBracketIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
    </svg>
);

export const ImageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);

export const FilmIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12H3.75a.75.75 0 00-.75.75v6c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-6a.75.75 0 00-.75-.75zM20.25 12h-3a.75.75 0 00-.75.75v6c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-6a.75.75 0 00-.75-.75zM12 12.75V15m0 0V12.75m0 2.25H9.75m2.25 0h2.25M6 15h.75m-1.5 0h.75m12 0h.75m-1.5 0h.75M9 4.5h6a2.25 2.25 0 012.25 2.25v6.75a2.25 2.25 0 01-2.25-2.25H9a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 019 4.5z" />
    </svg>
);

// New, more familiar video icon
export const VideoCameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />
    </svg>
);

export const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

export const GlobeAltIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75a15.75 15.75 0 010 16.5M3.75 12a15.75 15.75 0 0116.5 0" />
    </svg>
);

export const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);

export const GridIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
);

export const BookOpenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);

export const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);