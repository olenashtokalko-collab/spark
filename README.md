# Spark client portal: prototype

Interactive React prototype of the client workspace Spark Studios wants for its customers: brand documents, an AI assistant with sources, requests created from conversations, and proposal review and approval.

```bash
npm install
npm run dev
```

Open http://localhost:5173. The profile menu (top right) has Team, theme and Log out. To reset the demo data, clear the site's local storage in the browser.

- [docs/01-product-definition.md](docs/01-product-definition.md): research summary, MVP scope (discussed / recommended / deferred), roles, IA, journeys
- [docs/02-implementation.md](docs/02-implementation.md): demo script, screens, code structure, data model, integrations, limitations
- `spark-research.html`: earlier research dossier (8 Oct 2026)

The client brand (Brand Co.) is a neutral placeholder; people and numbers are fictional. The visual system is neutral and token-based (`src/styles/tokens.css`) so Spark's final branding can replace it.
