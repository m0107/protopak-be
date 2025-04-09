const axios = require("axios");
// const pandoraData = require("../data/protopak.json");
const PACDORA_BASE_URL = process.env.PACDORA_BASE_URL;

const headers = {
  appId: process.env.PACDORA_APP_ID,
  appKey: process.env.PACDORA_APP_KEY,
  "Content-Type": "application/json",
};

async function getCategories() {
  try {
    const response = await axios.get(PACDORA_BASE_URL + "/ctree");
    return response.data;
  } catch (error) {
    console.error("Error fetching external API data:", error.message);
    throw error;
  }
}

const PACDORA_URLS = {
  EXPORT_PDF: `${PACDORA_BASE_URL}/user/projects/export/pdf`,
  EXPORT_KNIFE: `${PACDORA_BASE_URL}/user/projects/export/knife`,
  EXPORT_AI: `${PACDORA_BASE_URL}/user/projects/export/ai`,
  EXPORT_DXF: `${PACDORA_BASE_URL}/user/projects/export/dxf`,
  UPLOAD_IMG: `${PACDORA_BASE_URL}/upload/img`,
  UPLOAD_IMG_BASE64: `${PACDORA_BASE_URL}/upload/img/base64`,
  DELETE_IMG: `${PACDORA_BASE_URL}/upload/img`,
  DELETE_PROJECTS: `${PACDORA_BASE_URL}/upload/projects`,
  BEHAVIOR_STATS: `${PACDORA_BASE_URL}/behavior/statistic`,
  DESIGN_AREA: (projectId) =>
    `${PACDORA_BASE_URL}/user/projects/${projectId}/design/area`,
  EXPORT_PDF_STATUS: (taskId) =>
    `${PACDORA_BASE_URL}/user/projects/export/pdf?taskId=${taskId}`,
  EXPORT_KNIFE_STATUS: (taskId) =>
    `${PACDORA_BASE_URL}/user/projects/export/knife?taskId=${taskId}`,
  WORKBENCH_TEMPLATES: `${PACDORA_BASE_URL}/open/v1/workbench/templates`, // duplicate /open/v1/open/v1/ was likely a typo
  USER_PROJECTS: `${PACDORA_BASE_URL}/user/projects`, // duplicate /open/v1/open/v1/ was likely a typo
};

async function getProductsList(categoryKey) {
  try {
    const response = await axios.get(
      PACDORA_BASE_URL +
        `/models?current=1&pageSize=50&mockupNameKey=${categoryKey}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching external API data:", error.message);
    throw error;
  }
}

async function updateUserBaseInfo({
  externalId,
  firstName,
  lastName,
  email,
  extra = {},
}) {
  try {
    const data = {
      externalId,
      firstName,
      lastName,
      email,
      ...extra,
    };

    try {
      const response = await axios.post(`${PACDORA_BASE_URL}/user_base`, data, {
        headers,
      });
      return response.data;
      /** "data": {
      "firstName":"",
      "lastName":"",
      "email":"",
      "extra":{},
      }, */
    } catch (error) {
      console.error("API request failed:", error.message);
      throw error;
    }
  } catch (error) {
    console.error("Error fetching external API data:", error.message);
    throw error;
  }
}

/**
 * Export projects as PDF from Pacdora API
 *
 * @param {Object} params
 * @param {string} params.appId - Your Pacdora app ID
 * @param {string} params.appKey - Your Pacdora app key
 * @param {number[]} params.projectIds - Array of project IDs (max 5)
 * @param {Object} [params.config] - Optional config for export
 * @param {string} [params.config.colorMode] - CMYK or RGB
 * @param {string} [params.config.bleedColor] - Hex code for bleed color
 * @param {string} [params.config.creaseColor] - Hex code for crease color
 * @param {string} [params.config.trimColor] - Hex code for trim color
 * @returns {Promise<Object>} - Response from the API
 */
async function exportProjectsAsPDF({ appId, appKey, projectIds, config = {} }) {
  const url = PACDORA_URLS.EXPORT_PDF;

  const headers = {
    appId,
    appKey,
    "Content-Type": "application/json",
  };

  const data = {
    projectIds,
    config,
  };

  try {
    const response = await axios.post(url, data, { headers });
    return response.data;
  } catch (error) {
    console.error("Export failed:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Export knife file from Pacdora API
 *
 * @param {Object} params
 * @param {number[]} params.projectIds - Array of project IDs (max 5)
 * @param {Object} [params.config] - Optional config (colorMode, bleedColor, etc.)
 * @returns {Promise<Object>} - Response from the API
 */
async function exportKnifeFile({ projectIds, config = {} }) {
  const data = {
    projectIds,
    config,
  };

  try {
    const response = await axios.post(
      PACDORA_URLS.PACDORA_KNIFE_EXPORT_URL,
      data,
      {
        headers,
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Knife export failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * Get status/result of a knife export task from Pacdora API
 *
 * @param {number} taskId - Task ID returned from the exportKnifeFile function
 * @returns {Promise<Object>} - API response with export status
 */
async function getKnifeExportStatus(taskId) {
  const url = `${PACDORA_URLS.PACDORA_KNIFE_EXPORT_STATUS_URL}?taskId=${taskId}`;

  try {
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch knife export status:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * Export AI (Adobe Illustrator) file from Pacdora API
 *
 * @param {Object} params
 * @param {number[]} params.projectIds - Array of project IDs (max 5)
 * @param {Object} [params.config] - Optional export config
 * @returns {Promise<Object>} - API response
 */
async function exportAiFile({ projectIds, config = {} }) {
  const data = {
    projectIds,
    config,
  };

  try {
    const response = await axios.post(
      PACDORA_URLS.PACDORA_AI_EXPORT_URL,
      data,
      {
        headers,
      }
    );
    return response.data;
  } catch (error) {
    console.error("AI export failed:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get PDF export task status from Pacdora API
 *
 * @param {number} taskId - Task ID from PDF export response
 * @returns {Promise<Object>} - API response with export status or file link
 */
async function getPdfExportStatus(taskId) {
  const url = `${PACDORA_URLS.PACDORA_PDF_EXPORT_STATUS_URL}?taskId=${taskId}`;

  try {
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error(
      "PDF export status check failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function exportDxfFile(projectId) {
  const data = {
    projectId,
  };

  try {
    const response = await axios.post(
      PACDORA_URLS.PACDORA_DXF_EXPORT_URL,
      data,
      {
        headers,
      }
    );
    return response.data;
  } catch (error) {
    console.error("DXF export failed:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Upload images to Pacdora
 *
 * @param {string} userId - Required user/client ID from your platform
 * @param {Array<{ url: string, name: string }>} imgs - Array of image data (max 10)
 * @returns {Promise<Object>} - API response
 */
async function uploadImages({ userId, imgs }) {
  if (!userId || !Array.isArray(imgs) || imgs.length === 0) {
    throw new Error("userId and imgs[] are required");
  }

  const data = {
    userId,
    imgs,
  };

  try {
    const response = await axios.post(
      PACDORA_URLS.PACDORA_IMAGE_UPLOAD_URL,
      data,
      {
        headers,
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Image upload failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * Upload Base64-encoded images to Pacdora
 *
 * @param {string} userId - Your platform's client/user ID
 * @param {Array<{ base64: string, name: string }>} imgs - Array of base64 images (max 5)
 * @returns {Promise<Object>} - API response
 */
async function uploadBase64Images({ userId, imgs }) {
  if (!userId || !Array.isArray(imgs) || imgs.length === 0) {
    throw new Error("userId and imgs[] are required");
  }

  if (imgs.length > 5) {
    throw new Error("Maximum 5 images allowed per request");
  }

  const data = {
    userId,
    imgs,
  };

  try {
    const response = await axios.post(
      PACDORA_URLS.PACDORA_IMAGE_UPLOAD_BASE64_URL,
      data,
      {
        headers,
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Base64 image upload failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * Delete uploaded images from Pacdora
 *
 * @param {number[]} ids - Array of image IDs (max 10)
 * @returns {Promise<Object>} - API response
 */
async function deleteUploadedImages(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("At least one image ID is required");
  }

  if (ids.length > 10) {
    throw new Error("Maximum 10 image IDs allowed per request");
  }

  const data = {
    ids,
  };

  try {
    const response = await axios.delete(PACDORA_URLS.PACDORA_IMAGE_DELETE_URL, {
      headers,
      data,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Image delete failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * Get user behavior statistics from Pacdora
 *
 * @param {number} startTime - Timestamp (milliseconds or seconds, as per API spec)
 * @param {number} endTime - Timestamp
 * @returns {Promise<Object>} - API response
 */
async function getBehaviorStatistics(startTime, endTime) {
  const url = `${PACDORA_URLS.PACDORA_BEHAVIOR_STATS_URL}?startTime=${startTime}&endTime=${endTime}`;

  try {
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error(
      "Fetching behavior statistics failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * Delete uploaded projects from Pacdora
 *
 * @param {number[]} projectIds - Array of project IDs (max 10)
 * @returns {Promise<Object>} - API response
 */
async function deleteUploadedProjects(projectIds) {
  if (!Array.isArray(projectIds) || projectIds.length === 0) {
    throw new Error("At least one project ID is required");
  }

  if (projectIds.length > 10) {
    throw new Error("Maximum 10 project IDs allowed per request");
  }

  const data = { projectIds };

  try {
    const response = await axios.delete(
      PACDORA_URLS.PACDORA_PROJECT_DELETE_URL,
      {
        headers,
        data,
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Project deletion failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * Get design area info for a project
 *
 * @param {number|string} projectId - Required project ID
 * @returns {Promise<Object>} - API response
 */
async function getDesignArea(projectId) {
  if (!projectId) {
    throw new Error("projectId is required");
  }

  const url = `${PACDORA_URLS.PACDORA_PROJECT_AREA_BASE_URL}/${projectId}/design/area`;

  try {
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error(
      "Fetching design area failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * Fetch workbench templates from Pacdora
 *
 * @param {Object} options
 * @param {number} options.current - Page number
 * @param {number} options.pageSize - Page size
 * @param {number} options.pacdoraUserId - Your Pacdora user ID
 * @param {string} options.type - Template type (e.g., 'dieline', 'mockup')
 * @returns {Promise<Object>} - API response
 */
async function getWorkbenchTemplates({
  current,
  pageSize,
  pacdoraUserId,
  type,
}) {
  if (!current || !pageSize || !pacdoraUserId || !type) {
    throw new Error(
      "All parameters (current, pageSize, pacdoraUserId, type) are required"
    );
  }

  const params = new URLSearchParams({
    current,
    pageSize,
    pacdoraUserId,
    type,
  });

  const url = `${PACDORA_URLS.PACDORA_TEMPLATES_URL}?${params.toString()}`;

  try {
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error(
      "Fetching templates failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * Fetch workbench templates from Pacdora
 *
 * @param {Object} options
 * @param {number} options.current - Page number
 * @param {number} options.pageSize - Page size
 * @param {number} options.userId - Your Pacdora user ID
 * @param {string} options.type - Template type (e.g., 'dieline', 'mockup')
 * @returns {Promise<Object>} - API response
 */
async function getUserProjects({ current, pageSize, userId, projectId }) {
  if (!current || !pageSize || !userId || !projectId) {
    throw new Error(
      "All parameters (current, pageSize, userId, projectId) are required"
    );
  }

  const params = new URLSearchParams({
    current,
    pageSize,
    userId,
    projectId,
  });

  const url = `${PACDORA_URLS.USER_PROJECTS}?${params.toString()}`;

  try {
    const response = await axios.get(url, { headers });
    return response.data;

    /**[{
"id":"",
"name":"",
"length":"",
"width":"",
"height":"",
"screenshot":"",
"createTime":"",
"updateTime":"",
"templateId":"",
"modelId":"",
"pacdoraUserId":"",
"userId":""
} ]*/
  } catch (error) {
    console.error(
      "Fetching projects failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

module.exports = {
  getCategories,
  getProductsList,

  exportProjectsAsPDF,

  updateUserBaseInfo,
  getUserProjects,
  exportKnifeFile,
  getKnifeExportStatus,
  exportAiFile,
  getPdfExportStatus,
  exportDxfFile,
  uploadImages,
  uploadBase64Images,
  deleteUploadedImages,
  getBehaviorStatistics,
  deleteUploadedProjects,
  getDesignArea,
  getWorkbenchTemplates,
};
