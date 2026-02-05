module.exports = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        background: '#050101', // Page Background - Deepest charcoal-red
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: '#120505', // Card Background - Dark maroon-tinted grey
          foreground: '#B0A4A4' // Body Text - Muted Silver-Grey
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: '#FF073A', // Primary Accent - Neon Red
          foreground: '#FFFFFF' // Heading Text - Pure White
        },
        secondary: {
          DEFAULT: '#7A041B', // Secondary Accent - Muted Crimson
          foreground: '#FFFFFF' // Text on secondary
        },
        muted: {
          DEFAULT: '#120505', // Using Card Background as muted base
          foreground: '#B0A4A4' // Muted text
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: '#7A041B', // Using Secondary Accent as border
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 }
        }
      }
    }
  },
  plugins: []
};
