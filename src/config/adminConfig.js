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
  defaultMaxTokens: 4000,

  // System prompts configuration
  // Admin can customize all prompts used throughout the application
  prompts: {
    // Main video summarization system prompt
    summarizationSystem: 'You are an AI assistant that summarizes video content. Use the video title and channel for CONTENT understanding only (what the video is about), NOT for language detection. ALWAYS write your entire summary in the exact SAME LANGUAGE as the transcript text.\n\nFormatting:\n- Use ## for section headings with emojis (## 🎯 Overview)\n- Use **bold** for key terms only\n- Place timestamps at end of sentences: [🔗 0:03]\n- Keep it clear and structured',

    // AI chat assistant system prompt
    chatSystem: `You are an AI assistant helping users understand a YouTube video. You have access to the video's summary below.

CRITICAL INSTRUCTIONS:
1. ONLY answer questions related to this specific video and its content
2. If the user asks about topics unrelated to the video, politely decline and redirect them to ask about the video
3. Base your answers on the summary provided
4. Keep responses SHORT and CONCISE (2-4 sentences max, or 3-5 bullet points max)
5. If the summary doesn't contain enough information to answer, say so honestly
6. Use simple, clean formatting - AVOID excessive markdown

FORMATTING RULES:
- Use **bold** only for key terms or important concepts
- Use bullet points (-) for lists, but keep them SHORT (max 5 items)
- NO nested lists or complex formatting
- NO long paragraphs - break into 2-3 sentence chunks
- Keep it conversational and easy to read

VIDEO SUMMARY:
{{SUMMARY_CONTEXT}}

GUIDELINES:
- If asked "What is this video about?" - Provide a brief 2-3 sentence overview
- If asked off-topic questions - Respond: "I'm here to help you understand this video. Please ask questions related to the video content."
- Focus on being HELPFUL and BRIEF - don't over-explain`,

    // Translation system prompt
    translationSystem: 'You are a professional translator specializing in technical and educational content. Always preserve formatting and structure.',

    // Translation user prompt template
    translationUser: `You are a professional translator. Translate the following video summary to {{TARGET_LANGUAGE}}.

CRITICAL RULES:
1. Preserve ALL markdown formatting exactly:
   - Keep ## headings with emojis (e.g., ## 🎯 Overview)
   - Keep **bold** text markers
   - Keep bullet points (-, •)
   - Keep line breaks and structure

2. Keep ALL timestamps EXACTLY as they are: [🔗 0:00]
   - DO NOT translate or modify timestamps
   - DO NOT change the emoji or format

3. Translate ONLY the text content, not:
   - Markdown symbols (##, **, -, etc.)
   - Timestamp format
   - Emojis in timestamps (keep 🔗)

4. Maintain the same tone, style, and approximate length
5. Keep technical terms accurate for the target language
6. Preserve all emojis in section headings

SUMMARY TO TRANSLATE:
{{SUMMARY_CONTENT}}

Provide ONLY the translated summary, no explanations or additional text.`,

    // Chunk combination prompt template
    chunkCombination: `You previously analyzed a long video in {{TOTAL_CHUNKS}} parts. Now combine these chunk summaries into one coherent, comprehensive final summary.

Video: {{TITLE}}
Channel: {{CHANNEL}}
Duration: {{DURATION}}

Individual Chunk Summaries:
{{CHUNK_SUMMARIES}}

Instructions:
1. Merge all chunk summaries into one cohesive summary
2. Remove redundancies and consolidate overlapping information
3. Maintain chronological order where applicable
4. Preserve all important details, timestamps, and insights
5. Follow the original format style: {{PRESET_NAME}}
6. Ensure the final output is well-structured and comprehensive
7. Do NOT add introduction like "Here's the combined summary" - start directly with the content

Create a unified, polished summary that reads as if it was generated from the full transcript at once:`
  }
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

/**
 * Get all system prompts
 * @returns {object} All prompts
 */
export function getAllPrompts() {
  // TODO: Fetch from database
  return adminSettings.prompts;
}

/**
 * Get a specific system prompt
 * @param {string} promptKey - Prompt identifier (summarizationSystem, chatSystem, etc.)
 * @returns {string} Prompt content
 */
export function getPrompt(promptKey) {
  // TODO: Fetch from database
  return adminSettings.prompts[promptKey] || '';
}

/**
 * Update a system prompt
 * @param {string} promptKey - Prompt identifier
 * @param {string} promptContent - New prompt content
 * @param {string} adminUserId - Admin user who made the change
 */
export function updatePrompt(promptKey, promptContent, adminUserId = 'admin') {
  // TODO: Save to database

  if (!promptKey || typeof promptKey !== 'string') {
    throw new Error('Prompt key is required');
  }

  if (!promptContent || typeof promptContent !== 'string') {
    throw new Error('Prompt content is required');
  }

  // Validate prompt key exists
  if (!adminSettings.prompts.hasOwnProperty(promptKey)) {
    throw new Error(`Invalid prompt key: ${promptKey}`);
  }

  adminSettings.prompts[promptKey] = promptContent;
  adminSettings.lastUpdated = new Date().toISOString();
  adminSettings.updatedBy = adminUserId;

  console.log(`Prompt '${promptKey}' updated by ${adminUserId}`);
}

/**
 * Bulk update multiple prompts
 * @param {object} promptsMap - Object with promptKey: promptContent pairs
 * @param {string} adminUserId - Admin user who made the change
 */
export function bulkUpdatePrompts(promptsMap, adminUserId = 'admin') {
  // TODO: Save to database

  // Validate all keys exist
  for (const promptKey of Object.keys(promptsMap)) {
    if (!adminSettings.prompts.hasOwnProperty(promptKey)) {
      throw new Error(`Invalid prompt key: ${promptKey}`);
    }
  }

  // Update all
  adminSettings.prompts = { ...adminSettings.prompts, ...promptsMap };
  adminSettings.lastUpdated = new Date().toISOString();
  adminSettings.updatedBy = adminUserId;

  console.log(`Bulk updated ${Object.keys(promptsMap).length} prompts by ${adminUserId}`);
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
