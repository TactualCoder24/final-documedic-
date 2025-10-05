import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

export const Sun: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

export const Moon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

export const Menu: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
);

export const FileText: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

export const Pill: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path>
        <path d="m8.5 8.5 7 7"></path>
    </svg>
);

export const BrainCircuit: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5a3 3 0 1 0-5.993.131M12 5a3 3 0 1 1 5.993.131M15.5 13a3.5 3.5 0 1 0-6.994.132M15.5 13a3.5 3.5 0 1 1 6.994.132M8.5 13a3.5 3.5 0 1 1-6.994.132M8.5 13a3.5 3.5 0 1 0 6.994.132M12 21a3 3 0 1 0-5.993-.131M12 21a3 3 0 1 1 5.993.131"/>
        <path d="M12 5v0a3 3 0 0 0-3 3v0a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5v0a3 3 0 0 0-3-3Z"/>
        <path d="M15.5 13a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0-.5.5v0a3.5 3.5 0 0 0 7 0Z"/>
        <path d="M8.5 13a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v0a3.5 3.5 0 0 1-7 0Z"/>
        <path d="M12 21v0a3 3 0 0 1 3-3v0a.5.5 0 0 1-.5-.5h-5a.5.5 0 0 1-.5.5v0a3 3 0 0 1 3 3Z"/>
        <path d="M14.5 8.5a.5.5 0 0 0-1 0v3a.5.5 0 0 0 1 0v-3Z"/>
        <path d="M9.5 8.5a.5.5 0 0 1 1 0v3a.5.5 0 0 1-1 0v-3Z"/>
        <path d="M17.5 16.5a.5.5 0 0 0-1 0v3a.5.5 0 0 0 1 0v-3Z"/>
        <path d="M6.5 16.5a.5.5 0 0 1 1 0v3a.5.5 0 0 1-1 0v-3Z"/>
    </svg>
);

export const QrCode: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="6" height="6"></rect>
        <rect x="15" y="3" width="6" height="6"></rect>
        <rect x="3" y="15" width="6" height="6"></rect>
        <path d="M15 15h6v6h-6z"></path>
        <path d="M3 9h6V3"></path>
        <path d="M15 9h6V3"></path>
        <path d="M3 21h6v-6"></path>
        <path d="M15 15v6h6"></path>
    </svg>
);

export const Bell: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
);

export const Lightbulb: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6"></path>
        <path d="M10 22h4"></path>
        <path d="M12 2a7 7 0 0 0-7 7c0 3.03 1.09 5.25 3 6.92"></path>
        <path d="M12 2a7 7 0 0 1 7 7c0 3.03-1.09 5.25-3 6.92"></path>
    </svg>
);

export const HeartPulse: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19.5 12.5c-2.3 0-4.5 1.4-5.5 3.5-1-2.1-3.2-3.5-5.5-3.5-3.6 0-6.5 2.9-6.5 6.5s2.9 6.5 6.5 6.5c2.3 0 4.5-1.4 5.5-3.5 1 2.1 3.2 3.5 5.5 3.5 3.6 0 6.5-2.9 6.5-6.5s-2.9-6.5-6.5-6.5z"></path>
        <path d="M3 12h2l2-9 4 18 3-13 2 6h3"></path>
    </svg>
);

export const LogOut: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
);

export const UploadCloud: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 16l-4-4-4 4"></path>
        <path d="M12 12v9"></path>
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
        <path d="M16 16l-4-4-4 4"></path>
    </svg>
);

export const X: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

export const Plus: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

export const ThumbsUp: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 10v12" />
        <path d="M18 10V5.5a2.5 2.5 0 0 0-5 0V10" />
        <path d="M10 10h3.5a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1" />
    </svg>
);

export const ThumbsDown: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 14V2" />
        <path d="M18 14v4.5a2.5 2.5 0 0 1-5 0V14" />
        <path d="M10 14H6.5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1" />
    </svg>
);

export const Trash2: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

export const Download: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);