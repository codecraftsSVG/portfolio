import Link from "next/link";
import type { Metadata } from "next";

import styles from "../adk-state-rewind-resume/article.module.css";

const exampleUrl = "https://github.com/codecraftsSVG/portfolio/tree/main/examples/adk_handoff_hitl";

export const metadata: Metadata = {
  title: "ADK Agent Handoffs, Data Passing, and Human Approval | S. Vamshidhar Goud",
  description:
    "A source-grounded guide to Google ADK agent communication, typed workflow data, human approval, and realistic wait-time handling.",
  openGraph: {
    title: "ADK Agent Handoffs, Data Passing, and Human Approval",
    description: "A tested Google ADK 2.11 example with graph workflows and a human confirmation gate.",
    type: "article",
    publishedTime: "2026-10-02T00:00:00Z",
    authors: ["S. Vamshidhar Goud"],
  },
};

export default function AdkHandoffsArticle() {
  return (
    <main className={styles.articlePage}>
      <div className={styles.articleTexture} aria-hidden="true" />
      <div className={styles.articleShell}>
        <header className={styles.topbar}>
          <Link className={styles.wordmark} href="/">SVG / FIELD NOTES</Link>
          <Link className={styles.backLink} href="/">Portfolio <span aria-hidden="true">↗</span></Link>
        </header>

        <article className={styles.article}>
          <header className={styles.articleHeader}>
            <p className={styles.eyebrow}><span /> GOOGLE ADK / MULTI-AGENT SYSTEMS</p>
            <h1>How ADK agents hand off work, pass values, and wait for a human.</h1>
            <p className={styles.dek}>
              A practical tour of transfers, tool-style delegation, typed workflow data, approval gates, and what
              “waiting for a human” actually means in a running application.
            </p>
            <div className={styles.byline}>
              <span>S. Vamshidhar Goud</span>
              <span>October 2, 2026</span>
              <span>9 minute read</span>
            </div>
          </header>

          <aside className={styles.summary} aria-label="Key distinction">
            <p className={styles.summaryLabel}>The short version</p>
            <p>
              Agents communicate through <strong>control transfer</strong>, <strong>tool return values</strong>,
              or <strong>workflow data</strong>. For a high-impact action, place approval at the tool boundary.
              ADK does not set a universal human wait limit; your application must define expiry, persistence, and
              what happens if nobody responds.
            </p>
          </aside>

          <nav className={styles.contents} aria-label="Article contents">
            <a href="#communication">Communication</a>
            <a href="#values">Passing values</a>
            <a href="#approval">Human approval</a>
            <a href="#waiting">Wait time</a>
            <a href="#example">Working example</a>
          </nav>

          <section className={styles.articleSection} id="communication">
            <p className={styles.sectionTag}>01 / CHOOSE A HANDOFF</p>
            <h2>“Agent-to-agent communication” can mean three different things.</h2>
            <p>
              Pick the control-flow shape first. Otherwise, it is easy to add a second agent when a plain function,
              a structured return value, or a deterministic workflow node would be simpler.
            </p>
            <div className={styles.scopeGrid}>
              <div><strong>Transfer</strong><span>Router hands the conversation to a specialist agent.</span></div>
              <div><strong>AgentTool</strong><span>Caller invokes a peer and receives its answer like a tool result.</span></div>
              <div><strong>Workflow</strong><span>Edges run agents/nodes in a developer-defined order.</span></div>
              <div><strong>State</strong><span>Nodes read/write shared session values and event data.</span></div>
            </div>
            <p>
              With a coordinator that has specialist <code>sub_agents</code>, the model can request a
              <code>transfer_to_agent</code>. That transfers responsibility: the specialist handles the next turn.
              With <code>AgentTool</code>, the specialist&apos;s response returns to the caller, which stays in control
              and can synthesize it. A graph <code>Workflow</code> instead makes the route explicit in code. These
              are different contracts, not interchangeable spellings of delegation. <a href="#source-patterns">[1]</a>
              <a href="#source-agent-tool">[2]</a> <a href="#source-graphs">[3]</a>
            </p>
            <div className={styles.codeFrame}>
              <p>PSEUDOCODE / CALL-AND-RETURN VS. TRANSFER</p>
              <pre><code>{`# AgentTool: child returns a result; parent continues
parent.tools = [AgentTool(agent=research_specialist)]

# Transfer: coordinator hands the conversation to a sub-agent
coordinator.sub_agents = [billing_agent, support_agent]
# The selected specialist owns the next response.`}</code></pre>
            </div>
          </section>

          <section className={styles.articleSection} id="values">
            <p className={styles.sectionTag}>02 / PASSING VALUES</p>
            <h2>Use typed outputs for a pipeline; use state for shared context.</h2>
            <p>
              For a deterministic chain, the current ADK graph API wires nodes with edges. Give an agent an
              <code>output_schema</code> and the next agent an <code>input_schema</code>; the workflow passes the
              node result forward. In graph workflows, function nodes can also return <code>Event(output=...)</code>,
              and an event&apos;s <code>state</code> can carry small values to downstream nodes.
              <a href="#source-graph-data">[4]</a>
            </p>
            <div className={styles.codeFrame}>
              <p>PSEUDOCODE / A TYPED AGENT-TO-AGENT PIPELINE</p>
              <pre><code>{`class ResearchBrief(BaseModel):
    summary: str
    constraints: list[str]

class ChangePlan(BaseModel):
    summary: str
    actions: list[str]
    risk: str

research = Agent(output_schema=ResearchBrief, ...)
planner = Agent(
    input_schema=ResearchBrief,
    output_schema=ChangePlan,
    instruction="Use {ResearchBrief.summary} and constraints.",
    ...,
)
root = Workflow(edges=[(START, research, planner, approval)])`}</code></pre>
            </div>
            <p>
              If you use the older prebuilt sequential template, <code>output_key</code> writes an agent result to
              session state, and later agents can read it. Scope temporary handoffs to the invocation with a
              <code>temp:</code> key; keep durable user or session data in the appropriate state scope. Current ADK
              graph workflows use typed node inputs/outputs and events for explicit data flow. Avoid storing large
              documents in state; store an artifact or external object reference instead. <a href="#source-sequential">[5]</a>
              <a href="#source-state">[6]</a>
            </p>
            <div className={styles.codeFrame}>
              <p>PSEUDOCODE / SMALL VALUES THROUGH SESSION STATE</p>
              <pre><code>{`# Tool/callback context
tool_context.state["temp:review_status"] = "passed"

# A later step in the same invocation reads the value
review_status = context.state.get("temp:review_status")`}</code></pre>
            </div>
            <p>
              Agent-as-tool has another option: pass explicit arguments to the tool-agent and receive its result
              directly, rather than coordinate through several state keys. Prefer that when the child is a bounded
              capability and the parent needs its response before continuing. <a href="#source-agent-tool">[2]</a>
              <a href="#source-graph-data">[4]</a>
            </p>
          </section>

          <section className={styles.articleSection} id="approval">
            <p className={styles.sectionTag}>03 / HUMAN APPROVAL</p>
            <h2>Put the approval check immediately before the side effect.</h2>
            <p>
              Instructions such as “ask me first” guide a model; they are not an enforcement boundary. ADK&apos;s Python
              <code>FunctionTool(require_confirmation=True)</code> inserts a confirmation step before the tool runs.
              ADK Web can show the approval prompt. A remote application can send the matching
              <code>FunctionResponse</code> through the API. For a structured decision, the tool can request a
              confirmation with a hint and payload, then inspect <code>tool_context.tool_confirmation</code> after
              the user responds. Tool confirmation is documented as experimental, so pin/test the ADK version you
              deploy. <a href="#source-confirmation">[7]</a>
            </p>
            <div className={styles.codeFrame}>
              <p>PYTHON / BLOCK UNLESS A HUMAN CONFIRMS</p>
              <pre><code>{`release_tool = FunctionTool(
    func=record_release,
    require_confirmation=True,
)

approval_agent = Agent(
    name="approval_agent",
    model="gemini-2.5-flash",
    input_schema=ChangePlan,
    tools=[release_tool],
    instruction=(
        "Show the proposed plan. Call record_release only when the user "
        "asks to apply it. The tool requires human confirmation."
    ),
)`}</code></pre>
            </div>
            <p>
              There are two gates here. The model may decide to call the tool; the confirmation mechanism then
              prevents the tool body from running until a human or trusted caller responds. The server must still
              authorize the action and validate the arguments. Never trust an approver identity or permission
              supplied in model-generated tool arguments. <a href="#source-confirmation">[7]</a>
            </p>
          </section>

          <section className={styles.articleSection} id="waiting">
            <p className={styles.sectionTag}>04 / HOW LONG DO I WAIT?</p>
            <h2>ADK sets no universal human-response timer. Your application does.</h2>
            <p>
              A confirmation pauses tool execution until a response arrives. The official docs do not promise a
              fixed maximum number of minutes for that human wait. In practice, the user may respond immediately,
              later in the same UI session, or not at all. Your UI, HTTP server, authentication/session backend,
              and business SLA determine how long a pending interaction remains usable.
            </p>
            <div className={styles.practiceList}>
              <div><span>01</span><p><strong>For a live approval dialog:</strong> keep it short and interactive; show exactly what will happen and let the person approve or reject.</p></div>
              <div><span>02</span><p><strong>For an approval that may take minutes or hours:</strong> persist a request ID and decision status in your application, notify the approver, and set your own expiry/escalation policy.</p></div>
              <div><span>03</span><p><strong>For a long-running job:</strong> enqueue the job, return its operation ID, and poll or receive status outside the agent request. Resume the workflow with a correlated response when ready.</p></div>
            </div>
            <p>
              Those are application design choices, not ADK defaults. In particular, the current confirmation docs
              list <code>DatabaseSessionService</code> and <code>VertexAiSessionService</code> as unsupported for
              that feature; verify backend support for the exact release in use. Don&apos;t promise a multi-hour wait
              just because the request has a session ID. <a href="#source-confirmation">[7]</a>
            </p>
            <div className={styles.codeFrame}>
              <p>PSEUDOCODE / A PRODUCT-OWNED DEADLINE</p>
              <pre><code>{`request_id = await approval_service.create(plan)
decision = await approval_service.wait_for_decision(
    request_id,
    timeout=APPROVAL_TTL,  # your policy; ADK does not pick this
)

if decision is None:
    await approval_service.expire(request_id)
    return "Approval expired; no action was taken."

return await resume_agent_with_correlated_decision(request_id, decision)`}</code></pre>
            </div>
            <p>
              <code>LongRunningFunctionTool</code> is for initiating work that should outlive the current agent
              execution. It returns a progress/operation response; the client decides whether to poll, wait, or
              continue with an intermediate response. It is not a magical background worker: put long jobs in a
              separate worker/service, and make retries idempotent. <a href="#source-long-running">[8]</a>
            </p>
          </section>

          <section className={styles.articleSection} id="example">
            <p className={styles.sectionTag}>05 / RUN THE EXAMPLE</p>
            <h2>A graph workflow with typed handoffs and a confirmation-gated tool.</h2>
            <p>
              The complete example is tested against Google ADK 2.11.0. `ResearchBrief` is the first agent&apos;s
              typed result; `ChangePlan` is passed as the next node&apos;s typed input. The approval agent&apos;s tool is
              gated, and the demo tool only records values in session state—it does not deploy anything.
            </p>
            <div className={styles.codeFrame}>
              <p>CORE WIRING / FULL CODE IN THE REPOSITORY EXAMPLE</p>
              <pre><code>{`root_agent = Workflow(
    name="handoff_approval_pipeline",
    edges=[(START, research_agent, planner_agent, approval_agent)],
)`}</code></pre>
            </div>
            <p>
              <a href={exampleUrl} target="_blank" rel="noreferrer">Browse the complete working example, README, and tests ↗</a>.
              Run the offline tests without a model key using <code>python -m pytest -q examples/adk_handoff_hitl/test_agent.py</code>.
              To try the interactive approval dialog in ADK Web, follow the example&apos;s README and supply your own
              Google API key through the environment—never commit the key.
            </p>
          </section>

          <aside className={styles.finalNote}>
            <p className={styles.sectionTag}>DESIGN RULE</p>
            <p>
              Keep three contracts explicit: <strong>what value is handed off?</strong>
              <strong> who owns the next step?</strong> <strong>what exact condition permits the side effect?</strong>
              Graph edges and schemas handle the first two. The approval gate and your server-side policy handle the third.
            </p>
          </aside>

          <section className={styles.sources} id="sources" aria-labelledby="sources-title">
            <p className={styles.sectionTag}>REFERENCES / PRIMARY SOURCES</p>
            <h2 id="sources-title">Official ADK docs and tested code</h2>
            <ol>
              <li id="source-patterns"><a href="https://adk.dev/workflows/patterns/" target="_blank" rel="noreferrer">ADK: Multi-agent workflow patterns, handoff, and Human-in-the-Loop</a></li>
              <li id="source-agent-tool"><a href="https://adk.dev/tools-custom/function-tools/#agent-tool" target="_blank" rel="noreferrer">ADK: AgentTool call-and-return behavior</a></li>
              <li id="source-graphs"><a href="https://adk.dev/graphs/" target="_blank" rel="noreferrer">ADK: Graph-based workflows</a></li>
              <li id="source-graph-data"><a href="https://adk.dev/graphs/data-handling/" target="_blank" rel="noreferrer">ADK: Graph node inputs, outputs, schemas, and state</a></li>
              <li id="source-sequential"><a href="https://adk.dev/agents/workflow-agents/sequential-agents/" target="_blank" rel="noreferrer">ADK: Prebuilt SequentialAgent and output_key</a></li>
              <li id="source-state"><a href="https://adk.dev/sessions/state/" target="_blank" rel="noreferrer">ADK: Session state scopes and prefixes</a></li>
              <li id="source-confirmation"><a href="https://adk.dev/tools-custom/confirmation/" target="_blank" rel="noreferrer">ADK: Tool confirmation and REST response format</a></li>
              <li id="source-long-running"><a href="https://adk.dev/tools-custom/function-tools/#long-run-tool" target="_blank" rel="noreferrer">ADK: Long-running function tools</a></li>
              <li><a href="https://github.com/google/adk-python/blob/main/contributing/samples/hitl/human_tool_confirmation/agent.py" target="_blank" rel="noreferrer">ADK Python: Human tool confirmation sample</a></li>
            </ol>
            <p className={styles.sourceNote}>
              Checked against official ADK docs and Google&apos;s Python ADK package 2.11.0 on October 2, 2026.
              Human confirmation is experimental; APIs and supported session backends can change. Verify the release
              and deployment target you use.
            </p>
          </section>
        </article>

        <footer className={styles.articleFooter}>
          <span>S. Vamshidhar Goud / Field notes</span>
          <Link href="/blog/adk-state-rewind-resume/">Previous: State, rewind & resume ←</Link>
        </footer>
      </div>
    </main>
  );
}