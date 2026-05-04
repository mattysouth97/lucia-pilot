import Anthropic from '@anthropic-ai/sdk';
import type { FastifyPluginAsync } from 'fastify';

const SYSTEM =
  'You are Lucia AI, a built-in assistant for the Lucia KIE-REMS Lite 정산 platform. ' +
  'The platform manages solar energy settlement for 116 LH 매입임대주택 buildings in ' +
  '울진군 (Uljin-gun), Korea. Help operators understand settlement calculations, ' +
  'generation data, subsidy distributions (LH 64.2% / 국민임대 10.9% / 에너지소외 35.8%), ' +
  'anomaly alerts, and blockchain confirmation status. Be concise. ' +
  'Respond in Korean by default unless the user writes in English.';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const chatPlugin: FastifyPluginAsync = async (app) => {
  if (!process.env['ANTHROPIC_API_KEY']) {
    app.log.warn('[chat] ANTHROPIC_API_KEY not set — POST /api/chat will return 503');
  }

  app.post<{ Body: { messages: ChatMessage[] } }>('/api/chat', {
    schema: {
      body: {
        type: 'object',
        required: ['messages'],
        properties: {
          messages: {
            type: 'array',
            items: {
              type: 'object',
              required: ['role', 'content'],
              properties: {
                role: { type: 'string', enum: ['user', 'assistant'] },
                content: { type: 'string', maxLength: 4000 },
              },
            },
            maxItems: 40,
          },
        },
      },
    },
  }, async (req, reply) => {
    const apiKey = process.env['ANTHROPIC_API_KEY'];
    if (!apiKey) {
      return reply.status(503).send({ error: 'ANTHROPIC_API_KEY not configured' });
    }

    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM,
      messages: req.body.messages,
    });

    const block = response.content[0];
    if (block?.type !== 'text') {
      return reply.internalServerError('Unexpected response content type');
    }

    return { content: block.text };
  });
};
