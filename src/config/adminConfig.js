/**
 * Admin Dashboard Configuration
 * This will be replaced with database queries when admin panel is implemented
 */

// Temporary: In-memory storage for admin settings
// TODO: Replace with database (MongoDB/PostgreSQL) when admin panel is ready
let adminSettings = {
  selectedModel: process.env.DEFAULT_MODEL || 'openai/gpt-4o',
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

// Available OpenRouter models (can be expanded)
export const AVAILABLE_MODELS = {
  'openai/gpt-4o': { name: 'GPT-4 Omni', provider: 'OpenAI', tier: 'premium' },
  'openai/gpt-4o-mini': { name: 'GPT-4 Omni Mini', provider: 'OpenAI', tier: 'standard' },
  'anthropic/claude-3.5-sonnet': { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', tier: 'premium' },
  'anthropic/claude-3-haiku': { name: 'Claude 3 Haiku', provider: 'Anthropic', tier: 'fast' },
  'google/gemini-pro': { name: 'Gemini Pro', provider: 'Google', tier: 'standard' },
  'meta-llama/llama-3.1-70b-instruct': { name: 'Llama 3.1 70B', provider: 'Meta', tier: 'open-source' }
};
