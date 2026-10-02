import Link from "next/link";
import type { Metadata } from "next";

import styles from "./article.module.css";

export const metadata: Metadata = {
  title: "ADK State, Rewind, Resume, and Fallback | S. Vamshidhar Goud",
  description:
    "A source-grounded guide to Google ADK session state, rewind, resumable workflow checkpoints, model fallback, and guardrails.",
  openGraph: {
    title: "ADK State, Rewind, Resume, and Fallback",
    description: "Four different reliability tools in Google ADK, and the boundaries between them.",
    type: "article",
    publishedTime: "2026-10-02T00:00:00Z",
    authors: ["S. Vamshidhar Goud"],
  },
};

export default function AdkReliabilityArticle() {
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
            <p className={styles.eyebrow}><span /> GOOGLE ADK / RELIABILITY</p>
            <h1>State, rewind, resume, and fallback are different reliability tools.</h1>
            <p className={styles.dek}>
              ADK gives you session state, event history, rewind, resumable workflows, and model fallback.
              The useful part is knowing exactly which boundary each one protects.
            </p>
            <div className={styles.byline}>
              <span>S. Vamshidhar Goud</span>
              <span>October 2, 2026</span>
              <span>8 minute read</span>
            </div>
          </header>

          <aside className={styles.summary} aria-label="Key distinction">
            <p className={styles.summaryLabel}>The short version</p>
            <p>
              <strong>State</strong> is what the conversation currently knows. <strong>Rewind</strong> restores
              session resources to an earlier invocation. <strong>Resume</strong> continues an interrupted
              workflow. <strong>Fallback</strong> tries another model before a response is committed to the
              turn. None of these is a transaction manager for external systems.
            </p>
          </aside>

          <nav className={styles.contents} aria-label="Article contents">
            <a href="#state">State & events</a>
            <a href="#rewind">Rewind</a>
            <a href="#resume">Checkpoint & resume</a>
            <a href="#fallback">Fallback</a>
            <a href="#guardrails">Guardrails</a>
          </nav>

          <section className={styles.articleSection} id="state">
            <p className={styles.sectionTag}>01 / STATE</p>
            <h2>State is a scoped working set, not the event log.</h2>
            <p>
              An ADK <code>Session</code> carries both <code>events</code> and <code>state</code>. Think of
              events as the chronological record and state as the current values the agent needs to continue a
              task. On a tool or callback context, a write such as
              <code>context.state[&quot;order_status&quot;] = &quot;pending&quot;</code> is captured into an event&apos;s
              <code>actions.state_delta</code>. The runner passes that event to <code>SessionService.append_event</code>,
              which applies the delta. That is why modifying a detached <code>Session.state</code> dictionary is
              not an equivalent persistence path. <a href="#source-state">[1]</a> <a href="#source-session">[2]</a>
            </p>

            <div className={styles.codeFrame}>
              <p>STATE WRITES IN A TOOL OR CALLBACK</p>
              <pre><code>{`context.state["order_status"] = "pending"       # session-scoped
context.state["user:preferred_region"] = "west" # shared for this user
context.state["app:policy_version"] = "2026-10" # shared for this app
context.state["temp:policy_checked"] = True     # this invocation only`}</code></pre>
            </div>

            <div className={styles.scopeGrid}>
              <div><strong>No prefix</strong><span>Current session</span></div>
              <div><strong>user:</strong><span>Same user, across sessions</span></div>
              <div><strong>app:</strong><span>Shared within the app</span></div>
              <div><strong>temp:</strong><span>Current invocation; not persisted</span></div>
            </div>
            <p>
              A persistent <code>DatabaseSessionService</code> or <code>VertexAiSessionService</code> can preserve
              session data across restarts; <code>InMemorySessionService</code> cannot. The prefix determines scope,
              while the service determines storage durability. Do not infer durable storage from a state key alone.
              <a href="#source-state">[1]</a> <a href="#source-session">[2]</a>
            </p>
          </section>

          <section className={styles.articleSection} id="rewind">
            <p className={styles.sectionTag}>02 / REWIND</p>
            <h2>Rewind is an explicit session operation.</h2>
            <p>
              In Python ADK, session rewind is documented from version 1.17.0. You identify the invocation to
              rewind <em>before</em>; ADK restores session-level state and artifacts to the point before that
              invocation, including later requests. The event history is retained for auditing, while rewound
              requests are excluded from the context prepared for the model after rewind. <a href="#source-rewind">[3]</a>
            </p>
            <div className={styles.codeFrame}>
              <p>REWIND TO BEFORE A KNOWN INVOCATION</p>
              <pre><code>{`await runner.rewind_async(
    user_id=user_id,
    session_id=session_id,
    rewind_before_invocation_id=invocation_to_undo,
)`}</code></pre>
            </div>
            <p>
              The boundary matters. Rewind does not restore <code>app:</code> or <code>user:</code> state, nor
              external systems a tool has changed. ADK also documents that state, artifact, and event persistence
              are not one atomic transaction. Avoid rewinding an active session or changing its artifacts
              concurrently. For a payment, email, or order API, rewind the conversation only after you have a
              deliberate compensation or reconciliation plan for the real-world effect. <a href="#source-rewind">[3]</a>
            </p>
          </section>

          <section className={styles.articleSection} id="resume">
            <p className={styles.sectionTag}>03 / CHECKPOINT & RESUME</p>
            <h2>A checkpoint helps continue work; it does not undo work.</h2>
            <p>
              Python ADK documents resumable workflows from version 1.16.0. Enable resumability on the
              <code>App</code> with <code>ResumabilityConfig(is_resumable=True)</code>. The workflow records
              completion progress in events and agent state, then uses the invocation ID to continue after an
              interruption. This is a recovery path for unfinished work, not a rewind to a prior user-visible
              state. <a href="#source-resume">[4]</a>
            </p>
            <div className={styles.codeFrame}>
              <p>ENABLE WORKFLOW RESUMABILITY</p>
              <pre><code>{`app = App(
    name="order_workflow",
    root_agent=root_agent,
    resumability_config=ResumabilityConfig(is_resumable=True),
)`}</code></pre>
            </div>
            <p>
              The operational catch is delivery semantics: a tool can execute more than once when a workflow is
              resumed. ADK recommends preventing duplicate runs for tools with harmful repeated effects. Give each
              business operation a stable idempotency key, record its outcome in the system of record, and have the
              tool check that record before creating another effect. Do not rely on a checkpoint as proof that a
              remote API call happened exactly once. <a href="#source-resume">[4]</a>
            </p>
          </section>

          <section className={styles.articleSection} id="fallback">
            <p className={styles.sectionTag}>04 / MODEL FALLBACK</p>
            <h2>Fallback changes the model path, not the transaction boundary.</h2>
            <p>
              Python ADK&apos;s <code>FallbackModel</code> tries an ordered model list. The current implementation is
              marked <strong>experimental</strong>. By default, HTTP statuses 429, 500, 502, 503, and 504 can move
              the request to the next model; errors without a recognized status do not. Each configured model is
              tried once by the fallback wrapper, and per-model retry settings are a separate layer.
              <a href="#source-fallback">[7]</a> <a href="#source-fallback-code">[8]</a>
            </p>
            <div className={styles.codeFrame}>
              <p>PYTHON ADK / EXPERIMENTAL API</p>
              <pre><code>{`from google.adk.agents import LlmAgent
from google.adk.models import FallbackModel

agent = LlmAgent(
    name="reliable_agent",
    model=FallbackModel(models=[
        "gemini-3.1-pro-preview",
        "gemini-3.5-flash",
    ]),
    instruction="You are a helpful assistant.",
)`}</code></pre>
            </div>
            <p>
              ADK&apos;s implementation snapshots selected fields of the mutable <code>LlmRequest</code> before a
              provider attempt and restores that request before a retryable failure is handed to the next model.
              That rollback prevents request edits from one failed provider leaking into the next attempt. It is
              not a rollback of session state, tool activity, or external writes. Once streaming has yielded its
              first response, ADK does not splice a second model into the same turn; the failure propagates.
              <a href="#source-fallback-code">[8]</a>
            </p>
            <p>
              If all models fail, <code>on_model_error_callback</code> can return a controlled <code>LlmResponse</code>
              instead of letting the exception end the invocation. Treat that as a user-facing fallback response,
              not evidence that the underlying task succeeded. <a href="#source-callbacks">[5]</a>
            </p>
          </section>

          <section className={styles.articleSection} id="guardrails">
            <p className={styles.sectionTag}>05 / GUARDRAILS</p>
            <h2>Guardrails decide what may happen; recovery decides what to do afterward.</h2>
            <p>
              ADK exposes callbacks around agent, model, and tool execution. A <code>before_model_callback</code>
              can return an <code>LlmResponse</code> to skip a model call; a <code>before_tool_callback</code> can
              return a dictionary to skip a tool and provide its result. For policies that apply across agents,
              ADK recommends reusable plugins. These hooks are enforcement points, but the policy still belongs
              to your application. <a href="#source-callbacks">[5]</a> <a href="#source-safety">[6]</a>
            </p>
            <div className={styles.practiceList}>
              <div><span>01</span><p><strong>Authorize outside the model.</strong> Derive identity and allowed actions from trusted server context, not tool arguments alone.</p></div>
              <div><span>02</span><p><strong>Validate at the tool boundary.</strong> Enforce amount limits, ownership, and allowed resources immediately before side effects.</p></div>
              <div><span>03</span><p><strong>Make retries idempotent.</strong> Resume, network ambiguity, and operator retries can repeat a tool call.</p></div>
              <div><span>04</span><p><strong>Keep an audit trail.</strong> Log invocation IDs, tool outcomes, policy decisions, and rewind operations without logging secrets.</p></div>
              <div><span>05</span><p><strong>Fail closed on validator failure.</strong> A timeout or exception in a critical policy check should not silently become approval.</p></div>
            </div>
            <p>
              For live audio, callbacks run in a latency-sensitive path and cannot pause for interactive approval.
              ADK&apos;s live guardrails documentation calls out the different behavior of text and transcribed audio
  turns; high-impact actions should use automated validation or a human handoff designed for the live workflow.
              <a href="#source-live-guardrails">[9]</a>
            </p>
          </section>

          <aside className={styles.finalNote}>
            <p className={styles.sectionTag}>DESIGN RULE</p>
            <p>
              Keep four questions separate: <strong>what state is committed?</strong> <strong>what work can resume?</strong>
              <strong> what can be rewound?</strong> <strong>what side effects need compensation?</strong> ADK provides
              primitives for the first three. Your system of record and tool contracts own the fourth.
            </p>
          </aside>

          <section className={styles.sources} id="sources" aria-labelledby="sources-title">
            <p className={styles.sectionTag}>REFERENCES / PRIMARY SOURCES</p>
            <h2 id="sources-title">Documentation & implementation</h2>
            <ol>
              <li id="source-state"><a href="https://adk.dev/sessions/state/" target="_blank" rel="noreferrer">ADK: State and state prefixes</a></li>
              <li id="source-session"><a href="https://adk.dev/sessions/session/" target="_blank" rel="noreferrer">ADK: Session and SessionService lifecycle</a></li>
              <li id="source-rewind"><a href="https://adk.dev/sessions/session/rewind/" target="_blank" rel="noreferrer">ADK: Rewind sessions for agents</a></li>
              <li id="source-resume"><a href="https://adk.dev/runtime/resume/" target="_blank" rel="noreferrer">ADK: Resume stopped workflows</a></li>
              <li id="source-callbacks"><a href="https://adk.dev/callbacks/types-of-callbacks/" target="_blank" rel="noreferrer">ADK: Callback types and return behavior</a></li>
              <li id="source-safety"><a href="https://adk.dev/safety/" target="_blank" rel="noreferrer">ADK: Safety and security practices</a></li>
              <li id="source-live-guardrails"><a href="https://adk.dev/live/guardrails/" target="_blank" rel="noreferrer">ADK: Guardrails for live agents</a></li>
              <li id="source-fallback"><a href="https://github.com/google/adk-python/blob/main/docs/guides/models/fallback_model/index.md" target="_blank" rel="noreferrer">ADK Python: FallbackModel guide</a></li>
              <li id="source-fallback-code"><a href="https://github.com/google/adk-python/blob/main/src/google/adk/models/_fallback_model.py" target="_blank" rel="noreferrer">ADK Python: FallbackModel implementation</a></li>
            </ol>
            <p className={styles.sourceNote}>
              Checked against the official ADK documentation and Python implementation on October 2, 2026. ADK APIs
              and experimental features can change; verify the docs and version you deploy.
            </p>
          </section>
        </article>

        <footer className={styles.articleFooter}>
          <span>S. Vamshidhar Goud / Field notes</span>
          <Link href="/">Back to portfolio ↑</Link>
        </footer>
      </div>
    </main>
  );
}