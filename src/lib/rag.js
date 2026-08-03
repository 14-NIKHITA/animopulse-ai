/**
 * AnimoPulse Retrieval-Augmented Generation (RAG) Utility Engine
 * Handles Text Extraction, Cleaning, Document Chunking (500-800 chars), & Document Search.
 * Uses text/term relevance search when vector embeddings are null.
 */

/**
 * Clean extracted text before chunking.
 */
export function cleanText(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';
  return rawText
    .replace(/[\r\v\f]/g, '\n')
    .replace(/[^\x20-\x7E\n]/g, '') // remove non-printable ASCII chars
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

/**
 * Splits document text into structured overlapping chunks of 500-800 characters for RAG.
 */
export function chunkTextByCharacter(text, targetChunkSize = 600, overlap = 100) {
  const cleaned = cleanText(text);
  if (!cleaned) return [];

  const chunks = [];
  let start = 0;
  let index = 0;

  while (start < cleaned.length) {
    let end = start + targetChunkSize;

    // Boundary optimization: prefer paragraph break or sentence end
    if (end < cleaned.length) {
      const nextNewline = cleaned.indexOf('\n', end - 50);
      const nextPeriod = cleaned.indexOf('. ', end - 50);

      if (nextNewline !== -1 && nextNewline < end + 50) {
        end = nextNewline + 1;
      } else if (nextPeriod !== -1 && nextPeriod < end + 50) {
        end = nextPeriod + 1;
      }
    } else {
      end = cleaned.length;
    }

    const chunkContent = cleaned.slice(start, end).trim();

    if (chunkContent) {
      chunks.push({
        chunk_index: index,
        chunk_text: chunkContent,
        metadata: {
          char_length: chunkContent.length,
          word_count: chunkContent.split(/\s+/).filter(Boolean).length,
          start_char: start,
          end_char: end
        }
      });
      index++;
    }

    if (end >= cleaned.length) break;
    start = Math.max(start + 1, end - overlap);
  }

  return chunks;
}

/**
 * Alias for legacy word chunker to maintain backwards compatibility
 */
export function chunkText(text, chunkSize = 150, overlap = 30) {
  return chunkTextByCharacter(text, 600, 100);
}

/**
 * Performs relevance search across medical records for a specific pet.
 * Uses text & keyword matching when vector embeddings are null.
 */
export function searchRelevantChunks(query, petId, medicalRecords = [], limit = 3, userId = 'anonymous') {
  if (!query || !petId || !medicalRecords.length) {
    return [];
  }

  const petRecords = medicalRecords.filter(r => String(r.user_id || userId) === String(userId) && String(r.pet_id) === String(petId));
  if (!petRecords.length) return [];

  const queryTerms = query.toLowerCase().split(/\W+/).filter(t => t.length > 2);
  const scoredChunks = [];

  petRecords.forEach(record => {
    const fullContent = `${record.title}\n${record.notes || ''}\n${record.extracted_text || ''}`;
    const chunks = chunkTextByCharacter(fullContent, 600, 100);

    chunks.forEach(chunk => {
      const chunkLower = chunk.chunk_text.toLowerCase();
      let score = 0;

      queryTerms.forEach(term => {
        if (chunkLower.includes(term)) {
          score += 1.5;
        }
      });

      if (chunkLower.includes('allergy') || chunkLower.includes('dermatitis') || chunkLower.includes('blood') || chunkLower.includes('vaccine')) {
        score += 0.5;
      }

      if (score > 0) {
        scoredChunks.push({
          ...chunk,
          medical_record_id: record.id,
          title: record.title,
          category: record.category,
          record_date: record.record_date,
          similarity: Math.min(0.98, 0.65 + score * 0.08)
        });
      }
    });
  });

  scoredChunks.sort((a, b) => b.similarity - a.similarity);
  return scoredChunks.slice(0, limit);
}

/**
 * Helper to simulate real document text extraction from PDF/JPG/PNG files.
 */
export async function extractTextFromFile(file, category, title) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const fileName = file?.name || `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`;
      const defaultText = `MEDICAL REPORT FILE: ${title.toUpperCase()}
Category: ${category}
Source Document: ${fileName}
Recorded Date: ${new Date().toISOString().split('T')[0]}

CLINICAL EVALUATION & VETERINARY FINDINGS:
Patient presented for routine health screening and diagnostic evaluation.
Physical Examination: Patient alert, responsive, hydrated. Mucous membranes pink, CRT < 2 seconds.
Thoracic Auscultation: Heart rate regular, no cardiac murmurs or arrhythmia detected. Lungs clear bilaterally with normal respiratory effort.
Abdominal Palpation: Soft, non-painful, no organomegaly or palpable masses.
Diagnostic Notes: Laboratory parameters and vital signs evaluated. No immediate critical pathology detected.
Recommendations: Maintain standard preventive care schedule and monitor appetite, hydration, and activity levels.`;
      
      resolve(cleanText(defaultText));
    }, 800);
  });
}
