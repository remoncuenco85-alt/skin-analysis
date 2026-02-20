// Load Camera Kit SDK
window.addEventListener('load', function() {
  console.log('📦 Loading YouCam Camera Kit SDK...');
  
  (function(d) {
    const s = d.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = 'https://plugins-media.makeupar.com/v2.2-camera-kit/sdk.js';
    s.onload = () => console.log('✅ Camera Kit SDK loaded');
    s.onerror = () => console.error('❌ Failed to load Camera Kit SDK');
    d.getElementsByTagName('script')[0].parentNode.insertBefore(s, null);
  })(document);
});

// Initialize Camera Kit when SDK loads
window.ymkAsyncInit = function() {
  console.log('🎬 Initializing Camera Kit...');
  
  YMK.addEventListener('loaded', function() {
    console.log('✅ Camera Kit ready');
  });

  YMK.addEventListener('faceDetectionCaptured', async function(result) {
    console.log('📸 Photo captured!');
    await handleCapturedImage(result);
  });

  YMK.addEventListener('cameraFailed', function(error) {
    console.error('❌ Camera failed:', error);
    displayError('Camera access denied. Please allow camera permissions and refresh the page.');
  });
};

/**
 * Start the skin analysis process
 */
function startAnalysis() {
  console.log('🚀 Starting analysis...');
  
  const button = document.querySelector('.start-button');
  button.disabled = true;
  button.textContent = '⏳ Opening Camera...';

  try {
    YMK.init({
      faceDetectionMode: 'skincare',  // Use HD for better quality
      imageFormat: 'base64',
      language: 'enu',
      width: 400,
      height: 500
    });
    
    YMK.openCameraKit();
    
    // Re-enable button after camera opens
    setTimeout(() => {
      button.disabled = false;
      button.textContent = '🎥 Start Skin Analysis';
    }, 2000);
    
  } catch (error) {
    console.error('❌ Failed to start camera:', error);
    displayError('Failed to start camera. Please make sure you\'re using HTTPS and have granted camera permissions.');
    button.disabled = false;
    button.textContent = '🎥 Start Skin Analysis';
  }
}

/**
 * Handle captured image and send to backend
 */
async function handleCapturedImage(result) {
  console.log('🔄 Processing captured image...');
  
  const capturedImage = result.images[0].image;
  
  // Show loading state
  displayLoading();
  
  try {
    // Convert base64 to blob
    const blob = await fetch(capturedImage).then(r => r.blob());
    
    // Create form data
    const formData = new FormData();
    formData.append('image', blob, 'skin_analysis.png');
    
    console.log('📤 Sending image to backend for analysis...');
    
    // Send to backend
    const response = await fetch('/api/analyze-skin', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Analysis failed');
    }
    
    const data = await response.json();
    console.log('✅ Analysis complete!', data);
    
    // Display results
    displayResults(data);
    
  } catch (error) {
    console.error('❌ Analysis error:', error);
    displayError(`Analysis failed: ${error.message}`);
  }
}

/**
 * Display loading state
 */
function displayLoading() {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = `
    <div class="loading">
      <h2>🔬 Analyzing Your Skin</h2>
      <p>This may take up to 30 seconds</p>
    </div>
  `;
}

/**
 * Display analysis results
 */
function displayResults(data) {
  const resultsDiv = document.getElementById('results');
  
  let html = `
    <div class="results-container">
      <div class="results-header">
        <h2>📊 Your Skin Analysis Results</h2>
        <p>${data.summary.totalConcerns} area${data.summary.totalConcerns !== 1 ? 's' : ''} need attention</p>
      </div>
  `;
  
  // Display skin concerns
  if (data.concerns && data.concerns.length > 0) {
    html += `<div class="concerns-grid">`;
    
    data.concerns.forEach(concern => {
      html += `
        <div class="concern-card ${concern.severity}-severity">
          <h3>${concern.displayName}</h3>
          <div class="concern-score">${concern.score}/100</div>
          <p><strong>Severity:</strong> ${concern.severity.toUpperCase()}</p>
        </div>
      `;
    });
    
    html += `</div>`;
  }
  
  // Display product recommendations
  if (data.recommendations && data.recommendations.length > 0) {
    html += `
      <div class="products-section">
        <h2>🛍️ Recommended Products for You</h2>
        <div class="products-grid">
    `;
    
    data.recommendations.forEach(product => {
      html += `
        <div class="product-card">
          ${product.image ? 
            `<img src="${product.image}" alt="${product.imageAlt}" class="product-image">` :
            `<div class="product-image"></div>`
          }
          <div class="product-info">
            <div class="product-title">${product.title}</div>
            <div class="product-price">$${product.price.toFixed(2)} ${product.currency}</div>
            <div class="product-tag">${product.matchedConcern}</div>
            <a href="${product.url}" target="_blank" class="product-button">
              View Product →
            </a>
          </div>
        </div>
      `;
    });
    
    html += `
        </div>
      </div>
    `;
  } else {
    html += `
      <div style="text-align: center; padding: 40px;">
        <p style="font-size: 1.2em; color: #666;">
          No product recommendations available. Make sure your Shopify products are properly tagged.
        </p>
      </div>
    `;
  }
  
  html += `</div>`;
  
  resultsDiv.innerHTML = html;
  
  // Scroll to results
  resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Display error message
 */
function displayError(message) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = `
    <div class="error">
      <h3>❌ Error</h3>
      <p>${message}</p>
      <p style="margin-top: 10px;">
        <button class="start-button" onclick="location.reload()">
          Try Again
        </button>
      </p>
    </div>
  `;
}
