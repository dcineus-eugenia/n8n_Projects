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

## Skills

Claude skills used to design and review this project, in `skills/` (source: [MyDevOpsSkills](https://github.com/dcineus-eugenia/MyDevOpsSkills)):

- [devops-skill-interview](skills/devops-skill-interview/SKILL.md) — needs scoping → functional & technical spec
- [doubt-driven-development](skills/doubt-driven-development/SKILL.md) — technical decisions with falsifiable failure hypotheses
- [hostile-review](skills/hostile-review/SKILL.md) — adversarial review of code, architecture, config
- [cyber-defense](skills/cyber-defense/SKILL.md) — threat model, GDPR/NIS2/DORA compliance, cyber risk matrix
