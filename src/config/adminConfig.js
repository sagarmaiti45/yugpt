/**
 * Admin Dashboard Configuration
 * This will be replaced with database queries when admin panel is implemented
 */

// Temporary: In-memory storage for admin settings
// TODO: Replace with database (MongoDB/PostgreSQL) when admin panel is ready
let adminSettings = {
  selectedModel: process.env.DEFAULT_MODEL || 'google/gemini-2.5-flash-lite',
  lastUpdated: new Date().toISOString(),
  updatedBy: 'system',

  // Max tokens configuration per preset
  // Admin can control output length ceiling for each preset
  presetMaxTokens: {
    'general-summary': 4000,
    'extract-quotes': 3000,
    'how-to-steps': 4000,
    'facts-statistics': 3500,
    'arguments-positions': 4000,
    'qa-extraction': 3000,
    'action-items': 2500,
    'key-moments': 2500,
    'code-commands': 4000,
    'story-examples': 3500,
    'chapter-breakdown': 5000,
    'short-form-content': 6000,
    'content-repurpose': 7000
  },

  // Global default for any preset not specified above
  defaultMaxTokens: 4000
};

/**
 * Get current model selected by admin
 * @returns {string} Model identifier
 */
export function getSelectedModel() {
  // TODO: Fetch from database
  return adminSettings.selectedModel;
}

/**
 * Update model selection (for admin panel)
 * @param {string} modelId - Model identifier
 * @param {string} adminUserId - Admin user who made the change
 */
export function updateSelectedModel(modelId, adminUserId = 'admin') {
  // TODO: Save to database
  adminSettings.selectedModel = modelId;
  adminSettings.lastUpdated = new Date().toISOString();
  adminSettings.updatedBy = adminUserId;

  console.log(`Model updated to: ${modelId} by ${adminUserId}`);
}

/**
 * Get admin settings
 * @returns {object} Current admin settings
 */
export function getAdminSettings() {
  // TODO: Fetch from database
  return adminSettings;
}

/**
 * Get max tokens for a specific preset
 * @param {string} presetId - Preset identifier
 * @returns {number} Max tokens for this preset
 */
export function getPresetMaxTokens(presetId) {
  // TODO: Fetch from database
  return adminSettings.presetMaxTokens[presetId] || adminSettings.defaultMaxTokens;
}

/**
 * Get all preset max tokens configuration
 * @returns {object} Preset max tokens mapping
 */
export function getAllPresetMaxTokens() {
  // TODO: Fetch from database
  return {
    presets: adminSettings.presetMaxTokens,
    default: adminSettings.defaultMaxTokens
  };
}

/**
 * Update max tokens for a specific preset
 * @param {string} presetId - Preset identifier
 * @param {number} maxTokens - New max tokens value (100-10000)
 * @param {string} adminUserId - Admin user who made the change
 */
export function updatePresetMaxTokens(presetId, maxTokens, adminUserId = 'admin') {
  // TODO: Save to database

  // Validate max tokens (between 100 and 10000)
  if (maxTokens < 100 || maxTokens > 10000) {
    throw new Error('Max tokens must be between 100 and 10000');
  }

  adminSettings.presetMaxTokens[presetId] = maxTokens;
  adminSettings.lastUpdated = new Date().toISOString();
  adminSettings.updatedBy = adminUserId;

  console.log(`Max tokens for preset '${presetId}' updated to ${maxTokens} by ${adminUserId}`);
}

/**
 * Update default max tokens
 * @param {number} maxTokens - New default max tokens value (100-10000)
 * @param {string} adminUserId - Admin user who made the change
 */
export function updateDefaultMaxTokens(maxTokens, adminUserId = 'admin') {
  // TODO: Save to database

  // Validate max tokens (between 100 and 10000)
  if (maxTokens < 100 || maxTokens > 10000) {
    throw new Error('Max tokens must be between 100 and 10000');
  }

  adminSettings.defaultMaxTokens = maxTokens;
  adminSettings.lastUpdated = new Date().toISOString();
  adminSettings.updatedBy = adminUserId;

  console.log(`Default max tokens updated to ${maxTokens} by ${adminUserId}`);
}

/**
 * Bulk update all preset max tokens
 * @param {object} presetMaxTokensMap - Object with presetId: maxTokens pairs
 * @param {string} adminUserId - Admin user who made the change
 */
export function bulkUpdatePresetMaxTokens(presetMaxTokensMap, adminUserId = 'admin') {
  // TODO: Save to database

  // Validate all values
  for (const [presetId, maxTokens] of Object.entries(presetMaxTokensMap)) {
    if (maxTokens < 100 || maxTokens > 10000) {
      throw new Error(`Max tokens for preset '${presetId}' must be between 100 and 10000`);
    }
  }

  // Update all
  adminSettings.presetMaxTokens = { ...adminSettings.presetMaxTokens, ...presetMaxTokensMap };
  adminSettings.lastUpdated = new Date().toISOString();
  adminSettings.updatedBy = adminUserId;

  console.log(`Bulk updated max tokens for ${Object.keys(presetMaxTokensMap).length} presets by ${adminUserId}`);
}

// Available OpenRouter models
export const AVAILABLE_MODELS = {
  paid: [
    {
      id: 'google/gemini-2.5-flash-lite',
      name: 'Gemini 2.5 Flash Lite',
      provider: 'Google',
      contextLength: '1M',
      pricing: '$0.10 / 1M tokens',
      description: 'Latest Gemini, fast and efficient'
    },
    {
      id: 'openai/gpt-4o-mini',
      name: 'GPT-4 Omni Mini',
      provider: 'OpenAI',
      contextLength: '128k',
      pricing: '$0.15 / 1M tokens',
      description: 'Fast, affordable, high quality'
    },
    {
      id: 'anthropic/claude-3.5-haiku',
      name: 'Claude 3.5 Haiku',
      provider: 'Anthropic',
      contextLength: '200k',
      pricing: '$0.80 / 1M tokens',
      description: 'Quick responses, excellent accuracy'
    }
  ],
  free: [
    {
      id: 'deepseek/deepseek-r1:free',
      name: 'DeepSeek R1 (Free)',
      provider: 'DeepSeek',
      contextLength: '64k',
      pricing: 'FREE',
      description: 'Advanced reasoning model, completely free'
    },
    {
      id: 'mistralai/mistral-nemo:free',
      name: 'Mistral Nemo (Free)',
      provider: 'Mistral AI',
      contextLength: '128k',
      pricing: 'FREE',
      description: 'Efficient open-source model, free tier'
    }
  ]
};
