/**
 * Fuzzy Search Engine for Command Palette
 *
 * Fast, character-by-character fuzzy matching with scoring and highlighting.
 * Inspired by fzf/Sublime Text algorithms.
 */

export interface FuzzyMatch {
  score: number;
  matches: number[]; // Indices of matched characters
}

/**
 * Performs fuzzy matching of a query against a target string.
 * Returns null if no match, or a FuzzyMatch with score and match positions.
 *
 * Scoring factors:
 * - Exact match: +100
 * - Starts with query: +80
 * - Consecutive characters: +15 per consecutive char
 * - Character at word boundary: +10
 * - Earlier match position: +5 (bonus decreases with position)
 * - Gap penalty: -3 per gap between matched chars
 */
export function fuzzyMatch(query: string, target: string): FuzzyMatch | null {
  if (!query) return { score: 0, matches: [] };
  if (!target) return null;

  const queryLower = query.toLowerCase();
  const targetLower = target.toLowerCase();

  // Quick check: all query chars must exist in target
  let checkIndex = 0;
  for (const char of queryLower) {
    const foundIndex = targetLower.indexOf(char, checkIndex);
    if (foundIndex === -1) return null;
    checkIndex = foundIndex + 1;
  }

  // Exact match (case-insensitive)
  if (targetLower === queryLower) {
    return {
      score: 100 + target.length,
      matches: Array.from({ length: target.length }, (_, i) => i),
    };
  }

  // Find best match using recursive search with memoization
  const result = findBestMatch(queryLower, targetLower, 0, 0, new Map());
  if (!result) return null;

  // Calculate final score
  let score = 0;
  const { matches } = result;

  // Starts with bonus
  if (matches[0] === 0) {
    score += 80;
  }

  // Position bonus (earlier is better)
  score += Math.max(0, 20 - matches[0] * 2);

  // Consecutive character bonus
  let consecutiveCount = 0;
  for (let i = 1; i < matches.length; i++) {
    if (matches[i] === matches[i - 1] + 1) {
      consecutiveCount++;
      score += 15;
    } else {
      // Gap penalty
      const gap = matches[i] - matches[i - 1] - 1;
      score -= gap * 3;
    }
  }

  // Word boundary bonus (matching at start of words)
  const wordBoundaries = getWordBoundaries(target);
  for (const matchIndex of matches) {
    if (wordBoundaries.has(matchIndex)) {
      score += 10;
    }
  }

  // Length ratio bonus (shorter targets score higher for same match)
  score += Math.max(0, 10 - (target.length - query.length));

  return { score, matches };
}

/**
 * Recursively finds the best match positions for query in target.
 */
function findBestMatch(
  query: string,
  target: string,
  queryIndex: number,
  targetIndex: number,
  memo: Map<string, number[] | null>
): { matches: number[] } | null {
  // Base case: all query chars matched
  if (queryIndex === query.length) {
    return { matches: [] };
  }

  // Base case: no more target chars
  if (targetIndex === target.length) {
    return null;
  }

  const memoKey = `${queryIndex}-${targetIndex}`;
  if (memo.has(memoKey)) {
    const cached = memo.get(memoKey);
    return cached ? { matches: cached } : null;
  }

  const queryChar = query[queryIndex];
  let bestMatch: number[] | null = null;
  let bestScore = -Infinity;

  // Try each possible position for current query char
  for (let i = targetIndex; i < target.length; i++) {
    if (target[i] === queryChar) {
      const rest = findBestMatch(query, target, queryIndex + 1, i + 1, memo);
      if (rest) {
        const matches = [i, ...rest.matches];
        const score = calculateMatchScore(matches, target);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = matches;
        }
      }
    }
  }

  memo.set(memoKey, bestMatch);
  return bestMatch ? { matches: bestMatch } : null;
}

/**
 * Quick score calculation for comparing match candidates
 */
function calculateMatchScore(matches: number[], target: string): number {
  let score = 0;

  // Earlier matches are better
  score -= matches[0] * 2;

  // Consecutive matches bonus
  for (let i = 1; i < matches.length; i++) {
    if (matches[i] === matches[i - 1] + 1) {
      score += 10;
    } else {
      score -= (matches[i] - matches[i - 1]) * 2;
    }
  }

  // Word boundary bonus
  const boundaries = getWordBoundaries(target);
  for (const m of matches) {
    if (boundaries.has(m)) score += 5;
  }

  return score;
}

/**
 * Returns indices that are word boundaries (start of word)
 */
function getWordBoundaries(text: string): Set<number> {
  const boundaries = new Set<number>();
  boundaries.add(0); // First char is always a boundary

  for (let i = 1; i < text.length; i++) {
    const prev = text[i - 1];
    const curr = text[i];

    // After space, hyphen, underscore, or case change
    if (
      prev === ' ' || prev === '-' || prev === '_' || prev === '/' ||
      (prev === prev.toLowerCase() && curr === curr.toUpperCase())
    ) {
      boundaries.add(i);
    }
  }

  return boundaries;
}

/**
 * Highlights matched characters in text.
 * Returns an array of segments with { text, highlighted } properties.
 */
export interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

export function highlightMatches(
  text: string,
  matches: number[]
): HighlightSegment[] {
  if (!matches.length) {
    return [{ text, highlighted: false }];
  }

  const segments: HighlightSegment[] = [];
  const matchSet = new Set(matches);
  let currentSegment = '';
  let isHighlighted = matchSet.has(0);

  for (let i = 0; i < text.length; i++) {
    const charIsMatch = matchSet.has(i);

    if (charIsMatch !== isHighlighted) {
      if (currentSegment) {
        segments.push({ text: currentSegment, highlighted: isHighlighted });
      }
      currentSegment = text[i];
      isHighlighted = charIsMatch;
    } else {
      currentSegment += text[i];
    }
  }

  if (currentSegment) {
    segments.push({ text: currentSegment, highlighted: isHighlighted });
  }

  return segments;
}

/**
 * Search a list of items and return sorted results.
 */
export interface SearchableItem {
  id: string;
  name: string;
  type?: string;
  keywords?: string[];
}

export interface SearchResult<T extends SearchableItem> {
  item: T;
  score: number;
  matches: number[];
}

export function searchItems<T extends SearchableItem>(
  query: string,
  items: T[],
  options?: {
    maxResults?: number;
    recentIds?: string[];
    frequentIds?: Map<string, number>;
  }
): SearchResult<T>[] {
  const { maxResults = 50, recentIds = [], frequentIds = new Map() } = options ?? {};

  if (!query.trim()) {
    // Return recent items when no query
    const recentSet = new Set(recentIds);
    const recentItems = items
      .filter(item => recentSet.has(item.id))
      .sort((a, b) => recentIds.indexOf(a.id) - recentIds.indexOf(b.id))
      .slice(0, maxResults);

    return recentItems.map(item => ({
      item,
      score: 0,
      matches: [],
    }));
  }

  const results: SearchResult<T>[] = [];

  for (const item of items) {
    // Match against name
    const nameMatch = fuzzyMatch(query, item.name);
    if (nameMatch) {
      let score = nameMatch.score;

      // Boost recent items
      const recentIndex = recentIds.indexOf(item.id);
      if (recentIndex !== -1) {
        score += Math.max(0, 20 - recentIndex * 2);
      }

      // Boost frequent items
      const frequency = frequentIds.get(item.id) ?? 0;
      score += Math.min(frequency * 2, 20);

      results.push({
        item,
        score,
        matches: nameMatch.matches,
      });
      continue;
    }

    // Match against keywords
    if (item.keywords) {
      for (const keyword of item.keywords) {
        const keywordMatch = fuzzyMatch(query, keyword);
        if (keywordMatch) {
          results.push({
            item,
            score: keywordMatch.score * 0.7, // Keywords match with lower priority
            matches: [], // Don't highlight keyword matches in name
          });
          break;
        }
      }
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, maxResults);
}
