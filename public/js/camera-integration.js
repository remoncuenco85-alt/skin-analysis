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
      faceDetectionMode: 'skincare',
      imageFormat: 'base64',
      language: 'enu',
      width: 640,
      height: 800
    });
    
    YMK.openCameraKit();
    
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
    displaySkinReport(data);
    
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
 * Display comprehensive skin report
 */
function displaySkinReport(data) {
  const resultsDiv = document.getElementById('results');
  
  // Extract analysis data
  const analysis = data.analysis.raw;
  const concerns = data.concerns || [];
  const products = data.recommendations || [];
  
  // Calculate overall score
  const allScores = analysis.output.map(item => item.ui_score);
  const overallScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
  
  // Get skin age if available
  let skinAge = 'N/A';
  const skinAgeData = analysis.output.find(item => item.type === 'skin_age');
  if (skinAgeData) {
    skinAge = skinAgeData.value || skinAgeData.ui_score;
  }
  
  let html = `
    <div class="skin-report">
      <div class="report-header">
        <h2>YOUR SKIN REPORT</h2>
        ${skinAge !== 'N/A' ? `<div class="skin-age-badge">🎂 Skin Age: ${skinAge}</div>` : ''}
        <div class="overall-score">${overallScore}</div>
        <p style="color: #666; font-size: 1.2em;">Overall Skin Score</p>
      </div>

      ${concerns.length > 0 ? `
        <div class="concerns-alert">
          <h3>⚠️ Areas Needing Attention (${concerns.length})</h3>
          ${concerns.map(c => `<span class="concern-tag">${c.displayName}: ${c.score}/100</span>`).join('')}
        </div>
      ` : ''}

      <div class="report-grid">
        <div class="radar-section">
          <h3>📊 Skin Score Matrix</h3>
          <div class="chart-container">
            <canvas id="radarChart"></canvas>
          </div>
        </div>

        <div class="scores-section">
          <h3>📈 Detailed Scores</h3>
          ${generateScoresList(analysis.output)}
        </div>
      </div>
    </div>
  `;
  
  // Add product recommendations if available
  if (products.length > 0) {
    html += `
      <div class="products-section">
        <h2>🛍️ Recommended Products for You</h2>
        <div class="products-grid">
          ${products.map(product => `
            <div class="product-card">
              ${product.image ? 
                `<img src="${product.image}" alt="${product.imageAlt}" class="product-image">` :
                `<div class="product-image"></div>`
              }
              <div class="product-info">
                <div class="product-title">${product.title}</div>
                <div class="product-price">$${product.price.toFixed(2)} ${product.currency}</div>
                <div class="product-concern">${product.matchedConcern}</div>
                <a href="${product.url}" target="_blank" class="product-button">
                  View Product →
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  html += `
    <div class="powered-by">
      Powered by Perfect Corp AI Technology
    </div>
  `;
  
  resultsDiv.innerHTML = html;
  
  // Create radar chart
  createRadarChart(analysis.output);
  
  // Scroll to results
  resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Generate scores list HTML
 */
function generateScoresList(output) {
  const scoreNames = {
    'wrinkle': 'Wrinkles',
    'pore': 'Pores',
    'texture': 'Texture',
    'acne': 'Acne',
    'oiliness': 'Oiliness',
    'radiance': 'Radiance',
    'moisture': 'Moisture',
    'redness': 'Redness',
    'age_spot': 'Age Spots',
    'dark_circle_v2': 'Dark Circles',
    'firmness': 'Firmness',
    'eye_bag': 'Eye Bags',
    'droopy_upper_eyelid': 'Upper Eyelid',
    'droopy_lower_eyelid': 'Lower Eyelid'
  };
  
  return output
    .filter(item => scoreNames[item.type])
    .map(item => {
      const name = scoreNames[item.type];
      const score = item.ui_score;
      const severity = score >= 80 ? 'high' : score >= 65 ? 'medium' : 'low';
      
      return `
        <div class="score-item ${severity}">
          <span class="score-label">${name}</span>
          <div class="score-bar">
            <div class="score-bar-fill" style="width: ${score}%"></div>
          </div>
          <span class="score-value">${score}</span>
        </div>
      `;
    })
    .join('');
}

/**
 * Create radar chart visualization
 */
function createRadarChart(output) {
  const scoreNames = {
    'wrinkle': 'Wrinkles',
    'pore': 'Pores',
    'texture': 'Texture',
    'acne': 'Acne',
    'oiliness': 'Oiliness',
    'radiance': 'Radiance',
    'moisture': 'Moisture',
    'redness': 'Redness',
    'firmness': 'Firmness'
  };
  
  const labels = [];
  const scores = [];
  
  output.forEach(item => {
    if (scoreNames[item.type]) {
      labels.push(scoreNames[item.type]);
      scores.push(item.ui_score);
    }
  });
  
  const ctx = document.getElementById('radarChart');
  
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Your Skin Scores',
        data: scores,
        fill: true,
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        borderColor: 'rgb(102, 126, 234)',
        pointBackgroundColor: 'rgb(102, 126, 234)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(102, 126, 234)',
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
            font: {
              size: 12
            }
          },
          pointLabels: {
            font: {
              size: 13,
              weight: 'bold'
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
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
