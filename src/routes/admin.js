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
  bulkUpdatePresetMaxTokens,
  getAllPrompts,
  getPrompt,
  updatePrompt,
  bulkUpdatePrompts
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

/**
 * GET /api/admin/prompts
 * Get all system prompts
 */
router.get('/prompts', requireAuth, (req, res) => {
  try {
    const prompts = getAllPrompts();

    // Add metadata for each prompt
    const promptsWithMetadata = Object.keys(prompts).map(key => ({
      key: key,
      content: prompts[key],
      name: getPromptDisplayName(key),
      description: getPromptDescription(key),
      length: prompts[key].length
    }));

    res.json({
      success: true,
      data: {
        prompts: promptsWithMetadata,
        count: promptsWithMetadata.length
      }
    });

  } catch (error) {
    console.error('Get prompts error:', error);
    res.status(500).json({
      error: { message: error.message || 'Failed to get prompts', status: 500 }
    });
  }
});

/**
 * GET /api/admin/prompts/:promptKey
 * Get a specific system prompt
 */
router.get('/prompts/:promptKey', requireAuth, (req, res) => {
  try {
    const { promptKey } = req.params;
    const promptContent = getPrompt(promptKey);

    if (!promptContent) {
      return res.status(404).json({
        error: { message: `Prompt '${promptKey}' not found`, status: 404 }
      });
    }

    res.json({
      success: true,
      data: {
        key: promptKey,
        content: promptContent,
        name: getPromptDisplayName(promptKey),
        description: getPromptDescription(promptKey)
      }
    });

  } catch (error) {
    console.error('Get prompt error:', error);
    res.status(500).json({
      error: { message: error.message || 'Failed to get prompt', status: 500 }
    });
  }
});

/**
 * POST /api/admin/prompts/update
 * Update a specific system prompt
 */
router.post('/prompts/update', requireAuth, (req, res) => {
  try {
    const { promptKey, promptContent, adminUserId } = req.body;

    if (!promptKey) {
      return res.status(400).json({
        error: { message: 'Prompt key is required', status: 400 }
      });
    }

    if (!promptContent || typeof promptContent !== 'string') {
      return res.status(400).json({
        error: { message: 'Prompt content must be a string', status: 400 }
      });
    }

    updatePrompt(promptKey, promptContent, adminUserId || 'admin');

    res.json({
      success: true,
      data: {
        promptKey,
        message: `Prompt '${promptKey}' updated successfully`
      }
    });

  } catch (error) {
    console.error('Update prompt error:', error);
    res.status(400).json({
      error: { message: error.message || 'Failed to update prompt', status: 400 }
    });
  }
});

/**
 * POST /api/admin/prompts/bulk-update
 * Bulk update multiple prompts
 */
router.post('/prompts/bulk-update', requireAuth, (req, res) => {
  try {
    const { prompts, adminUserId } = req.body;

    if (!prompts || typeof prompts !== 'object') {
      return res.status(400).json({
        error: { message: 'Prompts object is required (promptKey: promptContent pairs)', status: 400 }
      });
    }

    bulkUpdatePrompts(prompts, adminUserId || 'admin');

    res.json({
      success: true,
      data: {
        updatedCount: Object.keys(prompts).length,
        message: `Bulk updated ${Object.keys(prompts).length} prompts`
      }
    });

  } catch (error) {
    console.error('Bulk update prompts error:', error);
    res.status(400).json({
      error: { message: error.message || 'Failed to bulk update prompts', status: 400 }
    });
  }
});

/**
 * POST /api/admin/prompts/reset
 * Reset a prompt to its default value
 */
router.post('/prompts/reset', requireAuth, (req, res) => {
  try {
    const { promptKey, adminUserId } = req.body;

    if (!promptKey) {
      return res.status(400).json({
        error: { message: 'Prompt key is required', status: 400 }
      });
    }

    const defaultContent = getDefaultPromptContent(promptKey);
    if (!defaultContent) {
      return res.status(404).json({
        error: { message: `No default found for prompt '${promptKey}'`, status: 404 }
      });
    }

    updatePrompt(promptKey, defaultContent, adminUserId || 'admin');

    res.json({
      success: true,
      data: {
        promptKey,
        message: `Prompt '${promptKey}' reset to default`
      }
    });

  } catch (error) {
    console.error('Reset prompt error:', error);
    res.status(400).json({
      error: { message: error.message || 'Failed to reset prompt', status: 400 }
    });
  }
});

/**
 * Helper function to get display name for prompt keys
 */
function getPromptDisplayName(key) {
  const names = {
    summarizationSystem: 'Video Summarization System Prompt',
    chatSystem: 'AI Chat Assistant System Prompt',
    translationSystem: 'Translation System Prompt',
    translationUser: 'Translation User Prompt',
    chunkCombination: 'Chunk Combination Prompt'
  };
  return names[key] || key;
}

/**
 * Helper function to get description for prompt keys
 */
function getPromptDescription(key) {
  const descriptions = {
    summarizationSystem: 'Main system prompt used for video content summarization. Controls language detection and output formatting.',
    chatSystem: 'System prompt for AI chat assistant. Defines behavior, constraints, and response guidelines.',
    translationSystem: 'System prompt for translation service. Ensures formatting preservation.',
    translationUser: 'User prompt template for translation requests. Includes formatting and preservation rules.',
    chunkCombination: 'Prompt template for combining multiple chunk summaries into one coherent summary.'
  };
  return descriptions[key] || '';
}

/**
 * Helper function to get default prompt content
 */
function getDefaultPromptContent(key) {
  const defaults = {
    summarizationSystem: 'You are an AI assistant that summarizes video content. Use the video title and channel for CONTENT understanding only (what the video is about), NOT for language detection. ALWAYS write your entire summary in the exact SAME LANGUAGE as the transcript text.\n\nFormatting:\n- Use ## for section headings with emojis (## 🎯 Overview)\n- Use **bold** for key terms only\n- Place timestamps at end of sentences: [🔗 0:03]\n- Keep it clear and structured',
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
    translationSystem: 'You are a professional translator specializing in technical and educational content. Always preserve formatting and structure.',
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
  };
  return defaults[key] || null;
}

export default router;
