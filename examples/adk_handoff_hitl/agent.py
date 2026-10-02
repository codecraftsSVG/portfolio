"""A sequential ADK pipeline with an explicit human approval gate."""

import os
from typing import Any

from google.adk import Agent, Workflow
from google.adk.tools.function_tool import FunctionTool
from google.adk.tools.tool_context import ToolContext
from google.adk.workflow import START
from pydantic import BaseModel

MODEL = os.getenv("ADK_MODEL", "gemini-2.5-flash")


class ResearchBrief(BaseModel):
    summary: str
    constraints: list[str]


class ChangePlan(BaseModel):
    summary: str
    actions: list[str]
    risk: str


def record_release(plan: str, tool_context: ToolContext) -> dict[str, Any]:
    """Record an approved plan in session state; this demo does not deploy."""
    if not plan.strip():
        return {"status": "rejected", "reason": "The plan must not be empty."}

    release_number = tool_context.state.get("demo_release_count", 0) + 1
    release_id = f"demo-{release_number}"
    tool_context.state["demo_release_count"] = release_number
    tool_context.state["demo_last_release"] = {
        "release_id": release_id,
        "plan": plan,
    }
    return {
        "status": "recorded_after_approval",
        "release_id": release_id,
        "plan": plan,
        "external_deployment": False,
    }


research_agent = Agent(
    name="research_agent",
    model=MODEL,
    description="Extracts the request, constraints, and relevant facts.",
    instruction=(
        "Summarize the user's requested change and constraints in a short, "
        "factual brief. Do not propose or execute changes. Return only the "
        "fields required by the ResearchBrief schema."
    ),
    output_schema=ResearchBrief,
)

planner_agent = Agent(
    name="planner_agent",
    model=MODEL,
    description="Turns the research brief into a reviewable plan.",
    input_schema=ResearchBrief,
    output_schema=ChangePlan,
    instruction=(
        "Use the research brief summary {ResearchBrief.summary} and constraints "
        "{ResearchBrief.constraints}. Write a concise, reversible plan. List "
        "intended actions and risks. Do not execute anything. Return only the "
        "fields required by the ChangePlan schema."
    ),
)

approval_agent = Agent(
    name="approval_agent",
    model=MODEL,
    description="Requests explicit human confirmation before recording a plan.",
    input_schema=ChangePlan,
    instruction=(
        "Review this proposed plan: {ChangePlan.summary}. Actions: "
        "{ChangePlan.actions}. Risk: {ChangePlan.risk}.\n"
        "If the user asks to execute it, call record_release with the exact plan. "
        "The tool has a separate human-confirmation gate: never claim it was "
        "recorded unless the tool returns status 'recorded_after_approval'. "
        "If the user declines, do not call the tool. This is a demo ledger, "
        "not a real deployment system."
    ),
    tools=[FunctionTool(func=record_release, require_confirmation=True)],
)

root_agent = Workflow(
    name="handoff_approval_pipeline",
    edges=[(START, research_agent, planner_agent, approval_agent)],
)