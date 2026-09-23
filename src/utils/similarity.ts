import { Complaint, LocationInfo } from '../types/complaint';

/**
 * Tokenizes and normalizes text for keyword matching.
 */
function tokenize(text: string): Set<string> {
  const clean = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .trim();
  const words = clean.split(/\s+/).filter((w) => w.length > 2);
  return new Set(words);
}

/**
 * Calculates Jaccard similarity between two sets of words.
 */
function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) {
      intersectionCount++;
    }
  }
  const unionCount = new Set([...setA, ...setB]).size;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

export interface DuplicateMatch {
  complaint: Complaint;
  score: number; // 0 - 100
  reasons: string[];
}

/**
 * Checks a draft complaint against existing complaints to identify duplicates.
 * Only compares against unresolved complaints (SUBMITTED, UNDER_REVIEW, ASSIGNED, IN_PROGRESS).
 */
export function findPotentialDuplicates(
  draft: {
    title: string;
    description: string;
    category: string;
    location: LocationInfo;
  },
  existingComplaints: Complaint[],
  threshold = 55
): DuplicateMatch[] {
  const unresolved = existingComplaints.filter(
    (c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED'
  );

  const draftTitleTokens = tokenize(draft.title);
  const draftDescTokens = tokenize(draft.description);
  const draftBuilding = draft.location.building.trim().toLowerCase();
  const draftFloor = draft.location.floor.trim().toLowerCase();
  const draftRoom = draft.location.roomArea.trim().toLowerCase();

  const matches: DuplicateMatch[] = [];

  for (const complaint of unresolved) {
    let score = 0;
    const reasons: string[] = [];

    // 1. Category match (Weight: 25)
    if (complaint.category === draft.category) {
      score += 25;
      reasons.push('Same issue category');
    }

    // 2. Building match (Weight: 20)
    const compBuilding = complaint.location.building.trim().toLowerCase();
    if (compBuilding && draftBuilding && compBuilding === draftBuilding) {
      score += 20;
      reasons.push(`Same building (${complaint.location.building})`);
    }

    // 3. Floor & Room match (Weight: 25)
    const compFloor = complaint.location.floor.trim().toLowerCase();
    const compRoom = complaint.location.roomArea.trim().toLowerCase();
    if (compFloor && draftFloor && compFloor === draftFloor) {
      score += 10;
    }
    if (compRoom && draftRoom && (compRoom === draftRoom || compRoom.includes(draftRoom) || draftRoom.includes(compRoom))) {
      score += 15;
      reasons.push(`Same room/area (${complaint.location.roomArea})`);
    }

    // 4. Text similarity (Weight: 30)
    const compTitleTokens = tokenize(complaint.title);
    const compDescTokens = tokenize(complaint.description);

    const titleSim = jaccardSimilarity(draftTitleTokens, compTitleTokens);
    const descSim = jaccardSimilarity(draftDescTokens, compDescTokens);
    const textSim = Math.max(titleSim, (titleSim + descSim) / 2);

    if (textSim > 0.3) {
      const textPoints = Math.round(textSim * 30);
      score += textPoints;
      reasons.push('Similar issue description keywords');
    }

    if (score >= threshold) {
      matches.push({
        complaint,
        score: Math.min(100, score),
        reasons,
      });
    }
  }

  // Sort highest score first
  return matches.sort((a, b) => b.score - a.score);
}
