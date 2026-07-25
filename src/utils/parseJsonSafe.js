// Gemini occasionally wraps JSON in ```fences``` even when told not to.
function parseJsonSafe(text) {
  if (!text || !text.trim()) return [];

  try {
    return JSON.parse(text);
  } catch {
    const cleaned = text.replace(/```json|```/g, '').trim();
    if (!cleaned) return [];
    
    try {
      return JSON.parse(cleaned);
    } catch (err) {
      // If it still fails, log and return empty array to prevent crashing the job
      console.error('Failed to parse JSON:', err.message, '\\nRaw text:', text);
      return [];
    }
  }
}

module.exports = parseJsonSafe;
