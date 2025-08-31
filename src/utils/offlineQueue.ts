// Lightweight offline queue for form submissions using localStorage
// For production, consider migrating to IndexedDB (e.g., Dexie) for larger, more reliable storage.

export type SubmissionPayload = {
  entityId: string;
  entityType: string; // "project" | "subproject" | "activity"
  data: Record<string, any>;
  latitude: number;
  longitude: number;
};

export type QueuedSubmission = {
  id: string; // unique client id
  templateId: string;
  payload: SubmissionPayload;
  capturedAt: string; // ISO date
};

const STORAGE_KEY = "form_submissions_queue";

function getQueue(): QueuedSubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function setQueue(q: QueuedSubmission[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(q));
  } catch (_) {
    // no-op
  }
}

export function enqueueSubmission(
  templateId: string,
  payload: SubmissionPayload,
  capturedAt?: string
): QueuedSubmission {
  const item: QueuedSubmission = {
    id: crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    templateId,
    payload,
    capturedAt: capturedAt || new Date().toISOString(),
  };
  const q = getQueue();
  q.push(item);
  setQueue(q);
  return item;
}

export function peekQueue(): QueuedSubmission[] {
  return getQueue();
}

export function clearQueue() {
  setQueue([]);
}

export async function flushQueue(
  submit: (templateId: string, payload: SubmissionPayload) => Promise<void>
): Promise<{ successes: number; failures: number }> {
  const q = getQueue();
  if (q.length === 0) return { successes: 0, failures: 0 };

  const remaining: QueuedSubmission[] = [];
  let successes = 0;
  let failures = 0;

  for (const item of q) {
    try {
      await submit(item.templateId, item.payload);
      successes += 1;
    } catch (_) {
      remaining.push(item);
      failures += 1;
    }
  }

  setQueue(remaining);
  return { successes, failures };
}
