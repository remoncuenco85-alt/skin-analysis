const axios = require('axios');

const BASE_URL = 'https://yce-api-01.makeupar.com/s2s/v2.1';
const API_KEY = process.env.YOUCAM_API_KEY;

class YouCamService {
  /**
   * Upload file metadata and get pre-signed URL
   * @param {Buffer} fileBuffer - Image file buffer
   * @param {string} fileName - Name of the file
   * @returns {Promise<string>} - File ID for creating analysis task
   */
  async uploadFile(fileBuffer, fileName) {
    try {
      // Step 1: Get upload URL from File API
      const fileMetadata = {
        files: [{
          content_type: 'image/png',
          file_name: fileName,
          file_size: fileBuffer.length
        }]
      };

      console.log('📤 Requesting upload URL from YouCam...');
      
      const fileResponse = await axios.post(
        `${BASE_URL}/file/skin-analysis`,
        fileMetadata,
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const { file_id, requests } = fileResponse.data.data.files[0];
      const uploadUrl = requests[0].url;
      const uploadHeaders = requests[0].headers;

      console.log('✅ Upload URL received, file_id:', file_id);

      // Step 2: Upload actual file to pre-signed URL
      console.log('📤 Uploading file to S3...');
      
      await axios.put(uploadUrl, fileBuffer, {
        headers: uploadHeaders,
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });

      console.log('✅ File uploaded successfully');

      return file_id;
    } catch (error) {
      console.error('❌ File upload error:', error.response?.data || error.message);
      throw new Error(`File upload failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Create skin analysis task
   * @param {string} fileId - File ID from upload
   * @returns {Promise<string>} - Task ID for polling
   */
  async createAnalysisTask(fileId) {
    try {
      console.log('🔬 Creating analysis task...');
      
      const payload = {
        src_file_id: fileId,
        dst_actions: [
          'hd_wrinkle',
          'hd_acne'
          
        ],
        format: 'json',
        pf_camera_kit: true
      };

      const response = await axios.post(
        `${BASE_URL}/task/skin-analysis`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const taskId = response.data.data.task_id;
      console.log('✅ Analysis task created, task_id:', taskId);

      return taskId;
    } catch (error) {
      console.error('❌ Task creation error:', error.response?.data || error.message);
      throw new Error(`Task creation failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Poll task status until completion
   * @param {string} taskId - Task ID to poll
   * @param {number} maxAttempts - Maximum polling attempts (default: 30)
   * @returns {Promise<Object>} - Analysis results
   */
  async pollTaskStatus(taskId, maxAttempts = 30) {
    console.log('⏳ Polling task status...');
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await axios.get(
          `${BASE_URL}/task/skin-analysis/${taskId}`,
          {
            headers: {
              'Authorization': `Bearer ${API_KEY}`
            }
          }
        );

        const { task_status, results } = response.data.data;

        console.log(`📊 Poll attempt ${attempt}/${maxAttempts} - Status: ${task_status}`);

        if (task_status === 'success') {
          console.log('✅ Analysis completed successfully!');
          return results;
        } else if (task_status === 'error') {
          throw new Error('Analysis task failed on YouCam server');
        }

        // Wait 2 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        if (error.response?.status === 404) {
          console.error('❌ Task not found - check if task_id is correct');
        }
        throw error;
      }
    }

    throw new Error('Task polling timeout - analysis took too long');
  }

  /**
   * Complete skin analysis workflow
   * @param {Buffer} fileBuffer - Image file buffer
   * @param {string} fileName - Name of the file
   * @returns {Promise<Object>} - Analysis results
   */
  async analyzeSkin(fileBuffer, fileName) {
    console.log('\n🔍 Starting skin analysis workflow...');
    console.log('📁 File:', fileName, '- Size:', fileBuffer.length, 'bytes');
    
    try {
      // Step 1: Upload file
      const fileId = await this.uploadFile(fileBuffer, fileName);
      
      // Step 2: Create analysis task
      const taskId = await this.createAnalysisTask(fileId);
      
      // Step 3: Poll for results
      const results = await this.pollTaskStatus(taskId);
      
      console.log('✅ Skin analysis complete!\n');
      return results;
    } catch (error) {
      console.error('❌ Skin analysis failed:', error.message);
      throw error;
    }
  }
}

module.exports = new YouCamService();
