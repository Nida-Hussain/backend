/**
 * Extract text content from file buffer
 * For production, integrate with pdf-parse, mammoth, etc.
 * This is a simplified version that handles plain text
 */
const extractTextFromFile = (buffer, mimetype) => {
  if (mimetype === "text/plain") {
    return buffer.toString("utf-8");
  }

  // For PDF/DOC files, return a placeholder
  // In production, use 'pdf-parse' for PDFs and 'mammoth' for DOCX
  return buffer.toString("utf-8").replace(/[^\x20-\x7E\n]/g, " ");
};

module.exports = { extractTextFromFile };
