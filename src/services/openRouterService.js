import fetch from 'node-fetch';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Stream summary from OpenRouter API
 */
export async function streamSummary(transcript, preset, controller) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o';

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }

  try {
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

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `OpenRouter API error: ${response.status}`);
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
