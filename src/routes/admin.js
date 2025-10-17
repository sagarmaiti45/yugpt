import express from 'express';
import {
  getSelectedModel,
  updateSelectedModel,
  getAdminSettings,
  AVAILABLE_MODELS,
  getPresetMaxTokens,
  getAllPresetMaxTokens,
  updatePresetMaxTokens,
  updateDefaultMaxTokens,
  bulkUpdatePresetMaxTokens
} from '../config/adminConfig.js';
import { SUMMARY_PRESETS } from '../config/summaryPresets.js';

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

/**
 * GET /api/admin/presets/max-tokens
 * Get max tokens configuration for all presets
 */
router.get('/presets/max-tokens', requireAuth, (req, res) => {
  try {
    const maxTokensConfig = getAllPresetMaxTokens();

    // Add preset names for easier UI display
    const presetsWithNames = Object.keys(maxTokensConfig.presets).map(presetId => ({
      id: presetId,
      name: SUMMARY_PRESETS[presetId]?.name || presetId,
      maxTokens: maxTokensConfig.presets[presetId]
    }));

    res.json({
      success: true,
      data: {
        presets: presetsWithNames,
        default: maxTokensConfig.default
      }
    });

  } catch (error) {
    console.error('Get preset max tokens error:', error);
    res.status(500).json({
      error: { message: error.message || 'Failed to get max tokens', status: 500 }
    });
  }
});

/**
 * POST /api/admin/presets/max-tokens/update
 * Update max tokens for a specific preset
 */
router.post('/presets/max-tokens/update', requireAuth, (req, res) => {
  try {
    const { presetId, maxTokens, adminUserId } = req.body;

    if (!presetId) {
      return res.status(400).json({
        error: { message: 'Preset ID is required', status: 400 }
      });
    }

    if (!maxTokens || typeof maxTokens !== 'number') {
      return res.status(400).json({
        error: { message: 'Max tokens must be a number', status: 400 }
      });
    }

    updatePresetMaxTokens(presetId, maxTokens, adminUserId || 'admin');

    res.json({
      success: true,
      data: {
        presetId,
        maxTokens,
        message: `Max tokens for preset '${presetId}' updated to ${maxTokens}`
      }
    });

  } catch (error) {
    console.error('Update preset max tokens error:', error);
    res.status(400).json({
      error: { message: error.message || 'Failed to update max tokens', status: 400 }
    });
  }
});

/**
 * POST /api/admin/presets/max-tokens/update-default
 * Update default max tokens
 */
router.post('/presets/max-tokens/update-default', requireAuth, (req, res) => {
  try {
    const { maxTokens, adminUserId } = req.body;

    if (!maxTokens || typeof maxTokens !== 'number') {
      return res.status(400).json({
        error: { message: 'Max tokens must be a number', status: 400 }
      });
    }

    updateDefaultMaxTokens(maxTokens, adminUserId || 'admin');

    res.json({
      success: true,
      data: {
        maxTokens,
        message: `Default max tokens updated to ${maxTokens}`
      }
    });

  } catch (error) {
    console.error('Update default max tokens error:', error);
    res.status(400).json({
      error: { message: error.message || 'Failed to update default max tokens', status: 400 }
    });
  }
});

/**
 * POST /api/admin/presets/max-tokens/bulk-update
 * Bulk update max tokens for multiple presets
 */
router.post('/presets/max-tokens/bulk-update', requireAuth, (req, res) => {
  try {
    const { presets, adminUserId } = req.body;

    if (!presets || typeof presets !== 'object') {
      return res.status(400).json({
        error: { message: 'Presets object is required (presetId: maxTokens pairs)', status: 400 }
      });
    }

    bulkUpdatePresetMaxTokens(presets, adminUserId || 'admin');

    res.json({
      success: true,
      data: {
        updatedCount: Object.keys(presets).length,
        message: `Bulk updated max tokens for ${Object.keys(presets).length} presets`
      }
    });

  } catch (error) {
    console.error('Bulk update max tokens error:', error);
    res.status(400).json({
      error: { message: error.message || 'Failed to bulk update max tokens', status: 400 }
    });
  }
});

export default router;
