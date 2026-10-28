// ======================================================
// File Name : lifecycleCompute.ts
// Purpose   : THE one place a lifecycle event is calculated. UI preview, Bulk Import,
//             Bulk Post, the Service API and the AI agent all call computeLifecycleEvent(),
//             so the same inputs always give the same amounts everywhere.
//             Steps: (1) blank fields are filled from the Asset Register (never
//             overwriting what the caller sent), (2) the shared calc-engine runs
//             (calculateLifecyclePreview auto-fills blank Bonus % / Life like the UI).
// ======================================================

import { findAsset } from '../data/assets.js';
import { getEngineAssetConfig } from './assetTypeConfig.js';
import { calculateLifecyclePreview } from './depreciation.js';
import { fillFromRegister } from './registerPrefill.js';
import type { LifecyclePreviewInput, LifecyclePreviewResult } from '../types.js';

export interface ComputedLifecycleEvent {
  input: LifecyclePreviewInput;
  preview: LifecyclePreviewResult;
}

// ======================================================
// Function : computeLifecycleEvent
// Purpose  : Register pre-fill + calculation in one call; returns the final input and the preview.
// ======================================================

export function computeLifecycleEvent(
  eventType: LifecyclePreviewInput['eventType'],
  assetNumber: string,
  given: Record<string, unknown> | undefined
): ComputedLifecycleEvent {
  const fields = fillFromRegister(
    eventType,
    findAsset((assetNumber ?? '').trim()),
    (given ?? {}) as Record<string, unknown>,
    getEngineAssetConfig()
  ) as LifecyclePreviewInput['fields'];
  const input: LifecyclePreviewInput = { eventType, assetNumber: assetNumber ?? '', fields };
  return { input, preview: calculateLifecyclePreview(input) };
}

// ======================================================
// END: computeLifecycleEvent
// ======================================================

// ======================================================
// END OF FILE : lifecycleCompute.ts
// ======================================================
