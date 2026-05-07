/**
 * Builds the full chatbot system prompt from business context, optional training,
 * and an optional persona_profile (wizard selections).
 *
 * @param {object} data
 * @param {string} [data.business_name]
 * @param {string} [data.business_description]
 * @param {Array<{question?: string, answer?: string}>} [data.training_data]
 * @param {string} [data.raw_training_text]
 * @param {object} [data.persona_profile]
 * @returns {string}
 */
export function buildChatbotSystemPrompt(data) {
  const {
    business_name,
    business_description,
    training_data,
    raw_training_text,
    persona_profile,
  } = data || {};

  let prompt = `You are an AI assistant for ${business_name || 'our business'}.\n`;

  if (business_description) {
    prompt += `\nBusiness Description:\n${business_description}\n`;
  }

  if (persona_profile && typeof persona_profile === 'object') {
    const p = persona_profile;
    prompt += `\n## Persona and response style\n`;

    const useCaseMap = {
      support: 'customer support (answer questions, troubleshoot, escalate when needed)',
      sales: 'sales (help customers choose products or plans, qualify interest)',
      booking: 'booking and scheduling (collect details, propose times, confirm appointments)',
      faq: 'FAQ and self-service (answer common questions from the knowledge below)',
      lead_capture: 'lead capture (collect contact details and intent, keep messages concise)',
      general: 'general customer messaging (helpful and on-brand)',
    };
    if (p.use_case && useCaseMap[p.use_case]) {
      prompt += `- Primary role: ${useCaseMap[p.use_case]}\n`;
    }

    const formalityMap = {
      casual: 'Use a relaxed, friendly tone while staying respectful.',
      neutral: 'Use a balanced, professional tone suitable for most customers.',
      formal: 'Use a formal, respectful tone appropriate for corporate or sensitive contexts.',
    };
    if (p.formality && formalityMap[p.formality]) {
      prompt += `- Formality: ${formalityMap[p.formality]}\n`;
    }

    const warmthMap = {
      low: 'Keep emotional warmth low; stay efficient and matter-of-fact.',
      medium: 'Show moderate warmth and empathy without being overly familiar.',
      high: 'Be warm, reassuring, and personable while remaining professional.',
    };
    if (p.warmth && warmthMap[p.warmth]) {
      prompt += `- Warmth: ${warmthMap[p.warmth]}\n`;
    }

    if (p.regional_voice && String(p.regional_voice).trim()) {
      prompt += `- Regional / voice flavor (when natural): ${String(p.regional_voice).trim()}\n`;
    }

    const styleMap = {
      classic: 'Prefer clear, timeless wording; avoid slang unless the customer uses it first.',
      modern: 'Prefer concise, contemporary wording; short paragraphs when possible.',
    };
    if (p.style && styleMap[p.style]) {
      prompt += `- Style: ${styleMap[p.style]}\n`;
    }

    if (p.reply_language && String(p.reply_language).trim()) {
      let langLine = `- Reply primarily in **${String(p.reply_language).trim()}**`;
      if (p.allow_mixed_languages === true) {
        langLine += '; the user may mix languages — follow their lead and mirror appropriately.';
      } else {
        langLine += ' unless the user clearly switches language; then follow their lead.';
      }
      prompt += `${langLine}\n`;
    } else if (p.allow_mixed_languages === true) {
      prompt += `- The user may mix languages; follow their lead and respond in the language they prefer for each message.\n`;
    }

    const lengthMap = {
      short: 'Keep replies short (a few sentences unless the user asks for detail).',
      balanced: 'Use balanced length: enough detail to be useful, avoid unnecessary verbosity.',
      detailed: 'You may use longer replies when the topic needs explanation; still stay structured.',
    };
    if (p.response_length && lengthMap[p.response_length]) {
      prompt += `- Length: ${lengthMap[p.response_length]}\n`;
    }

    const channelMap = {
      whatsapp: 'Channel: chat app (e.g. WhatsApp) — prefer short paragraphs, avoid huge walls of text; plain links when needed.',
      widget: 'Channel: website widget — slightly richer structure is fine if readable; still avoid overwhelming blocks.',
      both: 'Channel: both mobile chat and web — keep messages scannable and mobile-friendly.',
    };
    if (p.channel_hint && channelMap[p.channel_hint]) {
      prompt += `- ${channelMap[p.channel_hint]}\n`;
    }

    const audienceMap = {
      b2c: 'Audience: consumers (B2C) — clear, approachable explanations.',
      b2b: 'Audience: businesses (B2B) — concise, decision-useful information.',
      mixed: 'Audience: mixed B2B and B2C — adapt tone to cues from the customer.',
    };
    if (p.audience_type && audienceMap[p.audience_type]) {
      prompt += `- ${audienceMap[p.audience_type]}\n`;
    }

    if (p.industry_vertical && String(p.industry_vertical).trim()) {
      prompt += `- Industry / vertical context: ${String(p.industry_vertical).trim()}\n`;
    }

    const techMap = {
      lay: 'Assume customers are non-technical unless they signal otherwise; avoid jargon.',
      intermediate: 'Customers may have moderate domain knowledge; define acronyms once.',
      technical: 'Customers may be technical; precise terminology is acceptable when helpful.',
    };
    if (p.technical_level && techMap[p.technical_level]) {
      prompt += `- Technical level: ${techMap[p.technical_level]}\n`;
    }

    const greetingMap = {
      brief: 'Greetings: keep openings brief (one short line) unless the user engages first.',
      friendly: 'Greetings: you may use a short warm greeting when starting a conversation.',
      minimal: 'Greetings: avoid filler; get to the point quickly.',
    };
    if (p.greeting_style && greetingMap[p.greeting_style]) {
      prompt += `- ${greetingMap[p.greeting_style]}\n`;
    }

    const emojiMap = {
      never: 'Do not use emojis.',
      sparing: 'Use emojis sparingly and only if they add clarity or match the customer tone.',
      ok: 'Emojis are acceptable when they fit the brand and channel; do not overuse.',
    };
    if (p.emoji_policy && emojiMap[p.emoji_policy]) {
      prompt += `- ${emojiMap[p.emoji_policy]}\n`;
    }

    if (p.always_rules && String(p.always_rules).trim()) {
      prompt += `\n### Always\n${String(p.always_rules).trim()}\n`;
    }
    if (p.never_rules && String(p.never_rules).trim()) {
      prompt += `\n### Never\n${String(p.never_rules).trim()}\n`;
    }
    if (p.knowledge_scope && String(p.knowledge_scope).trim()) {
      prompt += `\n### Scope\nOnly answer about: ${String(p.knowledge_scope).trim()}. For anything outside scope, say so and offer a human agent if appropriate.\n`;
    }
    if (p.escalation_policy && String(p.escalation_policy).trim()) {
      prompt += `\n### Escalation\n${String(p.escalation_policy).trim()}\n`;
    }

    if (p.avoid_medical_legal === true) {
      prompt += `\n### Safety\nDo not provide medical, legal, or regulated professional advice. If asked, refuse briefly and suggest consulting a qualified professional.\n`;
      const refusalMap = {
        strict: 'For refusals or sensitive topics, use a brief, firm, neutral tone without debate.',
        friendly: 'For refusals or limits, stay kind and brief, and offer what you can do instead.',
      };
      if (p.refusal_tone && refusalMap[p.refusal_tone]) {
        prompt += `- Refusal tone: ${refusalMap[p.refusal_tone]}\n`;
      }
    } else if (p.refusal_tone && (p.refusal_tone === 'strict' || p.refusal_tone === 'friendly')) {
      const refusalMap = {
        strict: 'When you must decline or set boundaries, be brief and firm.',
        friendly: 'When you must decline, stay kind and offer alternatives when possible.',
      };
      prompt += `- Refusal tone: ${refusalMap[p.refusal_tone]}\n`;
    }

    if (p.tone_notes && String(p.tone_notes).trim()) {
      prompt += `\n### Additional tone notes\n${String(p.tone_notes).trim()}\n`;
    }
  }

  if (training_data && training_data.length > 0) {
    prompt += `\nHere are some Frequently Asked Questions and their answers to help you guide the customer:\n`;
    training_data.forEach((item, index) => {
      prompt += `${index + 1}. Q: ${item.question}\n   A: ${item.answer}\n`;
    });
  }

  if (raw_training_text) {
    prompt += `\nAdditional Context:\n${raw_training_text}\n`;
  }

  prompt += `\nRules:\n- Be professional, polite, and helpful.\n- If you don't know the answer, ask the customer to wait while an agent is notified.\n- Do not invent policies, prices, or legal commitments that are not in the business description or knowledge above.\n- Keep your responses natural and aligned with the persona above.`;

  return prompt.trim();
}
