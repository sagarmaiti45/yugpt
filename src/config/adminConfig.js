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

// Available OpenRouter models organized by tier
export const AVAILABLE_MODELS = {
  premium: [
    {
      id: 'openai/gpt-4o',
      name: 'GPT-4 Omni',
      provider: 'OpenAI',
      contextLength: '128k',
      pricing: '$2.50 / 1M tokens',
      description: 'Best quality, multimodal flagship model'
    },
    {
      id: 'anthropic/claude-3.5-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      contextLength: '200k',
      pricing: '$3.00 / 1M tokens',
      description: 'Excellent for analysis and long content'
    },
    {
      id: 'google/gemini-pro-1.5',
      name: 'Gemini Pro 1.5',
      provider: 'Google',
      contextLength: '1M',
      pricing: '$1.25 / 1M tokens',
      description: 'Huge context window, great value'
    }
  ],
  optimized: [
    {
      id: 'openai/gpt-4o-mini',
      name: 'GPT-4 Omni Mini',
      provider: 'OpenAI',
      contextLength: '128k',
      pricing: '$0.15 / 1M tokens',
      description: 'Fast, affordable, high quality'
    },
    {
      id: 'anthropic/claude-3-haiku',
      name: 'Claude 3 Haiku',
      provider: 'Anthropic',
      contextLength: '200k',
      pricing: '$0.25 / 1M tokens',
      description: 'Quick responses, good accuracy'
    },
    {
      id: 'google/gemini-flash-1.5',
      name: 'Gemini Flash 1.5',
      provider: 'Google',
      contextLength: '1M',
      pricing: '$0.075 / 1M tokens',
      description: 'Fastest, large context, cheap'
    }
  ],
  free: [
    {
      id: 'meta-llama/llama-3.1-8b-instruct:free',
      name: 'Llama 3.1 8B (Free)',
      provider: 'Meta',
      contextLength: '128k',
      pricing: 'FREE',
      description: 'Open-source, great for testing'
    },
    {
      id: 'google/gemma-2-9b-it:free',
      name: 'Gemma 2 9B (Free)',
      provider: 'Google',
      contextLength: '8k',
      pricing: 'FREE',
      description: 'Good quality, completely free'
    },
    {
      id: 'mistralai/mistral-7b-instruct:free',
      name: 'Mistral 7B (Free)',
      provider: 'Mistral AI',
      contextLength: '32k',
      pricing: 'FREE',
      description: 'Efficient open-source model'
    },
    {
      id: 'qwen/qwen-2-7b-instruct:free',
      name: 'Qwen 2 7B (Free)',
      provider: 'Alibaba',
      contextLength: '32k',
      pricing: 'FREE',
      description: 'Multilingual, free tier'
    }
  ]
};
