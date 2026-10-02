from types import SimpleNamespace

from google.adk import Workflow

from examples.adk_handoff_hitl.agent import (
    ChangePlan,
    ResearchBrief,
    approval_agent,
    planner_agent,
    record_release,
    research_agent,
    root_agent,
)


def test_graph_passes_typed_values_between_agents():
    assert isinstance(root_agent, Workflow)
    assert research_agent.output_schema is ResearchBrief
    assert planner_agent.input_schema is ResearchBrief
    assert planner_agent.output_schema is ChangePlan
    assert approval_agent.input_schema is ChangePlan
    assert "{ResearchBrief.summary}" in planner_agent.instruction
    assert "{ChangePlan.summary}" in approval_agent.instruction


def test_record_release_updates_only_demo_session_state():
    context = SimpleNamespace(state={})

    result = record_release("Deploy the reviewed patch", context)

    assert result["status"] == "recorded_after_approval"
    assert result["external_deployment"] is False
    assert context.state["demo_release_count"] == 1
    assert context.state["demo_last_release"]["plan"] == "Deploy the reviewed patch"


def test_empty_plan_is_not_recorded():
    context = SimpleNamespace(state={})

    result = record_release("  ", context)

    assert result["status"] == "rejected"
    assert context.state == {}


def test_release_tool_is_configured_for_human_confirmation():
    release_tool = approval_agent.tools[0]
    assert release_tool._require_confirmation is True