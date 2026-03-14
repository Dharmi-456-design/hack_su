/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        factory: {
          bg: '#0B1420',       // Main deep navy background
          panel: '#111C2D',    // Secondary panel background
          card: '#111C2D',     // Card background
          border: '#1F2F46',   // Darker borders for a modern look
          accent: '#00E5FF',   // Neon cyan accent
          green: '#00FF9C',    // Success / Safe
          amber: '#FFC857',    // Warning
          red: '#FF4D4D',      // Critical
          muted: '#A0B3C6',    // Muted text color
          text: '#FFFFFF',     // Primary text
          dim: '#A0B3C6',      // Secondary text / subtitles
        }
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'], // Updated to modern sans-serif
        body: ['Inter', 'sans-serif'],
        mono: ['Share Tech Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scan': 'scan 3s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00D4FF33' },
          '100%': { boxShadow: '0 0 20px #00D4FF88, 0 0 40px #00D4FF44' }
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' }
        }
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px)",
        'hex-pattern': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%2300D4FF' fill-opacity='0.03'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
