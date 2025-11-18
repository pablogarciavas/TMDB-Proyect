/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta principal inspirada en la imagen
        beige: {
          light: '#F5F0EB',
          DEFAULT: '#DDD0C8',
          medium: '#E8DFD5',
        },
        dark: {
          DEFAULT: '#323232',
          medium: '#5A5A5A',
          light: '#8A8A8A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      boxShadow: {
        'minimal': '0 1px 3px 0 rgba(50, 50, 50, 0.1)',
        'minimal-lg': '0 4px 6px -1px rgba(50, 50, 50, 0.1)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.6s ease-out',
        'fadeInUp': 'fadeInUp 0.6s ease-out',
        'fadeInDown': 'fadeInDown 0.6s ease-out',
        'slideInRight': 'slideInRight 0.6s ease-out',
        'scaleIn': 'scaleIn 0.4s ease-out',
      },
    },
  },
  plugins: [],
}

