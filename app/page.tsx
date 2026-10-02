import Link from "next/link";
import type { Metadata } from "next";

import HeroParticles from "./HeroParticles";
import { profile } from "./profile";
import styles from "./portfolio.module.css";

export const metadata: Metadata = {
  title: `${profile.name} | ${profile.title}`,
  description: profile.summary,
  openGraph: {
    title: `${profile.name} | ${profile.title}`,
    description: profile.summary,
    type: "website",
  },
};

export default function PortfolioPage() {
  return (
    <main className={styles.portfolio} id="top">
      <div className={styles.gridTexture} aria-hidden="true" />
      <div className={styles.content}>
        <header className={styles.header}>
          <a className={styles.identity} href="#top" aria-label={`${profile.name}, back to top`}>
            <span className={styles.monogram}>{profile.initials}</span>
            <span className={styles.identityText}>
              <strong>{profile.name}</strong>
              <small>{profile.title}</small>
            </span>
          </a>
          <nav className={styles.navigation} aria-label="Portfolio navigation">
            <a href="#work">Work</a>
            <a href="#experience">Experience</a>
            <a href="#credentials">Credentials</a>
            <Link href="/blog/adk-agent-handoffs-human-approval/">Writing</Link>
            <a href="#contact">Contact</a>
            <a href={profile.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>
          </nav>
        </header>

        <HeroParticles className={styles.hero} labelledBy="intro-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}><span /> AI LEAD / ENTERPRISE AGENT SYSTEMS</p>
            <h1 id="intro-title">Enterprise AI, engineered for production.</h1>
            <p className={styles.intro}>{profile.summary}</p>
            <p className={styles.location}>{profile.location} <span>·</span> Open to complex AI engineering challenges</p>
            <div className={styles.heroLinks}>
              <a className={styles.textLink} href="#work">Selected work <span aria-hidden="true">↓</span></a>
              <a className={styles.textLink} href={profile.linkedinUrl} target="_blank" rel="noreferrer">
                LinkedIn <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <aside className={styles.heroVisual} aria-label="Selected engineering outcomes">
            <p className={styles.visualEyebrow}>SYSTEMS / MEASURED IMPACT</p>
            <div className={styles.visualLatency}>
              <span>120s</span>
              <span className={styles.visualArrow} aria-hidden="true">→</span>
              <strong>1–2s</strong>
            </div>
            <p className={styles.visualCaption}>Agent mapping latency / 98% reduction</p>
            <div className={styles.visualDivider} />
            <div className={styles.visualRow}>
              <span>Search accuracy</span>
              <strong>68% <i aria-hidden="true">→</i> 94%</strong>
            </div>
            <div className={styles.visualRow}>
              <span>Private knowledge base</span>
              <strong>30k+ <small>documents</small></strong>
            </div>
            <p className={styles.visualFooter}>GENAI / RAG / AGENT ORCHESTRATION</p>
          </aside>
        </HeroParticles>

        <section className={styles.proof} aria-label="Project results">
          {profile.metrics.map((metric) => (
            <div className={styles.proofItem} key={metric.label}>
              <p className={styles.proofLabel}>{metric.label}</p>
              <p className={styles.proofValue}>{metric.value}</p>
            </div>
          ))}
        </section>

        <section className={styles.work} id="work" aria-labelledby="work-title">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>01 / Selected work</p>
            <h2 id="work-title">AI systems with measurable outcomes.</h2>
          </div>
          <div className={styles.projectGrid}>
            {profile.projects.map((project, index) => (
              <article className={styles.projectCard} key={project.title}>
                <div className={styles.projectCardHead}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>{project.category}</span>
                </div>
                <h3>{project.title}</h3>
                <p className={styles.projectDescription}>{project.description}</p>
                <p className={styles.projectImpact}>{project.impact}</p>
                <p className={styles.projectStack}>{project.stack}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.experience} id="experience" aria-labelledby="experience-title">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>02 / Experience</p>
            <h2 id="experience-title">From applied ML to enterprise agent platforms.</h2>
          </div>
          <div className={styles.timeline}>
            {profile.experience.map((role) => (
              <article className={styles.timelineItem} key={role.organization}>
                <div className={styles.timelineDate}>
                  <span>{role.period}</span>
                  <span>{role.location}</span>
                </div>
                <div className={styles.timelineDetails}>
                  <p className={styles.timelineCompany}>{role.organization}</p>
                  <h3>{role.role}</h3>
                  <p>{role.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.approach} id="approach" aria-labelledby="approach-title">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>03 / Engineering focus</p>
            <h2 id="approach-title">Reliable systems need more than a capable model.</h2>
          </div>
          <div className={styles.principles}>
            <article>
              <span>01</span>
              <h3>Retrieval that earns trust</h3>
              <p>Hybrid search, chunking, and knowledge structures tuned against measurable accuracy and latency.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Agents built to operate</h3>
              <p>Reusable orchestration, clear tool boundaries, resilience, observability, and enterprise integration.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Guardrails and evaluation</h3>
              <p>Security controls, quality metrics, production monitoring, root-cause analysis, and continuous improvement.</p>
            </article>
          </div>
          <div className={styles.toolset}>
            <p className={styles.eyebrow}>Technical toolkit</p>
            <ul>
              {profile.skills.map((skill) => <li key={skill}>{skill}</li>)}
            </ul>
          </div>
        </section>

        <section className={styles.credentials} id="credentials" aria-labelledby="credentials-title">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>04 / Education & recognition</p>
            <h2 id="credentials-title">Strong foundations. Continued learning.</h2>
          </div>
          <div className={styles.credentialGrid}>
            <div className={styles.credentialGroup}>
              <p className={styles.credentialLabel}>Education</p>
              {profile.education.map((item) => (
                <article className={styles.credentialItem} key={item.institution}>
                  <h3>{item.degree}</h3>
                  <p>{item.institution} <span>·</span> {item.period}</p>
                </article>
              ))}
            </div>
            <div className={styles.credentialGroup}>
              <p className={styles.credentialLabel}>Certifications & awards</p>
              {[...profile.certifications, ...profile.awards].map((item) => (
                <p className={styles.credentialLine} key={item}>{item}</p>
              ))}
            </div>
          </div>
        </section>

        <footer className={styles.footer} id="contact">
          <div>
            <p className={styles.eyebrow}>05 / Contact</p>
            <h2>Let&apos;s build AI that works beyond the demo.</h2>
          </div>
          <div className={styles.footerLinks}>
            <a href={profile.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>
            {profile.email && <a href={`mailto:${profile.email}`}>Email <span aria-hidden="true">↗</span></a>}
          </div>
          <div className={styles.footerBase}>
            <span>{profile.name} · {profile.location}</span>
            <a href="#top">Back to top ↑</a>
          </div>
        </footer>
      </div>
    </main>
  );
}