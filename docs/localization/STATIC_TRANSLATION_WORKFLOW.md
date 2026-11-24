# Static localization workflow

The authoritative source language is `en-AU`. Runtime translation services are not used.

## Source inventory

Run `npm run i18n:extract` after changing public copy. The extractor:

- scans only public-facing JSX text, accessibility attributes, form options and content fields;
- excludes the authenticated Workspace interface, which is outside the public locale catalogue;
- excludes code, CSS classes, identifiers, URLs, email addresses, image paths and protected brand names;
- deduplicates identical source strings;
- assigns a stable identifier derived from the English source hash;
- records source locations;
- replaces prices, dates, durations and capacities with locked placeholders in the translation template.

The committed manifest is `src/locales/manifests/source.en-AU.json`.

## Resumable locale batches

Each future locale module should be generated in small batches keyed by the manifest entry ID. Non-core locale resources are loaded dynamically and are not part of the initial public bundle. A batch is complete only when:

1. every manifest ID has a non-English translation;
2. locked tokens exactly match the authoritative source;
3. accessibility and representative visual checks pass;
4. legal and contractual translations are labelled informational and link to the English authority;
5. the locale is marked `selectable: true` in `src/locales/catalog.js`.

If an English phrase changes, its hash and stable ID change. Unchanged entries retain their IDs and translations, so only the changed batch needs work.

Suggested batches: Portuguese and Spanish; CJK (`zh-Hans`, `zh-Hant`, `yue`, `ja`, `ko`); South Asian (`hi`, `pa`, `ne`, `ta`, `ur`, `bn`); Southeast Asian (`vi`, `fil`, `th`, `id`); European; Middle Eastern and Pacific.
