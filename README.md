# FinOps_n8n

Automated AWS Cloud FinOps Repport — n8n workflows for cloud cost (FinOps) reporting.

## Cloud Billing FinOps Report

`workflows/workflows/Cloud Billing FinOps Report.workflow.ts`

Pipeline:

1. **Manual trigger**
2. **AWS Cost Explorer** — `GetCostAndUsage` (NetAmortizedCost, month over month)
3. **AWS Cost Optimization Hub** — `ListRecommendations`
4. **Code** — computes month-over-month variation and aggregates savings recommendations
5. **Limit** — top 10 items
6. **Google Sheets** — append or update rows in the FinOps report sheet

### Credentials required (configured in n8n, not stored here)

- `AWS (IAM) account` — IAM user with `ce:GetCostAndUsage` and `cost-optimization-hub:ListRecommendations`
- `Google Sheets account` — OAuth2

### Sync

The workflow is stored as an n8n Workflow SDK file managed with `n8ncli`:

```sh
n8ncli init --url https://<instance>.app.n8n.cloud --access-token <token> \
  --project-id <project> --folder-id <folder> --dir workflows
n8ncli pull "Cloud Billing FinOps Report"
n8ncli push "Cloud Billing FinOps Report"
```

## RAG n8n : pdf

`workflows/workflows/RAG n8n _ pdf.workflow.ts`

Retrieval-augmented chat over any PDF with a text layer.

Ingestion:

1. **On form submission** — upload a PDF
2. **Extract from File** — extract the text
3. **Delete Previous Version** (Postgres) — remove passages already stored for the same file name
4. **Split Text Into Segments** (Code) — cut the text into segments of about 16,000 characters
5. **Loop Over Items** → **Supabase Vector Store** — split each segment into chunks (1,000 chars, 200 overlap), embed them with **Google Gemini Embeddings** and insert them into `documents` with `source` (file name) and `part` metadata
6. **Wait** — pause between segments to stay under the Gemini rate limit

Answering:

1. **When chat message received** → **Inputs** → **Get Session Messages** (Postgres) — question, session and history
2. **Routing** — Gemini rewrites the question as a standalone query with keywords and detects its language
3. **Search** — top 10 passages from Supabase (pgvector)
4. **Reranking** — Gemini keeps the 4 most useful passages
5. **Generation** — answer in the language of the question, from the passages only, naming the source file
6. **Save Messages** (Postgres) → **Chat Response**

The earlier AI Agent version (agent + vector store tool + Postgres Chat Memory) is still on the canvas, disconnected.

### Setup

- Run `supabase/schema.sql` in the Supabase SQL editor (tables `documents` and `n8n_chat_histories`, function `match_documents`, RLS enabled).
- Credentials required (configured in n8n, not stored here):
  - `Google Gemini(PaLM) Api` — Google AI Studio API key
  - `Supabase account` — project URL and `service_role` key
  - `Postgres account` — Supabase database connection (session pooler)
- Webhook IDs are removed from this file; n8n generates new ones on import.

### Limits

- Scanned PDFs without a text layer are not supported.
- On the Gemini free tier, embeddings are limited to 1,000 requests per day per model (one request per chunk).
- The upload form has no authentication: keep the workflow unpublished, or add authentication to the form before publishing.

## Skills

Claude skills used to design and review this project, in `skills/` (source: [MyDevOpsSkills](https://github.com/dcineus-eugenia/MyDevOpsSkills)):

- [devops-skill-interview](skills/devops-skill-interview/SKILL.md) — needs scoping → functional & technical spec
- [doubt-driven-development](skills/doubt-driven-development/SKILL.md) — technical decisions with falsifiable failure hypotheses
- [hostile-review](skills/hostile-review/SKILL.md) — adversarial review of code, architecture, config
- [cyber-defense](skills/cyber-defense/SKILL.md) — threat model, GDPR/NIS2/DORA compliance, cyber risk matrix
