import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AIController } from '../src/controllers/ai.controller.js';
import { PredictiveController } from '../src/controllers/predictive.controller.js';

function createMockReqRes(body: any = {}) {
  const req: any = { body, headers: {} };
  const res: any = {
    statusCode: 200,
    bodyData: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.bodyData = data;
      return this;
    }
  };
  return { req, res };
}

describe('Phase 3: PulseAI Retail Intelligence Assistant Gateway Verification', () => {
  it('F-AI-T1: Rejects empty or whitespace-only queries with HTTP 400 VALIDATION_ERROR', async () => {
    const { req, res } = createMockReqRes({ query: '   ' });
    await AIController.handleChat(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.bodyData.success, false);
    assert.strictEqual(res.bodyData.error_category, 'VALIDATION_ERROR');
  });

  it('F-AI-T2: Rejects excessively long queries (>1000 chars) with HTTP 400', async () => {
    const longQuery = 'A'.repeat(1005);
    const { req, res } = createMockReqRes({ query: longQuery });
    await AIController.handleChat(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.bodyData.success, false);
    assert(res.bodyData.message.includes('exceeds maximum permitted length'));
  });

  it('F-AI-T3: Returns HTTP 503 when Python AI service is offline', async () => {
    // Temporarily stub queryPythonService to simulate offline Python service
    const origQuery = (PredictiveController as any).queryPythonService;
    (PredictiveController as any).queryPythonService = async () => null;

    try {
      const { req, res } = createMockReqRes({ query: 'Why did revenue drop?' });
      await AIController.handleChat(req, res);

      assert.strictEqual(res.statusCode, 503);
      assert.strictEqual(res.bodyData.success, false);
      assert.strictEqual(res.bodyData.error, 'PYTHON_AI_SERVICE_UNAVAILABLE');
    } finally {
      (PredictiveController as any).queryPythonService = origQuery;
    }
  });

  it('F-AI-T4: Forwards valid query and returns structured response from Python agent', async () => {
    const mockPythonResponse = {
      query: 'Why did revenue decrease this week?',
      intent: 'REVENUE_INVESTIGATION',
      engine: 'PulseAI-MultiStepWorkflow',
      answer: 'Revenue fell due to a 25% spike in cancellations on ShopPulse.',
      execution_steps: [
        {
          step: 1,
          tool: 'tool_query_kpis',
          arguments: { days: 7 },
          status: 'SUCCESS',
          duration_ms: 12.5,
          output_summary: 'Net Revenue: $1050'
        }
      ],
      evidence: [
        {
          metric_name: 'Cancellation Rate',
          actual_value: '50.0%',
          source: 'ShopPulse',
          data_classification: 'OBSERVED'
        }
      ],
      citations: ['retail_pulse.json'],
      caveats_and_limitations: ['Correlation does not guarantee causation.']
    };

    const origQuery = (PredictiveController as any).queryPythonService;
    (PredictiveController as any).queryPythonService = async () => mockPythonResponse;

    try {
      const { req, res } = createMockReqRes({ query: 'Why did revenue decrease this week?', source: 'ShopPulse' });
      await AIController.handleChat(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.bodyData.success, true);
      assert.strictEqual(res.bodyData.engine, 'PulseAI-MultiStepWorkflow');
      assert.strictEqual(res.bodyData.data.intent, 'REVENUE_INVESTIGATION');
      assert.strictEqual(res.bodyData.data.execution_steps.length, 1);
      assert.strictEqual(res.bodyData.data.evidence.length, 1);
    } finally {
      (PredictiveController as any).queryPythonService = origQuery;
    }
  });
});
