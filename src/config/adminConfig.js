/**
 * Admin Dashboard Configuration
 * This will be replaced with database queries when admin panel is implemented
 */

// Temporary: In-memory storage for admin settings
// TODO: Replace with database (MongoDB/PostgreSQL) when admin panel is ready
let adminSettings = {
  selectedModel: process.env.DEFAULT_MODEL || 'google/gemini-2.5-flash-lite',
  lastUpdated: new Date().toISOString(),
  updatedBy: 'system'
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
