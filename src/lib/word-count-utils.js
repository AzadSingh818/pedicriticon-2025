// src/lib/word-count-utils.js

// 🚀 UPDATED: Only 4 presentation types as required
export const WORD_LIMITS = {
  'Award Paper': 300,              // ✅ 300 words
  'Article': 300,                  // ✅ 300 words  
  'Case Report': 300,              // ✅ 300 words
  'Poster': 300,                   // ✅ 300 words (changed from 500)
  
  // 🚀 FALLBACK MAPPINGS - Handle different dropdown values
  'award paper': 300,              // lowercase version
  'article': 300,                  // lowercase version
  'case report': 300,              // lowercase version
  'poster': 300,                   // lowercase version
  'AWARD PAPER': 300,              // uppercase version
  'ARTICLE': 300,                  // uppercase version
  'CASE REPORT': 300,              // uppercase version
  'POSTER': 300,                   // uppercase version
};

/**
 * Count words in text (medical abstract optimized)
 * Handles medical terminology, abbreviations, numbers
 */
export const countWords = (text) => {
  if (!text || typeof text !== 'string') return 0;
  
  // Remove extra whitespace and trim
  const cleanText = text.trim().replace(/\s+/g, ' ');
  
  // If empty after cleaning, return 0
  if (!cleanText) return 0;
  
  // Split by spaces and filter out empty strings
  const words = cleanText.split(' ').filter(word => word.length > 0);
  
  return words.length;
};

/**
 * Get word limit for presentation type
 * 🚀 UPDATED: All types now have 300 word limit
 */
export const getWordLimit = (presentationType) => {
  if (!presentationType) return 300; // Default limit changed to 300
  
  // Normalize presentation type - handle different cases and variations
  const normalizedType = presentationType.toString().trim();
  
  // 🚀 NEW: Try exact match first, then try normalized versions
  if (WORD_LIMITS[normalizedType]) {
    return WORD_LIMITS[normalizedType];
  }
  
  // Try lowercase
  const lowerType = normalizedType.toLowerCase();
  if (WORD_LIMITS[lowerType]) {
    return WORD_LIMITS[lowerType];
  }
  
  // Try uppercase  
  const upperType = normalizedType.toUpperCase();
  if (WORD_LIMITS[upperType]) {
    return WORD_LIMITS[upperType];
  }
  
  // 🚀 ALL TYPES ARE 300 WORDS - Simple fallback
  return 300;
};

/**
 * Validate word count against limit
 */
export const validateWordCount = (text, presentationType) => {
  const wordCount = countWords(text);
  const limit = getWordLimit(presentationType);
  
  return {
    wordCount,
    limit,
    isValid: wordCount <= limit,
    remaining: limit - wordCount,
    percentage: Math.min((wordCount / limit) * 100, 100)
  };
};

/**
 * Get status color based on word count
 */
export const getWordCountStatus = (wordCount, limit) => {
  const percentage = (wordCount / limit) * 100;
  
  if (percentage <= 70) {
    return {
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
      status: 'good'
    };
  } else if (percentage <= 90) {
    return {
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-300',
      status: 'warning'
    };
  } else if (percentage <= 100) {
    return {
      color: 'text-orange-600',
      bgColor: 'bg-orange-100', 
      borderColor: 'border-orange-300',
      status: 'near-limit'
    };
  } else {
    return {
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300', 
      status: 'over-limit'
    };
  }
};

/**
 * Get progress bar color
 */
export const getProgressColor = (percentage) => {
  if (percentage <= 70) return 'bg-green-500';
  if (percentage <= 90) return 'bg-yellow-500';
  if (percentage <= 100) return 'bg-orange-500';
  return 'bg-red-500';
};

/**
 * Format word count message
 */
export const getWordCountMessage = (wordCount, limit, presentationType) => {
  const remaining = limit - wordCount;
  
  if (wordCount === 0) {
    return `Start typing your ${presentationType} abstract (${limit} words maximum)`;
  }
  
  if (remaining > 0) {
    return `${wordCount} of ${limit} words used (${remaining} remaining)`;
  } else if (remaining === 0) {
    return `Perfect! Exactly ${limit} words used`;
  } else {
    return `Over limit by ${Math.abs(remaining)} words. Please reduce to ${limit} words maximum.`;
  }
};

/**
 * Extract words for preview (first N words)
 */
export const getWordPreview = (text, maxWords = 50) => {
  const words = text.trim().split(/\s+/).slice(0, maxWords);
  return words.join(' ') + (countWords(text) > maxWords ? '...' : '');
};

/**
 * Get detailed validation with suggestions
 */
export const getDetailedValidation = (text, presentationType) => {
  const validation = validateWordCount(text, presentationType);
  const status = getWordCountStatus(validation.wordCount, validation.limit);
  
  return {
    ...validation,
    ...status,
    suggestion: getSuggestion(validation),
    canSubmit: validation.isValid && validation.wordCount > 0
  };
};

/**
 * Get helpful suggestions based on word count
 */
export const getSuggestion = (validation) => {
  const { wordCount, limit, percentage, isValid } = validation;
  
  if (wordCount === 0) {
    return `Please enter your abstract content. You have ${limit} words available.`;
  }
  
  if (!isValid) {
    return `Please reduce by ${Math.abs(validation.remaining)} words to meet the ${limit}-word limit.`;
  }
  
  if (percentage >= 85) {
    return `You're close to the limit with ${validation.remaining} words remaining. Consider reviewing for conciseness.`;
  }
  
  if (percentage >= 50 && percentage < 85) {
    return `Good length! ${wordCount} words used. Well-balanced for comprehensive review.`;
  }
  
  if (percentage < 50) {
    return `You have ${validation.remaining} more words available. Consider adding more detail.`;
  }
  
  return `${wordCount} words used out of ${limit} available.`;
};

// Export all limits for reference
export const getAllLimits = () => WORD_LIMITS;

// Check if presentation type is valid
export const isValidPresentationType = (presentationType) => {
  return Object.keys(WORD_LIMITS).includes(presentationType);
};