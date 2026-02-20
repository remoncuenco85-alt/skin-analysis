# 🚀 QUICK START GUIDE

## What You Have

A complete backend server that:
- ✅ Captures photos using AI-powered Camera Kit
- ✅ Analyzes skin with YouCam API
- ✅ Recommends products from your Shopify store
- ✅ Ready to deploy!

## ⚡ 5-Minute Setup

### 1️⃣ Install Node.js (if you haven't)
Download from: https://nodejs.org/ (version 18 or higher)

### 2️⃣ Open Terminal/Command Prompt
- **Windows**: Press Win+R, type `cmd`, press Enter
- **Mac**: Press Cmd+Space, type `terminal`, press Enter

### 3️⃣ Navigate to this folder
```bash
cd path/to/youcam-shopify-backend
```

### 4️⃣ Install dependencies
```bash
npm install
```
Wait 1-2 minutes for installation to complete.

### 5️⃣ Configure your API keys

**Create a file named `.env` (copy from `.env.example`)**

Add your credentials:
```
YOUCAM_API_KEY=your_youcam_api_key_here
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_shopify_token_here
PORT=3000
```

**Where to get these:**
- YouCam API Key: Contact Perfect Corp (https://www.perfectcorp.com/business)
- Shopify Access Token: 
  1. Shopify Admin → Apps → "Develop apps"
  2. Create app → Configure Admin API
  3. Enable `read_products` scope
  4. Install app → Copy "Admin API access token"

### 6️⃣ Tag your Shopify products

**IMPORTANT**: Products must have tags!

Examples:
- Anti-aging cream → Add tags: `anti-aging`, `retinol`, `wrinkle-cream`
- Acne treatment → Add tags: `acne-treatment`, `salicylic-acid`
- Moisturizer → Add tags: `hydrating`, `moisturizer`, `hyaluronic-acid`

How to tag:
1. Shopify Admin → Products
2. Click product → Scroll to "Tags"
3. Add tags (comma-separated)
4. Save

### 7️⃣ Start the server
```bash
npm start
```

You'll see:
```
🚀 Server running on port 3000
🔗 Access at: http://localhost:3000
```

### 8️⃣ Test it!
1. Open browser: http://localhost:3000
2. Click "Start Skin Analysis"
3. Allow camera
4. Take photo
5. See results!

## ❓ Common Issues

**"Camera not working"**
- Use Chrome or Firefox browser
- Make sure you allowed camera permission
- Must use HTTPS (or localhost for testing)

**"No products returned"**
- Check your Shopify products have tags
- Verify `.env` file has correct Shopify credentials
- Test: http://localhost:3000/api/test

**"Analysis failed"**
- Verify YouCam API key in `.env` is correct
- Check image meets size requirements (HD: 1080px+ on short side)

## 🚀 Deploy to Internet (Heroku - FREE)

1. Create account: https://heroku.com
2. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
3. Run these commands:

```bash
heroku login
heroku create your-app-name
heroku config:set YOUCAM_API_KEY=your_key
heroku config:set SHOPIFY_STORE_URL=your-store.myshopify.com
heroku config:set SHOPIFY_ACCESS_TOKEN=your_token
git init
git add .
git commit -m "Deploy"
git push heroku main
heroku open
```

Your app is now live! 🎉

## 📖 Full Documentation

See `README.md` for complete documentation.

## 🆘 Need Help?

1. Check terminal logs for error messages
2. Test API: http://localhost:3000/api/test
3. Review README.md for detailed troubleshooting

---

**You're all set! Happy analyzing! 🎉**
