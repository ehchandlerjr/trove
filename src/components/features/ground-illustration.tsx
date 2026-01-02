'use client';

import { useTheme } from '@/components/providers/theme-provider';
import { useEventTheme } from '@/components/providers/event-theme-provider';

// ============================================================================
// GROUND ILLUSTRATIONS
// Scene-setting illustrations at the bottom of list pages
// ============================================================================

interface GroundProps {
  width?: string;
  height?: number;
}

export function GroundIllustration({ width = '100%', height = 120 }: GroundProps) {
  const { eventTheme, eventThemeId } = useEventTheme();
  const { resolvedTheme } = useTheme();
  
  const isDark = resolvedTheme === 'obsidian' || resolvedTheme === 'scriptorium';
  
  if (eventThemeId === 'none') {
    return null;
  }
  
  const groundKey = eventTheme.groundKey;
  
  return (
    <div 
      style={{ 
        width, 
        height, 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <svg 
        viewBox="0 0 400 120" 
        preserveAspectRatio="xMidYMax slice"
        style={{ width: '100%', height: '100%' }}
      >
        <GroundScene groundKey={groundKey} isDark={isDark} />
      </svg>
    </div>
  );
}

interface GroundSceneProps {
  groundKey: string;
  isDark: boolean;
}

function GroundScene({ groundKey, isDark }: GroundSceneProps) {
  switch (groundKey) {
    case 'birthday':
      return <BirthdayGround isDark={isDark} />;
    case 'christmas':
      return <ChristmasGround isDark={isDark} />;
    case 'wedding':
      return <WeddingGround isDark={isDark} />;
    case 'easter':
      return <EasterGround isDark={isDark} />;
    case 'baby':
      return <BabyGround isDark={isDark} />;
    case 'halloween':
      return <HalloweenGround isDark={isDark} />;
    case 'hanukkah':
      return <HanukkahGround isDark={isDark} />;
    case 'graduation':
      return <GraduationGround isDark={isDark} />;
    default:
      return null;
  }
}

// ============================================================================
// INDIVIDUAL GROUND SCENES
// ============================================================================

function BirthdayGround({ isDark }: { isDark: boolean }) {
  const grassColor = isDark ? '#2D4A2D' : '#7BC67B';
  const giftColors = ['#E85A9A', '#5DADE2', '#F1C40F', '#9B59B6'];
  
  return (
    <g>
      {/* Grass */}
      <rect x="0" y="90" width="400" height="30" fill={grassColor} opacity="0.6" />
      {Array.from({ length: 50 }).map((_, i) => (
        <path
          key={i}
          d={`M${i * 8 + 2} 90 Q${i * 8 + 4} ${75 + (i % 3) * 5} ${i * 8 + 6} 90`}
          stroke={grassColor}
          strokeWidth="2"
          fill="none"
          opacity="0.8"
        />
      ))}
      
      {/* Party bunting at top */}
      <path d="M0 20 L50 35 L100 20 L150 35 L200 20 L250 35 L300 20 L350 35 L400 20" 
        stroke={isDark ? '#C5BEB4' : '#6B6560'} strokeWidth="1.5" fill="none" />
      {[25, 75, 125, 175, 225, 275, 325, 375].map((x, i) => (
        <polygon key={i} points={`${x-8},${i % 2 ? 35 : 20} ${x+8},${i % 2 ? 35 : 20} ${x},${i % 2 ? 50 : 35}`} 
          fill={giftColors[i % 4]} opacity="0.8" />
      ))}
      
      {/* Gift boxes */}
      {[60, 160, 280, 350].map((x, i) => (
        <g key={i} transform={`translate(${x}, 70)`}>
          <rect x="-12" y="0" width="24" height="20" rx="2" fill={giftColors[i]} opacity="0.9" />
          <rect x="-14" y="-4" width="28" height="6" rx="1" fill={giftColors[i]} />
          <rect x="-2" y="-4" width="4" height="24" fill="white" opacity="0.3" />
          <path d={`M-6 -4 Q0 -12 0 -4`} stroke={giftColors[i]} strokeWidth="3" fill="none" />
          <path d={`M6 -4 Q0 -12 0 -4`} stroke={giftColors[i]} strokeWidth="3" fill="none" />
        </g>
      ))}
      
      {/* Balloons */}
      {[100, 200, 320].map((x, i) => (
        <g key={i} transform={`translate(${x}, 50)`}>
          <ellipse cx="0" cy="-20" rx="12" ry="15" fill={giftColors[(i + 1) % 4]} opacity="0.85" />
          <path d={`M0 -5 Q2 10 0 25`} stroke={giftColors[(i + 1) % 4]} strokeWidth="1" fill="none" opacity="0.6" />
          <ellipse cx="-4" cy="-26" rx="3" ry="4" fill="white" opacity="0.3" />
        </g>
      ))}
      
      {/* Confetti */}
      {Array.from({ length: 20 }).map((_, i) => (
        <rect key={i} 
          x={i * 20 + 5} y={80 + (i % 4) * 5} 
          width="4" height="6" rx="1" 
          fill={giftColors[i % 4]} 
          opacity="0.6" 
          transform={`rotate(${(i * 30) % 90} ${i * 20 + 7} ${83 + (i % 4) * 5})`} 
        />
      ))}
    </g>
  );
}

function ChristmasGround({ isDark }: { isDark: boolean }) {
  const snowColor = isDark ? '#E8E4DD' : '#FFFFFF';
  const treeColor = isDark ? '#1E5631' : '#228B22';
  
  return (
    <g>
      {/* Snow drifts */}
      <ellipse cx="80" cy="110" rx="100" ry="20" fill={snowColor} opacity="0.9" />
      <ellipse cx="250" cy="115" rx="120" ry="18" fill={snowColor} opacity="0.85" />
      <ellipse cx="380" cy="108" rx="80" ry="22" fill={snowColor} opacity="0.9" />
      
      {/* Snow mounds */}
      <ellipse cx="150" cy="105" rx="30" ry="10" fill={snowColor} opacity="0.7" />
      <ellipse cx="320" cy="100" rx="25" ry="8" fill={snowColor} opacity="0.7" />
      
      {/* Pine trees */}
      {[40, 130, 220, 300, 370].map((x, i) => {
        const treeHeight = 50 + (i % 3) * 15;
        return (
          <g key={i} transform={`translate(${x}, ${100 - treeHeight})`}>
            <polygon 
              points={`0,${treeHeight} -${15 + i * 2},${treeHeight} 0,0 ${15 + i * 2},${treeHeight}`} 
              fill={treeColor} 
              opacity="0.85" 
            />
            <polygon 
              points={`0,${treeHeight * 0.6} -${10 + i},${treeHeight * 0.6} 0,${treeHeight * 0.1} ${10 + i},${treeHeight * 0.6}`} 
              fill={treeColor} 
              opacity="0.9" 
            />
            {/* Snow on branches */}
            <ellipse cx="0" cy={treeHeight * 0.3} rx={8 + i} ry="3" fill={snowColor} opacity="0.8" />
            <ellipse cx="0" cy={treeHeight * 0.6} rx={10 + i} ry="4" fill={snowColor} opacity="0.7" />
          </g>
        );
      })}
      
      {/* Falling snow */}
      {Array.from({ length: 30 }).map((_, i) => (
        <circle key={i} cx={(i * 13 + 5) % 400} cy={(i * 7) % 100} r={1 + (i % 2)} fill={snowColor} opacity="0.6" />
      ))}
    </g>
  );
}

function WeddingGround({ isDark }: { isDark: boolean }) {
  const grassColor = isDark ? '#2D4A2D' : '#7BC67B';
  const flowerColor = isDark ? '#F5B7B1' : '#FADBD8';
  const archColor = isDark ? '#C5BEB4' : '#FFFFFF';
  
  return (
    <g>
      {/* Grass */}
      <rect x="0" y="95" width="400" height="25" fill={grassColor} opacity="0.5" />
      {Array.from({ length: 60 }).map((_, i) => (
        <path
          key={i}
          d={`M${i * 7} 95 Q${i * 7 + 2} ${82 + (i % 4) * 4} ${i * 7 + 4} 95`}
          stroke={grassColor}
          strokeWidth="1.5"
          fill="none"
          opacity="0.7"
        />
      ))}
      
      {/* Wedding arch */}
      <path 
        d="M180 95 L180 40 Q200 20 220 40 L220 95" 
        stroke={archColor} 
        strokeWidth="6" 
        fill="none" 
        opacity="0.9" 
      />
      
      {/* Flowers on arch */}
      {[45, 55, 65].map((y, i) => (
        <g key={i}>
          <circle cx={182} cy={y} r="5" fill={flowerColor} opacity="0.9" />
          <circle cx={218} cy={y} r="5" fill={flowerColor} opacity="0.9" />
        </g>
      ))}
      <circle cx="200" cy="25" r="8" fill={flowerColor} opacity="0.9" />
      
      {/* Rose bushes */}
      {[60, 340].map((x, i) => (
        <g key={i} transform={`translate(${x}, 80)`}>
          <ellipse cx="0" cy="0" rx="25" ry="15" fill={grassColor} opacity="0.7" />
          {[-15, 0, 15].map((rx, j) => (
            <circle key={j} cx={rx} cy={-5 - (j % 2) * 5} r="6" fill={flowerColor} opacity="0.85" />
          ))}
        </g>
      ))}
      
      {/* Rose petals on ground */}
      {Array.from({ length: 15 }).map((_, i) => (
        <ellipse key={i} 
          cx={100 + i * 15} cy={100 + (i % 3) * 3} 
          rx="3" ry="2" 
          fill={flowerColor} 
          opacity="0.5"
          transform={`rotate(${i * 25} ${100 + i * 15} ${100 + (i % 3) * 3})`}
        />
      ))}
    </g>
  );
}

function EasterGround({ isDark }: { isDark: boolean }) {
  const grassColor = isDark ? '#2D4A2D' : '#90EE90';
  const eggColors = ['#9B59B6', '#F1C40F', '#5DADE2', '#E85A9A', '#2ECC71'];
  
  return (
    <g>
      {/* Dense grass - back layer */}
      <rect x="0" y="90" width="400" height="30" fill={grassColor} opacity="0.4" />
      {Array.from({ length: 80 }).map((_, i) => (
        <path
          key={`back-${i}`}
          d={`M${i * 5} 90 Q${i * 5 + 2} ${72 + (i % 5) * 4} ${i * 5 + 3} 90`}
          stroke={grassColor}
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        />
      ))}
      
      {/* Easter eggs hidden in grass */}
      {[30, 90, 150, 230, 290, 360].map((x, i) => (
        <g key={i} transform={`translate(${x}, 88)`}>
          <ellipse cx="0" cy="0" rx="8" ry="11" fill={eggColors[i % 5]} opacity="0.85" />
          <path d={`M-4 -4 Q0 -8 4 -4`} stroke="white" strokeWidth="1.5" fill="none" opacity="0.4" />
        </g>
      ))}
      
      {/* Dense grass - front layer */}
      {Array.from({ length: 60 }).map((_, i) => (
        <path
          key={`front-${i}`}
          d={`M${i * 7 + 2} 95 Q${i * 7 + 4} ${80 + (i % 4) * 3} ${i * 7 + 6} 95`}
          stroke={grassColor}
          strokeWidth="2"
          fill="none"
          opacity="0.8"
        />
      ))}
      
      {/* Tulips */}
      {[70, 180, 320].map((x, i) => (
        <g key={i} transform={`translate(${x}, 75)`}>
          <path d="M0 20 L0 0" stroke="#228B22" strokeWidth="2" />
          <ellipse cx="0" cy="-8" rx="6" ry="10" fill={eggColors[(i + 2) % 5]} opacity="0.9" />
          <path d="M-4 -6 Q0 -14 4 -6" fill={eggColors[(i + 2) % 5]} />
        </g>
      ))}
      
      {/* Small daisies */}
      {[50, 130, 250, 350].map((x, i) => (
        <g key={i} transform={`translate(${x}, 85)`}>
          <circle cx="0" cy="0" r="3" fill="#F1C40F" opacity="0.9" />
          {[0, 60, 120, 180, 240, 300].map((angle, j) => (
            <ellipse key={j} 
              cx={Math.cos(angle * Math.PI / 180) * 5} 
              cy={Math.sin(angle * Math.PI / 180) * 5}
              rx="2" ry="4" fill="white" opacity="0.8"
              transform={`rotate(${angle} ${Math.cos(angle * Math.PI / 180) * 5} ${Math.sin(angle * Math.PI / 180) * 5})`}
            />
          ))}
        </g>
      ))}
    </g>
  );
}

function BabyGround({ isDark }: { isDark: boolean }) {
  const cloudColor = isDark ? '#C5BEB4' : '#FFFFFF';
  const starColor = isDark ? '#F1C40F' : '#FFD700';
  
  return (
    <g>
      {/* Soft clouds */}
      {[50, 200, 350].map((x, i) => (
        <g key={i} transform={`translate(${x}, ${80 + i * 5})`}>
          <ellipse cx="0" cy="0" rx="30" ry="15" fill={cloudColor} opacity="0.6" />
          <ellipse cx="-20" cy="-5" rx="20" ry="12" fill={cloudColor} opacity="0.5" />
          <ellipse cx="20" cy="-5" rx="20" ry="12" fill={cloudColor} opacity="0.5" />
          <ellipse cx="0" cy="-10" rx="15" ry="10" fill={cloudColor} opacity="0.55" />
        </g>
      ))}
      
      {/* Stars */}
      {[80, 150, 250, 320].map((x, i) => (
        <g key={i} transform={`translate(${x}, ${30 + (i % 3) * 15})`}>
          <path 
            d="M0 -8 L2 -2 L8 -2 L3 2 L5 8 L0 4 L-5 8 L-3 2 L-8 -2 L-2 -2 Z" 
            fill={starColor} 
            opacity={0.6 + (i % 3) * 0.1}
          />
        </g>
      ))}
      
      {/* Moon */}
      <g transform="translate(380, 40)">
        <circle cx="0" cy="0" r="20" fill={isDark ? '#F5F0E8' : '#FFF8DC'} opacity="0.8" />
        <circle cx="8" cy="-2" r="15" fill={isDark ? '#1A1714' : '#FAF8F5'} opacity="1" />
      </g>
    </g>
  );
}

function HalloweenGround({ isDark }: { isDark: boolean }) {
  const groundColor = isDark ? '#2D2520' : '#4A3C31';
  const pumpkinColor = '#E67E22';
  
  return (
    <g>
      {/* Spooky ground */}
      <rect x="0" y="95" width="400" height="25" fill={groundColor} opacity="0.7" />
      
      {/* Dead grass / spiky plants */}
      {Array.from({ length: 40 }).map((_, i) => (
        <path
          key={i}
          d={`M${i * 10} 95 L${i * 10 + 2} ${75 + (i % 5) * 5} L${i * 10 + 4} 95`}
          stroke={isDark ? '#4A3C31' : '#6B5C4D'}
          strokeWidth="1.5"
          fill="none"
          opacity="0.7"
        />
      ))}
      
      {/* Twisted dead trees */}
      {[60, 340].map((x, i) => (
        <g key={i} transform={`translate(${x}, 50)`}>
          <path 
            d={`M0 45 Q${i ? 5 : -5} 30 0 20 Q${i ? -8 : 8} 10 ${i ? 5 : -5} 0`} 
            stroke={groundColor} 
            strokeWidth="8" 
            fill="none" 
          />
          <path 
            d={`M0 25 Q${i ? 15 : -15} 15 ${i ? 20 : -20} 20`} 
            stroke={groundColor} 
            strokeWidth="4" 
            fill="none" 
          />
          <path 
            d={`M0 35 Q${i ? -10 : 10} 28 ${i ? -15 : 15} 30`} 
            stroke={groundColor} 
            strokeWidth="3" 
            fill="none" 
          />
        </g>
      ))}
      
      {/* Tombstones */}
      {[120, 200, 280].map((x, i) => (
        <g key={i} transform={`translate(${x}, 70)`}>
          <path 
            d={`M-12 25 L-12 5 Q-12 -5 0 -5 Q12 -5 12 5 L12 25 Z`} 
            fill={isDark ? '#4A4540' : '#6B6560'} 
            opacity="0.8" 
          />
          {i === 1 && <path d="M0 0 L0 10 M-5 5 L5 5" stroke={isDark ? '#6B6560' : '#8A857F'} strokeWidth="2" />}
        </g>
      ))}
      
      {/* Pumpkins */}
      {[170, 250].map((x, i) => (
        <g key={i} transform={`translate(${x}, 90)`}>
          <ellipse cx="0" cy="0" rx="12" ry="10" fill={pumpkinColor} opacity="0.9" />
          <ellipse cx="-6" cy="0" rx="5" ry="8" fill={pumpkinColor} opacity="0.7" />
          <ellipse cx="6" cy="0" rx="5" ry="8" fill={pumpkinColor} opacity="0.7" />
          <rect x="-2" y="-12" width="4" height="5" rx="1" fill="#228B22" />
        </g>
      ))}
    </g>
  );
}

function HanukkahGround({ isDark }: { isDark: boolean }) {
  const tableColor = isDark ? '#4A4540' : '#8B7355';
  const candleColor = isDark ? '#5DADE2' : '#1E5AA8';
  
  return (
    <g>
      {/* Table surface */}
      <rect x="100" y="85" width="200" height="8" rx="2" fill={tableColor} opacity="0.8" />
      
      {/* Menorah base */}
      <rect x="175" y="75" width="50" height="10" rx="2" fill="#C9B037" opacity="0.9" />
      
      {/* Menorah branches and candles */}
      {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((pos, i) => {
        const isCenter = pos === 0;
        const height = isCenter ? 40 : 30;
        const x = 200 + pos * 10;
        const y = isCenter ? 35 : 45;
        
        return (
          <g key={i}>
            {/* Branch */}
            <rect x={x - 1.5} y={y} width="3" height={75 - y} fill="#C9B037" opacity="0.85" />
            {/* Candle */}
            <rect x={x - 3} y={y - height} width="6" height={height} rx="1" fill={candleColor} opacity="0.9" />
            {/* Flame */}
            <ellipse cx={x} cy={y - height - 6} rx="3" ry="5" fill="#FFD700" opacity="0.9" />
            <ellipse cx={x} cy={y - height - 8} rx="1.5" ry="3" fill="#FFF" opacity="0.6" />
          </g>
        );
      })}
      
      {/* Stars of David decoration */}
      {[50, 350].map((x, i) => (
        <g key={i} transform={`translate(${x}, 60)`}>
          <polygon points="0,-12 10,6 -10,6" fill="none" stroke="#C9B037" strokeWidth="2" opacity="0.6" />
          <polygon points="0,12 10,-6 -10,-6" fill="none" stroke="#C9B037" strokeWidth="2" opacity="0.6" />
        </g>
      ))}
    </g>
  );
}

function GraduationGround({ isDark }: { isDark: boolean }) {
  const groundColor = isDark ? '#2D2D2D' : '#E8E4DD';
  const capColor = isDark ? '#1A1D24' : '#2C3E50';
  
  return (
    <g>
      {/* Stage / platform */}
      <rect x="0" y="95" width="400" height="25" fill={groundColor} opacity="0.8" />
      <rect x="50" y="85" width="300" height="12" rx="2" fill={isDark ? '#3D3935' : '#B8B4AE'} opacity="0.7" />
      
      {/* Graduation caps in the air */}
      {[80, 160, 240, 320].map((x, i) => (
        <g key={i} transform={`translate(${x}, ${40 + (i % 3) * 10}) rotate(${-15 + i * 10})`}>
          <polygon points="0,-5 -20,5 0,8 20,5" fill={capColor} opacity="0.85" />
          <rect x="-3" y="-8" width="6" height="5" fill={capColor} opacity="0.9" />
          <line x1="0" y1="8" x2="15" y2="20" stroke={capColor} strokeWidth="1.5" />
          <circle cx="15" cy="22" r="3" fill="#C9B037" />
        </g>
      ))}
      
      {/* Diploma scrolls */}
      {[120, 280].map((x, i) => (
        <g key={i} transform={`translate(${x}, 75) rotate(${-10 + i * 20})`}>
          <rect x="-15" y="-5" width="30" height="10" rx="3" fill="#FAEBD7" stroke="#C9B037" strokeWidth="1" opacity="0.9" />
          <ellipse cx="-15" cy="0" rx="3" ry="5" fill="#FAEBD7" stroke="#C9B037" strokeWidth="1" />
          <ellipse cx="15" cy="0" rx="3" ry="5" fill="#FAEBD7" stroke="#C9B037" strokeWidth="1" />
        </g>
      ))}
      
      {/* Confetti */}
      {Array.from({ length: 25 }).map((_, i) => (
        <rect key={i} 
          x={(i * 16 + 10) % 400} y={60 + (i % 5) * 8} 
          width="4" height="6" rx="1" 
          fill={['#C9B037', '#1E5AA8', '#C41E3A', '#228B22'][i % 4]} 
          opacity="0.6" 
          transform={`rotate(${(i * 40) % 180} ${(i * 16 + 12) % 400} ${63 + (i % 5) * 8})`} 
        />
      ))}
    </g>
  );
}
