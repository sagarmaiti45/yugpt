import fetch from 'node-fetch';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Stream summary from OpenRouter API
 * @param {string} transcript - Video transcript text
 * @param {object} preset - Summary preset configuration
 * @param {AbortController} controller - Abort controller for cancellation
 * @param {string} modelOverride - Optional model override from admin dashboard
 */
export async function streamSummary(transcript, preset, controller, modelOverride = null) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  // Model priority: Admin dashboard > Environment variable > Default fallback
  const model = modelOverride || process.env.DEFAULT_MODEL || 'openai/gpt-4o';

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured. Please set it in Railway environment variables.');
  }

  console.log(`Using AI model: ${model}`);
  console.log(`Transcript length: ${transcript.length} characters`);

  try {
    console.log('⏰ Starting OpenRouter fetch...');
    const fetchStartTime = Date.now();

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.SITE_URL || 'https://yugpt.app',
        'X-Title': process.env.SITE_NAME || 'YuGPT'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant specialized in analyzing and summarizing video content. Provide clear, well-structured, and actionable summaries.'
          },
          {
            role: 'user',
            content: preset.prompt.replace('{transcript}', transcript)
          }
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 4000
      }),
      signal: controller?.signal
    });

    const fetchDuration = Date.now() - fetchStartTime;
    console.log(`✅ OpenRouter response received after ${fetchDuration}ms`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error response:', errorText);

      let errorMessage = `OpenRouter API error: ${response.status}`;
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.error?.message || error.message || errorMessage;
      } catch (e) {
        // Not JSON, use status text
      }

      throw new Error(errorMessage);
    }

    return response.body;

  } catch (error) {
    console.error('OpenRouter streaming error:', error);

    if (error.name === 'AbortError') {
      throw new Error('Request cancelled');
    }

    throw new Error(error.message || 'Failed to stream summary from OpenRouter');
  }
}

/**
 * Parse SSE (Server-Sent Events) stream from OpenRouter
 */
export async function* parseSSEStream(stream) {
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    for await (const chunk of stream) {
      buffer += decoder.decode(chunk, { stream: true });

      // Process complete lines from buffer
      while (true) {
        const lineEnd = buffer.indexOf('\n');
        if (lineEnd === -1) break;

        const line = buffer.slice(0, lineEnd).trim();
        buffer = buffer.slice(lineEnd + 1);

        // Skip empty lines and comments
        if (!line || line.startsWith(':')) {
          continue;
        }

        // Parse SSE data
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          // Check for stream end
          if (data === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;

            if (content) {
              yield content;
            }
          } catch (e) {
            // Ignore invalid JSON
            console.warn('Invalid JSON in stream:', data);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error parsing SSE stream:', error);
    throw error;
  }
}
