// ======================================================
// File Name : defaultAssetEntry.js
// Purpose   : Assets that were loaded as default/seed data (or created
//             before the ledger existed) have no posted "Addition" in the
//             ledger, so their Transactions and Audit Trail tabs looked
//             empty or incomplete while other assets had history.
//             This adds ONE read-only "created by default" entry (shown as
//             the oldest line) whenever the ledger has no Addition for the
//             asset, so every asset starts its history the same way.
//             Nothing is written to the database.
// ======================================================

import { formatCurrency } from './formatCurrency';
import { formatDate } from './formatDate';

export const DEFAULT_CREATED_BY = 'system (default)';

// ======================================================
// Function : buildDefaultEntry
// Purpose  : Builds a transaction-shaped object (same shape the ledger
//            returns) describing how the asset first came to exist.
// ======================================================

export function buildDefaultEntry(asset) {
    const tfp = asset.taxFactPattern ?? {};
    const rows = [
        { label: 'Description', value: asset.description || '—' },
        { label: 'Asset Class', value: asset.assetClass || '—' },
        { label: 'Company', value: asset.company || '—' },
        { label: 'Cost', value: formatCurrency(asset.cost ?? 0), emphasize: true },
        tfp.placedInService && { label: 'Placed In Service', value: formatDate(tfp.placedInService) },
        (tfp.method || asset.method) && { label: 'Method', value: tfp.method || asset.method },
        tfp.recoveryPeriod && { label: 'Recovery Period', value: tfp.recoveryPeriod }
    ].filter(Boolean);
    return {
        transactionId: `default-${asset.assetNumber}`,
        assetNumber: asset.assetNumber,
        eventType: 'Addition',
        isDefault: true,
        postedAt: null,
        postedBy: DEFAULT_CREATED_BY,
        fields: {},
        preview: {
            badgeText: 'Created by default',
            badgeTone: 'gray',
            rows,
            formulaNote: 'This asset was created by default (loaded with the system), not posted through a lifecycle event, so there is no calculation to replay. Events posted later appear above this entry.',
            sections: []
        }
    };
}

// ======================================================
// Function : withDefaultCreationEntry
// Purpose  : Appends the default entry (oldest, so last in a newest-first
//            list) when the ledger holds no Addition for this asset.
// ======================================================

export function withDefaultCreationEntry(items, asset) {
    if (!asset || !Array.isArray(items)) return items;
    if (items.some((t) => t.eventType === 'Addition')) return items;
    return [...items, buildDefaultEntry(asset)];
}
