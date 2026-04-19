import React from 'react';
import { motion } from 'framer-motion';
import { useConfig } from '../../context/ConfigContext';

interface LogoProps {
  className?: string;
  size?: number;
  withText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 40, withText = false }) => {
  const { config } = useConfig();
  const customLogo = config?.company_logo_url;

  return (
    <div className={`flex items-center gap-3 ${className}`} style={{ maxHeight: size, overflow: 'hidden' }}>
      {/* Premium Logo Container */}
      <motion.div 
        whileHover={{ scale: 1.05, rotate: 2 }}
        whileTap={{ scale: 0.95 }}
        style={{ 
          height: size, 
          width: customLogo ? 'auto' : size,
          maxWidth: size * 4,
          minWidth: customLogo ? '60px' : size,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden'
        }}
      >
        {customLogo ? (
          /* Render uploaded company logo with flexible width but STRICT height */
          <div style={{ height: size, width: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src={customLogo} 
              alt="Logo" 
              style={{ height: '100%', width: 'auto', maxWidth: '240px', objectFit: 'contain' }}
              onError={(e) => (e.currentTarget.style.display = 'none')} 
            />
          </div>
        ) : (
          /* Fallback to Premium SVG Symbol */
          <>
            {/* Shadow layer for depth */}
            <div 
              className="absolute inset-0 rounded-xl blur-md opacity-20"
              style={{ backgroundColor: '#a524eb', transform: 'translateY(4px)' }}
            />
            
            {/* Main Background Gradient */}
            <div 
              className="absolute inset-0 rounded-xl overflow-hidden"
              style={{ 
                background: 'linear-gradient(135deg, #a524eb 0%, #821bc1 100%)',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.3), 0 4px 12px rgba(165, 36, 235, 0.25)'
              }}
            />

            {/* Abstract Alpha SVG Symbol */}
            <svg 
              width={size * 0.65} 
              height={size * 0.65} 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="relative z-10"
            >
              <path 
                d="M12 2L4.5 20.5H7.5L9.5 15.5H14.5L16.5 20.5H19.5L12 2Z" 
                fill="white" 
                fillOpacity="0.9"
              />
              <path 
                d="M12 7L10.5 11H13.5L12 7Z" 
                fill="white"
              />
              {/* Accent Leaf/Growth Element in Lime Green */}
              <circle 
                cx="18" 
                cy="18" 
                r="3" 
                fill="#7CB342" 
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </svg>
          </>
        )}
      </motion.div>
      
      {withText && (
        <div className="flex flex-col leading-tight select-none">
          <div className="flex items-center gap-1">
            <span className="text-xl font-medium tracking-tight" style={{ color: '#a524eb' }}>
              {(config?.company_name || 'ALPHA').split(' ')[0]}
            </span>
            <span className="text-xl font-light tracking-tighter" style={{ color: '#7CB342' }}>
              {(config?.company_name || ' RH').split(' ').slice(1).join(' ') || 'RH'}
            </span>
          </div>
          <span className="text-[10px] uppercase font-medium tracking-[0.25em] text-slate-400">Excellence RH</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
