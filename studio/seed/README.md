# Seed content

`people.ndjson` — the 29 contributors of Issues 0, 1 and 2, as Person entries.

To load them into the CMS (once; safe to repeat):

    cd studio
    npx sanity dataset import seed/people.ndjson production --replace

`--replace` overwrites these same entries if they already exist (they have
fixed ids, `person-…`); it does not touch anything else.
