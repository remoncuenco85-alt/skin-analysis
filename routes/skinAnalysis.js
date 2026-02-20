const express = require('express');
const multer = require('multer');
const youcamService = require('../services/youcam');
const shopifyService = require('../services/shopify');
const { generateRecommendations, formatAnalysisResults } = require('../utils/recommendations');

const router = express.Router();

// Configure multer for file uploads (store in memory)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.match(/^image\/(jpeg|jpg|png)$/)) {
      return cb(new Error('Only JPEG and PNG images are allowed'), false);
    }
    cb(null, true);
  }
});

/**
 * POST /api/analyze-skin
 * Main endpoint for skin analysis
 * Accepts image file, analyzes with YouCam, generates recommendations from Shopify
 */
router.post('/analyze-skin', upload.single('image'), async (req, res) => {
  console.log('\n========================================');
  console.log('📸 New skin analysis request received');
  console.log('========================================');
  
  try {
    // Validate image upload
    if (!req.file) {
      console.error('❌ No image file provided');
      return res.status(400).json({ 
        error: 'No image provided',
        message: 'Please upload an image file' 
      });
    }

    console.log('📁 Image received:', {
      filename: req.file.originalname,
      size: `${(req.file.buffer.length / 1024).toFixed(2)} KB`,
      mimetype: req.file.mimetype
    });

    // Step 1: Analyze skin with YouCam API
    const fileName = `skin_analysis_${Date.now()}.png`;
    const analysisResults = await youcamService.analyzeSkin(
      req.file.buffer,
      fileName
    );

    // Step 2: Generate product recommendations based on analysis
    const skinConcerns = generateRecommendations(analysisResults);

    // Step 3: Fetch matching products from Shopify
    const products = await shopifyService.getProductsByTags(skinConcerns);

    // Step 4: Format response
    const formattedAnalysis = formatAnalysisResults(analysisResults);

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      analysis: {
        raw: analysisResults,
        formatted: formattedAnalysis
      },
      concerns: skinConcerns,
      recommendations: products,
      summary: {
        totalConcerns: skinConcerns.length,
        totalProducts: products.length,
        topConcern: skinConcerns[0]?.displayName || 'None',
        topConcernScore: skinConcerns[0]?.score || 100
      }
    };

    console.log('\n✅ Analysis complete!');
    console.log('📊 Summary:', {
      concerns: skinConcerns.length,
      products: products.length
    });
    console.log('========================================\n');

    res.json(response);

  } catch (error) {
    console.error('\n❌ Analysis failed:', error.message);
    console.error('Stack:', error.stack);
    console.log('========================================\n');

    // Send appropriate error response
    const statusCode = error.message.includes('unauthorized') ? 401 : 500;
    
    res.status(statusCode).json({ 
      error: 'Analysis failed', 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /api/test
 * Test endpoint to verify API is working
 */
router.get('/test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    endpoints: {
      analyzeSkin: 'POST /api/analyze-skin',
      test: 'GET /api/test'
    },
    configuration: {
      youcamConfigured: !!process.env.YOUCAM_API_KEY,
      shopifyConfigured: !!(process.env.SHOPIFY_STORE_URL && process.env.SHOPIFY_ACCESS_TOKEN)
    }
  });
});

/**
 * Error handler for multer
 */
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Image must be less than 10MB'
      });
    }
  }
  next(error);
});

module.exports = router;
