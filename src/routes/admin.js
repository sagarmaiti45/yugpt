import express from 'express';
import { getSelectedModel, updateSelectedModel, getAdminSettings, AVAILABLE_MODELS } from '../config/adminConfig.js';

const router = express.Router();

/**
 * Simple authentication middleware
 * TODO: Replace with proper authentication (JWT, sessions, etc.)
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
    return res.status(401).json({
      error: { message: 'Unauthorized access', status: 401 }
    });
  }

  next();
}

/**
 * GET /api/admin/models
 * Get all available models organized by tier
 */
router.get('/models', requireAuth, (req, res) => {
  res.json({
    success: true,
    data: {
      models: AVAILABLE_MODELS,
      currentModel: getSelectedModel(),
      settings: getAdminSettings()
    }
  });
});

/**
 * POST /api/admin/models/select
 * Update selected model
 */
router.post('/models/select', requireAuth, (req, res) => {
  try {
    const { modelId, adminUserId } = req.body;

    if (!modelId) {
      return res.status(400).json({
        error: { message: 'Model ID is required', status: 400 }
      });
    }

    // Validate model ID format (basic check)
    if (!modelId.includes('/')) {
      return res.status(400).json({
        error: { message: 'Invalid model ID format. Expected format: provider/model-name', status: 400 }
      });
    }

    updateSelectedModel(modelId, adminUserId || 'admin');

    res.json({
      success: true,
      data: {
        selectedModel: modelId,
        message: 'Model updated successfully'
      }
    });

  } catch (error) {
    console.error('Model selection error:', error);
    res.status(500).json({
      error: { message: error.message || 'Failed to update model', status: 500 }
    });
  }
});

/**
 * GET /api/admin/settings
 * Get current admin settings
 */
router.get('/settings', requireAuth, (req, res) => {
  res.json({
    success: true,
    data: getAdminSettings()
  });
});

export default router;
