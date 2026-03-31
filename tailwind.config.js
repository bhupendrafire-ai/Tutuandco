/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                earth: '#95714F',
                moss: '#8C916C',
                sand: '#C7AF94',
                almond: '#EADED0',
                sage: '#ACB087',
                'brand-sage': '#c5d1c0',
                'brand-charcoal': '#2f2f2f',
                'brand-rose': '#d8b7b1',
                'brand-cream': '#e6dfd4',
                'brand-gray': '#868686',
            },
            fontFamily: {
                serif: ['Avenir Next Rounded Pro', 'serif'],
                sans: ['Avenir Next Rounded Pro', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
