# ADK graph handoff + human approval

A runnable Google ADK 2.11 example using a graph workflow:

1. `research_agent` returns a validated `ResearchBrief`.
2. `planner_agent` accepts that typed value and returns a `ChangePlan`.
3. `approval_agent` accepts the plan and offers a confirmation-gated tool.
4. `record_release` updates demo session state only after the human gate allows the tool to run.

The demo does not deploy software or call an external system.

## Run in ADK Web

Use Python 3.10 or later. From the portfolio repository root:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r examples/adk_handoff_hitl/requirements.txt
$env:GOOGLE_API_KEY = "your-key"
adk web examples/adk_handoff_hitl
```

In ADK Web, ask the agent to draft a plan, then ask it to record the plan. The
`FunctionTool(require_confirmation=True)` gate presents an approval step before
`record_release` runs. The confirmation request arrives in ADK Web; no custom
approval service is needed for this local demo. The model deciding to call the
tool and the human approving the tool are separate decisions.

## Offline tests

The tests do not call a model or need an API key:

```powershell
python -m pip install -r examples/adk_handoff_hitl/requirements-test.txt
python -m pytest -q examples/adk_handoff_hitl/test_agent.py
```

## Waiting and production notes

ADK does not specify a universal maximum time for a human decision. Set an
application-level expiry, notify the approver, and define whether an expired
request is cancelled or escalated. Keep the paused session available for that
period. The current tool-confirmation documentation lists
`DatabaseSessionService` and `VertexAiSessionService` as unsupported for this
feature; check the documentation for the exact ADK release and session service
you deploy.

For work that takes longer than a human approval interaction, enqueue the work
in a separate service and use `LongRunningFunctionTool` to return an operation
ID. Poll or receive job status outside the agent request, then send an
intermediate or final function response to continue the workflow. Avoid holding
an HTTP request open while a person decides.

## Sources

- [Graph workflows](https://adk.dev/graphs/)
- [Graph data handling and typed handoffs](https://adk.dev/graphs/data-handling/)
- [Function tools, long-running tools, and AgentTool](https://adk.dev/tools-custom/function-tools/)
- [Tool confirmation](https://adk.dev/tools-custom/confirmation/)
- [Events and state deltas](https://adk.dev/events/)