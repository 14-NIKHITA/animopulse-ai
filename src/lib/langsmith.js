/**
 * AnimoPulse Client Telemetry Stub
 * Tracing is handled server-side in Vercel Serverless Functions (/api/health-assistant & /api/emergency-triage).
 * No secret keys (LANGSMITH_API_KEY) are exposed to client bundle.
 */

export async function traceAiRun({
  runName = 'animopulse-ai-run',
  userId = 'anonymous',
  petId = null,
  question = '',
  retrievedDocumentCount = 0,
  promptSent = '',
  geminiResponse = '',
  startTime = Date.now(),
  endTime = Date.now(),
  error = null
}) {
  const latencyMs = endTime - startTime;

  // Local Console Observability Output for Development
  if (import.meta.env.DEV) {
    console.groupCollapsed(`[Telemetry Log] 🔍 ${runName} (${latencyMs}ms)`);
    console.log('User ID:', userId);
    console.log('Pet ID:', petId);
    console.log('Question:', question);
    console.log('Retrieved Doc Count:', retrievedDocumentCount);
    console.log('Latency (ms):', latencyMs);
    if (error) console.error('Error:', error);
    console.groupEnd();
  }

  return { status: 'server_traced', timestamp: new Date().toISOString() };
}
