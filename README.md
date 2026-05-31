# EcomSathi

> One Place for All Your Ecommerce Needs

EcomSathi is a production-ready SaaS platform providing free ecommerce utility tools and premium operations software for Indian ecommerce sellers.

## Features

### Free Tools (No Login Required)
- **SKU Tools**: Single/Bulk/Variant/Custom SKU generators, Barcode generator (EAN-13, Code 128, QR, UPC-A), Label generator & printer
- **PDF Tools**: Merge, Split, Compress, OCR, Rotate, Watermark, Page Numbers, and more (13 tools)
- **Image Tools**: Background Remover, Crop, Resize, Compress, Format Conversion, Product Optimizer (11 tools)
- **Video Tools**: Video to GIF, Compress, Convert, Resize, Frame Extractor, Thumbnail (6 tools)
- **Label Crop**: Auto-crop shipping labels for Amazon, Flipkart, Myntra, Meesho, AJIO, Nykaa, Snapdeal
- **GST Tools**: GSTIN Verification, HSN/SAC Search, GST Calculator, PAN Validation (10 tools)

### Premium Modules (Login Required)
- **Ecommerce Reconciliation**: Match orders to settlements for Amazon, Flipkart, Myntra, Meesho
- **Inventory Management**: Product master, multi-warehouse stock, purchase orders

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, TypeScript, Tailwind v4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Processing Backend | Node.js, Express, Sharp, FFmpeg, Tesseract, PDF-Lib |
| Processing Host | Railway |
| Frontend Host | Vercel |

## Quick Start

### Prerequisites
- Node.js 20+
- A Supabase project (free tier works)
- A Railway account (for processing backend)

### Frontend Setup
```bash
cd ecomsathi
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

### Backend Setup
```bash
cd backend-processing
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

### Database Setup
Run the SQL migrations in order:
```bash
# In Supabase SQL editor, run in order:
# 001_initial_schema.sql
# 002_rls_policies.sql
# 003_functions_triggers.sql
# 004_seed_data.sql
# 005_storage_buckets.sql
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full production deployment guide.

## Project Structure
```
ecomsathi/
├── src/
│   ├── components/common/     # Reusable UI components
│   ├── modules/               # Feature modules
│   │   ├── sku-tools/         # SKU generators (7 tools)
│   │   ├── pdf-tools/         # PDF tools (13 tools)
│   │   ├── image-tools/       # Image tools (11 tools)
│   │   ├── video-tools/       # Video tools (6 tools)
│   │   ├── gst-tools/         # GST tools (10 tools)
│   │   ├── label-crop/        # Label crop (7 marketplaces)
│   │   ├── reconciliation/    # Premium reconciliation module
│   │   └── inventory/         # Premium inventory module
│   ├── pages/                 # Page components
│   ├── services/              # Supabase service layer
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript types
│   ├── utils/                 # Utility functions
│   └── supabase/              # DB migrations + edge functions
├── backend-processing/        # Railway processing service
│   └── src/
│       ├── routes/            # Express route handlers
│       ├── services/          # PDF, Image, Video, OCR services
│       ├── middleware/        # Multer, validation
│       └── utils/             # File utilities
├── public/                    # Static assets
├── vercel.json                # Vercel configuration
└── DEPLOYMENT.md              # Deployment guide
```

## Environment Variables

See [.env.example](.env.example) for all required variables.

## License
MIT
