/**
 * Mapping of skin concerns to product tags and priorities
 * Lower priority number = more important concern
 */
const SKIN_CONCERN_MAPPING = {
  hd_wrinkle: {
    threshold: 70,
    productTags: ['anti-aging', 'wrinkle-cream', 'retinol', 'peptides'],
    priority: 1,
    displayName: 'Fine Lines & Wrinkles'
  },
  hd_acne: {
    threshold: 75,
    productTags: ['acne-treatment', 'salicylic-acid', 'spot-treatment', 'blemish-control'],
    priority: 2,
    displayName: 'Acne & Blemishes'
  },
  hd_pore: {
    threshold: 70,
    productTags: ['pore-minimizer', 'niacinamide', 'clay-mask', 'exfoliant'],
    priority: 3,
    displayName: 'Enlarged Pores'
  },
  hd_moisture: {
    threshold: 65,
    productTags: ['hydrating', 'moisturizer', 'hyaluronic-acid', 'ceramides'],
    priority: 4,
    displayName: 'Dry Skin'
  },
  hd_oiliness: {
    threshold: 60,
    productTags: ['oil-control', 'mattifying', 'sebum-regulator'],
    priority: 5,
    displayName: 'Oily Skin'
  },
  hd_redness: {
    threshold: 70,
    productTags: ['soothing', 'anti-redness', 'calming', 'sensitive-skin'],
    priority: 6,
    displayName: 'Redness & Sensitivity'
  },
  hd_radiance: {
    threshold: 65,
    productTags: ['brightening', 'vitamin-c', 'glow', 'illuminating'],
    priority: 7,
    displayName: 'Dull Skin'
  },
  hd_age_spot: {
    threshold: 70,
    productTags: ['dark-spot-corrector', 'pigmentation', 'vitamin-c', 'alpha-arbutin'],
    priority: 8,
    displayName: 'Dark Spots & Hyperpigmentation'
  },
  hd_dark_circle: {
    threshold: 70,
    productTags: ['eye-cream', 'dark-circle', 'under-eye', 'caffeine'],
    priority: 9,
    displayName: 'Dark Circles'
  },
  hd_firmness: {
    threshold: 65,
    productTags: ['firming', 'lifting', 'elasticity', 'collagen-boost'],
    priority: 10,
    displayName: 'Loss of Firmness'
  },
  hd_texture: {
    threshold: 70,
    productTags: ['exfoliant', 'aha', 'bha', 'smooth-skin'],
    priority: 11,
    displayName: 'Uneven Texture'
  }
};

/**
 * Generate product recommendations based on skin analysis results
 * @param {Object} analysisResults - Results from YouCam API
 * @returns {Array} - Array of skin concerns with product tags
 */
function generateRecommendations(analysisResults) {
  console.log('\n💡 Generating product recommendations...');
  
  const concerns = [];

  // Check if results have the expected structure
  if (!analysisResults || !analysisResults.output) {
    console.warn('⚠️  Invalid analysis results structure');
    return concerns;
  }

  // Analyze each skin metric
  for (const result of analysisResults.output) {
    const mapping = SKIN_CONCERN_MAPPING[result.type];

    // Check if this metric needs attention (score below threshold)
    if (mapping && result.ui_score < mapping.threshold) {
      const concern = {
        type: result.type,
        displayName: mapping.displayName,
        score: result.ui_score,
        rawScore: result.raw_score,
        severity: calculateSeverity(result.ui_score, mapping.threshold),
        priority: mapping.priority,
        productTags: mapping.productTags
      };

      concerns.push(concern);
      
      console.log(
        `🔴 ${concern.displayName}: ${concern.score}/100 (${concern.severity} severity)`
      );
    }
  }

  // Sort by priority (most important concerns first)
  concerns.sort((a, b) => a.priority - b.priority);

  console.log(`✅ Found ${concerns.length} skin concerns to address\n`);

  return concerns;
}

/**
 * Calculate severity based on how far below threshold the score is
 * @param {number} score - UI score from analysis
 * @param {number} threshold - Threshold for concern
 * @returns {string} - Severity level: 'high', 'medium', or 'low'
 */
function calculateSeverity(score, threshold) {
  const gap = threshold - score;
  
  if (gap > 20) return 'high';
  if (gap > 10) return 'medium';
  return 'low';
}

/**
 * Format analysis results for display
 * @param {Object} analysisResults - Results from YouCam API
 * @returns {Object} - Formatted results
 */
function formatAnalysisResults(analysisResults) {
  if (!analysisResults || !analysisResults.output) {
    return {};
  }

  const formatted = {
    overall: {},
    skinAge: null,
    details: []
  };

  // Extract overall score and skin age
  for (const result of analysisResults.output) {
    if (result.type === 'all') {
      formatted.overall = {
        score: result.score,
        grade: getScoreGrade(result.score)
      };
    } else if (result.type === 'skin_age') {
      formatted.skinAge = result.value;
    } else {
      formatted.details.push({
        type: result.type,
        displayName: SKIN_CONCERN_MAPPING[result.type]?.displayName || result.type,
        uiScore: result.ui_score,
        rawScore: result.raw_score,
        grade: getScoreGrade(result.ui_score)
      });
    }
  }

  return formatted;
}

/**
 * Convert score to letter grade
 * @param {number} score - Score from 0-100
 * @returns {string} - Letter grade
 */
function getScoreGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

module.exports = {
  generateRecommendations,
  formatAnalysisResults,
  calculateSeverity,
  SKIN_CONCERN_MAPPING
};
