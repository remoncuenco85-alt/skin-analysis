# YouCam Skin Analysis + Shopify Integration

Complete backend server for AI-powered skin analysis with personalized Shopify product recommendations.

## 📋 What's Included

```
youcam-shopify-backend/
├── server.js                    # Main Express server
├── package.json                 # Dependencies
├── .env.example                 # Environment variables template
├── routes/
│   └── skinAnalysis.js         # API route handlers
├── services/
│   ├── youcam.js               # YouCam API integration
│   └── shopify.js              # Shopify API integration
├── utils/
│   └── recommendations.js      # Recommendation logic
└── public/
    ├── index.html              # Frontend interface
    └── js/
        └── camera-integration.js  # Camera Kit integration
```

## 🚀 Quick Start Guide

### Step 1: Get Your API Keys

#### YouCam API Key
1. Contact Perfect Corp to get your YouCam API key
2. Website: https://www.perfectcorp.com/business

#### Shopify Access Token
1. Log into your Shopify Admin
2. Go to: Apps → Develop apps → Create an app
3. Name it "Skin Analysis Integration"
4. Configure Admin API scopes:
   - `read_products`
   - `write_products` (optional)
5. Install app and copy the "Admin API access token"

### Step 2: Download and Setup Project

1. **Download the project folder** to your computer

2. **Open Terminal/Command Prompt** and navigate to the folder:
   ```bash
   cd path/to/youcam-shopify-backend
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

### Step 3: Configure Environment Variables

1. **Copy `.env.example` to `.env`**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** and add your credentials:
   ```
   YOUCAM_API_KEY=your_actual_youcam_api_key
   SHOPIFY_STORE_URL=your-store.myshopify.com
   SHOPIFY_ACCESS_TOKEN=your_actual_shopify_token
   PORT=3000
   ```

### Step 4: Tag Your Shopify Products

Your products MUST have relevant tags for recommendations to work!

**Example Product Tags:**
- Anti-Aging Serum → `anti-aging`, `retinol`, `wrinkle-cream`, `peptides`
- Acne Treatment → `acne-treatment`, `salicylic-acid`, `blemish-control`
- Moisturizer → `hydrating`, `moisturizer`, `hyaluronic-acid`, `ceramides`
- Vitamin C Serum → `brightening`, `vitamin-c`, `dark-spot-corrector`

**How to tag products:**
1. Shopify Admin → Products → Select a product
2. Scroll to "Tags" section
3. Add comma-separated tags
4. Save

### Step 5: Start the Server

```bash
npm start
```

You should see:
```
🚀 Server running on port 3000
📍 Environment: development
🔗 Access at: http://localhost:3000
```

### Step 6: Test It!

1. Open browser to `http://localhost:3000`
2. Click "Start Skin Analysis"
3. Allow camera access
4. Take a photo
5. Wait for analysis (20-30 seconds)
6. View your results and product recommendations!

## 🧪 Testing the API

### Test endpoint:
```bash
curl http://localhost:3000/api/test
```

Should return:
```json
{
  "message": "API is working!",
  "configuration": {
    "youcamConfigured": true,
    "shopifyConfigured": true
  }
}
```

## 📝 API Endpoints

### POST `/api/analyze-skin`
Upload image for skin analysis

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `image` file field

**Response:**
```json
{
  "success": true,
  "analysis": { ... },
  "concerns": [
    {
      "displayName": "Fine Lines & Wrinkles",
      "score": 65,
      "severity": "medium",
      "productTags": ["anti-aging", "retinol", "wrinkle-cream"]
    }
  ],
  "recommendations": [
    {
      "title": "Anti-Aging Serum",
      "price": 49.99,
      "url": "https://your-store.myshopify.com/products/...",
      "matchedConcern": "Fine Lines & Wrinkles"
    }
  ]
}
```

### GET `/api/test`
Health check endpoint

## 🐛 Troubleshooting

### Camera not working
- ✅ Make sure you're using HTTPS (or localhost)
- ✅ Check browser permissions for camera
- ✅ Try a different browser (Chrome/Firefox recommended)

### "500 Server Error" from YouCam
- ✅ Verify image was uploaded in Step 2 of API workflow
- ✅ Check image meets size requirements (HD: short side ≥ 1080px)
- ✅ Verify API key is correct

### No products returned
- ✅ Check products have correct tags in Shopify
- ✅ Verify Shopify credentials in .env
- ✅ Test Shopify connection with `/api/test` endpoint

### "InvalidParameters" error
- ✅ Don't mix HD and SD dst_actions
- ✅ All parameters should be either `hd_*` or non-hd

## 🚢 Deploying to Production

### Option 1: Heroku (Recommended for beginners)

1. **Install Heroku CLI**: https://devcenter.heroku.com/articles/heroku-cli

2. **Login to Heroku**:
   ```bash
   heroku login
   ```

3. **Create app**:
   ```bash
   heroku create your-app-name
   ```

4. **Set environment variables**:
   ```bash
   heroku config:set YOUCAM_API_KEY=your_key
   heroku config:set SHOPIFY_STORE_URL=your-store.myshopify.com
   heroku config:set SHOPIFY_ACCESS_TOKEN=your_token
   ```

5. **Deploy**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

6. **Open app**:
   ```bash
   heroku open
   ```

### Option 2: DigitalOcean, AWS, or other VPS

1. Set up Node.js 18+ on your server
2. Upload project files
3. Create `.env` file with credentials
4. Install dependencies: `npm install`
5. Use PM2 to keep server running:
   ```bash
   npm install -g pm2
   pm2 start server.js --name youcam-api
   pm2 save
   ```
6. Configure Nginx as reverse proxy (optional)
7. Set up SSL certificate with Let's Encrypt

## 🔗 Integrating with Shopify Store

Once deployed, add this to your Shopify theme:

### Option A: Custom Page Template

1. Shopify Admin → Online Store → Themes → Actions → Edit code
2. Create `templates/page.skin-analysis.liquid`
3. Add this code:

```html
<div id="skin-analysis-app">
  <iframe 
    src="https://your-backend-url.herokuapp.com" 
    style="width:100%; height:800px; border:none;">
  </iframe>
</div>
```

4. Create new page in Shopify, assign template

### Option B: Embed in Existing Page

Add iframe code to any page using HTML block in page editor.

## 📊 Skin Concerns Detected

The system analyzes these skin concerns:

| Concern | Threshold | Product Tags |
|---------|-----------|--------------|
| Fine Lines & Wrinkles | 70 | anti-aging, retinol, wrinkle-cream, peptides |
| Acne & Blemishes | 75 | acne-treatment, salicylic-acid, spot-treatment |
| Enlarged Pores | 70 | pore-minimizer, niacinamide, clay-mask |
| Dry Skin | 65 | hydrating, moisturizer, hyaluronic-acid |
| Oily Skin | 60 | oil-control, mattifying, sebum-regulator |
| Redness | 70 | soothing, anti-redness, calming |
| Dull Skin | 65 | brightening, vitamin-c, glow |
| Dark Spots | 70 | dark-spot-corrector, vitamin-c |
| Dark Circles | 70 | eye-cream, dark-circle, caffeine |
| Loss of Firmness | 65 | firming, lifting, collagen-boost |

## 🎨 Customization

### Change Detected Concerns
Edit `utils/recommendations.js` → `SKIN_CONCERN_MAPPING`

### Modify Thresholds
Adjust threshold values in `SKIN_CONCERN_MAPPING` (lower = more sensitive)

### Change UI Colors
Edit `public/index.html` → `<style>` section

### Add More Product Tags
Add tags to `productTags` array in `SKIN_CONCERN_MAPPING`

## 📚 Additional Resources

- **YouCam API Docs**: Contact Perfect Corp support
- **Shopify API Docs**: https://shopify.dev/docs
- **Camera Kit SDK**: https://plugins-media.makeupar.com/v2.2-camera-kit/sdk.js

## 🆘 Support

If you encounter issues:

1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test `/api/test` endpoint to verify configuration
4. Review error messages in terminal where server is running

## 📄 License

MIT License - Feel free to modify and use for your project!

---

**Made with ❤️ for beautiful skin and great shopping experiences**
