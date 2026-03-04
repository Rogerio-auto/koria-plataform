import type { Config } from 'tailwindcss';

/**
 * Base Tailwind CSS configuration for KorIA Platform.
 * Each app extends this config with its own content paths.
 */
const baseConfig: Partial<Config> = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // KorIA brand — verde da logo
        primary: {
          50: '#edfcf2',
          100: '#d4f7e0',
          200: '#acedC5',
          300: '#76dea4',
          400: '#45b649',
          500: '#3da142',
          600: '#2e8235',
          700: '#26682c',
          800: '#225326',
          900: '#1d4421',
          950: '#0c2613',
        },
        secondary: {
          50: '#f5f5f5',
          100: '#e8e8e8',
          200: '#d4d4d4',
          300: '#b0b0b0',
          400: '#8a8a8a',
          500: '#6b6b6b',
          600: '#555555',
          700: '#3a3a3a',
          800: '#2d2d2d',
          900: '#1a1a1a',
          950: '#0d0d0d',
        },
        success: {
          50: '#ebfbee',
          100: '#d3f9d8',
          200: '#b2f2bb',
          300: '#8ce99a',
          400: '#69db7c',
          500: '#51cf66',
          600: '#40c057',
          700: '#37b24d',
          800: '#2f9e44',
          900: '#2b8a3e',
          950: '#1e6f31',
        },
        warning: {
          50: '#fff9db',
          100: '#fff3bf',
          200: '#ffec99',
          300: '#ffe066',
          400: '#ffd43b',
          500: '#fcc419',
          600: '#fab005',
          700: '#f59f00',
          800: '#f08c00',
          900: '#e67700',
          950: '#cc6900',
        },
        error: {
          50: '#fff5f5',
          100: '#ffe3e3',
          200: '#ffc9c9',
          300: '#ffa8a8',
          400: '#ff8787',
          500: '#ff6b6b',
          600: '#fa5252',
          700: '#f03e3e',
          800: '#e03131',
          900: '#c92a2a',
          950: '#a51d1d',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        lg: '0.625rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
    },
  },
  plugins: [],
};

export default baseConfig;
