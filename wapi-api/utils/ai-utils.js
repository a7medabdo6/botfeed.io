import { AiPromptLog } from '../models/index.js';
import { checkAiQuotaForUser } from '../middlewares/plan-permission.js';

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};


const defaultModelConfig = () => ({
  max_tokens: 1024,
  temperature: 0.7,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0
});

const formatRequestBody = (model, prompt) => {
  const { provider, model_id } = model;
  const config = { ...defaultModelConfig(), ...(model.config && typeof model.config === 'object' ? model.config : {}) };

  switch (provider) {
    case 'anthropic':
      return {
        model: model_id,
        max_tokens: config.max_tokens,
        messages: [{ role: 'user', content: prompt }]
      };

    case 'google':
      return {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: config.temperature,
          maxOutputTokens: config.max_tokens,
          topP: config.top_p
        }
      };

    case 'openai':
    case 'openrouter':
    default:
      return {
        model: model_id,
        messages: [{ role: 'user', content: prompt }],
        temperature: config.temperature,
        max_tokens: config.max_tokens,
        top_p: config.top_p,
        frequency_penalty: config.frequency_penalty,
        presence_penalty: config.presence_penalty
      };
  }
};


const formatRequestHeaders = (model, apiKey) => {
  const { provider, api_version, headers_template } = model;
  const headers = {
    'Content-Type': 'application/json'
  };

  if (headers_template && Object.keys(headers_template).length > 0) {
    Object.entries(headers_template).forEach(([key, value]) => {
      if (typeof key !== 'string' || key.startsWith('$')) {
        return;
      }

      let headerValue = value;
      if (typeof headerValue === 'string') {
        headerValue = headerValue.replace('{{API_KEY}}', apiKey);
      }

      if (typeof headerValue === 'string' && headerValue.trim() !== '') {
        headers[key] = headerValue;
      }
    });

    if (headers['Authorization'] || headers['x-api-key'] || headers['x-goog-api-key']) {
      return headers;
    }
  }

  switch (provider) {
    case 'anthropic':
      if (!headers['x-api-key'] && typeof apiKey === 'string') {
        headers['x-api-key'] = apiKey;
      }
      if (typeof api_version === 'string') {
        headers['anthropic-version'] = api_version || '2023-06-01';
      }
      break;

    case 'google':
      if (headers_template && headers_template['x-goog-api-key'] && typeof apiKey === 'string') {
        headers['x-goog-api-key'] = apiKey;
      }
      break;

    case 'openai':
    case 'groq':
    case 'mistral':
    case 'openrouter':
      if (!headers['Authorization'] && typeof apiKey === 'string') {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      if (provider === 'openrouter') {
        const referer = process.env.OPENROUTER_HTTP_REFERER;
        const title = process.env.OPENROUTER_APP_TITLE;
        if (referer && !headers['HTTP-Referer']) {
          headers['HTTP-Referer'] = referer;
        }
        if (title && !headers['X-Title']) {
          headers['X-Title'] = title;
        }
      }
      break;

    default:
      if (!headers['Authorization'] && typeof apiKey === 'string') {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      break;
  }

  return headers;
};


const buildApiEndpoint = (model, apiKey) => {
  const { api_endpoint, provider, model_id } = model;
  const key = encodeURIComponent(apiKey ?? '');

  if (provider === 'google') {
    const ep = (api_endpoint || '').trim().replace(/\/$/, '');
    if (!ep) {
      throw new Error('Google AI model is missing api_endpoint');
    }
    if (ep.includes(':generateContent')) {
      if (/\bkey=/.test(ep)) return ep;
      const sep = ep.includes('?') ? '&' : '?';
      return `${ep}${sep}key=${key}`;
    }
    return `${ep}/${model_id}:generateContent?key=${key}`;
  }

  return api_endpoint;
};


const callAIModel = async (userId, model, apiKey, prompt) => {
  if (userId) {
    await checkAiQuotaForUser(userId);
  }

  const requestBody = formatRequestBody(model, prompt);
  const requestHeaders = formatRequestHeaders(model, apiKey);

  const apiEndpoint = buildApiEndpoint(model, apiKey);

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: requestHeaders,
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = errorData.error?.message || errorData.message || `API request failed with status ${response.status}`;
    const err = new Error(msg);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();

  let responseText;
  if (model.provider === 'google') {
    const parts = data.candidates?.[0]?.content?.parts || [];
    responseText = parts.map(part => part.text).join('');

    if (!responseText) {
      throw new Error('Unable to extract response from Google AI model');
    }
  } else {
    responseText = getNestedValue(data, model.response_path);

    if (!responseText) {
      throw new Error('Unable to extract response from AI model');
    }
  }

  if (userId) {
    try {
      await AiPromptLog.create({
        user_id: userId,
        feature: 'ai_prompts'
      });
    } catch (err) {
      console.error('AI log failed:', err);
    }
  }

  return responseText;
};


const testAIModel = async (model, prompt, apiKey, userId = null) => {
  if (!apiKey) {
    throw new Error('API key not found in model configuration');
  }

  return await callAIModel(userId, model, apiKey, prompt);
};

export {
  getNestedValue,
  formatRequestBody,
  formatRequestHeaders,
  buildApiEndpoint,
  callAIModel,
  testAIModel
};
