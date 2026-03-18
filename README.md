# Tutu & Co

Premium organic pet apparel and accessories.

## Features

- **Organic Comfort**: Ethically sourced materials for your pet's well-being.
- **Modern Design**: Minimalist and functional aesthetics.
- **E-commerce Engine**: Integrated cart, coupon system, and multi-step checkout with real-time shipping calculations.
- **Admin Intelligence**: Comprehensive dashboard with inventory management, order tracking, and sales analytics.
- **HeroShot Gallery**: High-quality showcase of the Tutu & Co lifestyle.
- **Interactive Support**: Built-in help chatbot for sizing, shipping, and returns.

## Tech Stack

- **React** (Vite)
- **Tailwind CSS**
- **Framer Motion**
- **Lucide Icons**
- **Recharts** (Data Visualization)
- **LocalStorage** (Data Persistence)

## Recent Updates

- **Integrated E-commerce CMS**: Powerful admin dashboard for real-time product management, banner configuration, and media library uploads.
- **Earthy Aesthetic Overhaul**: Premium color palette (`#F4F1EA`, `#CD664D`, `#9FA993`, `#3E362E`) applied globally for a modern, natural feel.
- **Gallery Intelligence**: Optimized 10-image unique shuffling gallery for a varied and premium homepage presence.
- **Mock API Architecture**: Full data persistence via `localStorage` simulating a robust cloud-ready backend.
- **Operational Automation**: On-the-fly generation of tax invoices and shipping labels during checkout.

## Deployment

### Backend (Railway)
1.  Connect your GitHub repo to **Railway**.
2.  In **Settings > General**, set the **Root Directory** to `server`.
3.  In **Variables**, add:
    - `BLOB_READ_WRITE_TOKEN`: Your Vercel Blob token.
    - `PORT`: `3001` (default).
4.  (Optional) Add a **Railway Volume** mounted to `/app` for `data.json` persistence.

### Assets (Vercel Blob)
1.  Create a **Blob** store in Vercel Storage.
2.  Copy the `BLOB_READ_WRITE_TOKEN` to your Railway environment variables and local `.env` file.

### Frontend
- When deploying the frontend, ensure `VITE_API_URL` environment variable is set to your Railway app URL.

## Development

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
```
