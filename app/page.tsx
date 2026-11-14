import { Inter, JetBrains_Mono } from "next/font/google";
import { about, certificates, experience, media, moments, profile, projects, skills } from "@/lib/content";
import IntroGreeting from "@/components/shared/IntroGreeting";
import Guestbook from "@/components/shared/Guestbook";
import Nav from "@/components/shared/Nav";
import { CopyEmail, SocialIcon, ZoomImage } from "@/components/shared/Bits";
import { RevealObserver, ScrollProgress, SmoothScroll } from "@/components/shared/Motion";
import DotField from "@/components/site/DotField";
import ContactForm from "@/components/site/ContactForm";
import { Cat, Coffee, CursorTrail, Folders, Polaroids } from "@/components/site/Interactive";
import "./site.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

const items = [
  { id: "prologue", label: "Prologue" },
  { id: "lead", label: "Lead" },
  { id: "data", label: "Data" },
  { id: "work", label: "Work" },
  { id: "guestbook", label: "Guestbook" },
  { id: "contact", label: "Contact" },
];

/** Heading whose words sharpen out of a blur one after another. */
function BlurTitle({ text, accent }: { text: string; accent?: string }) {
  const words = text.split(" ");
  return (
    <h2 className="bt" data-rv aria-label={accent ? `${text} ${accent}` : text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden style={{ ["--i" as string]: i }}>
          {w}{" "}
        </span>
      ))}
      {accent && (
        <span className="accent" aria-hidden style={{ ["--i" as string]: words.length }}>
          {accent}
        </span>
      )}
    </h2>
  );
}

function Chapter({
  id,
  n,
  kicker,
  title,
  accent,
  shape,
  caption,
  children,
}: {
  id: string;
  n: string;
  kicker: string;
  title: string;
  accent: string;
  shape: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <section className="chapter" id={id} data-chapter>
      <aside className="chapter-side" aria-hidden>
        <div className="slot" data-shape={shape} />
        <p className="slot-cap">
          fig. {n} · {caption}
        </p>
      </aside>
      <div className="chapter-main">
        <header className="chapter-head">
          <p className="kicker" data-rv>
            {n === "00" ? "Prologue" : n === "05" ? "Epilogue" : `Chapter ${n}`} <i /> {kicker}
          </p>
          <BlurTitle text={title} accent={accent} />
        </header>
        {children}
      </div>
    </section>
  );
}

export default function Home() {
  const school = experience.find((e) => e.id === "sman2")!;
  const campus = experience.find((e) => e.id === "presuniv")!;

  return (
    <div className={`site ${sans.variable} ${mono.variable}`} id="top">
      <IntroGreeting id="site" />
      <SmoothScroll />
      <RevealObserver />
      <ScrollProgress />
      <DotField portrait={profile.portraits.org} />
      <CursorTrail />
      <div className="progress" aria-hidden />
      <Nav items={items} cta={profile.cv ? { label: "Download CV", href: profile.cv } : { label: "Let's talk", href: "#contact" }}>
        <Cat />
      </Nav>

      <main>
        {/* ---------- Hero ---------- */}
        <section className="hero" data-chapter data-hero>
          <div className="hero-pin">
            <div className="hero-copy">
              <p className="pill">
                <span className="live" /> {profile.availability}
              </p>
              <p className="hero-name">{profile.name}</p>
              <h1>
                I turn messy data into <span className="accent">decisions</span> people can act on.
              </h1>
              <p className="hero-sub">
                {profile.role}. {profile.school}. {profile.focus.join(", ")}.
              </p>
              <div className="cta">
                <a className="btn btn-ink" href="#work">
                  View projects
                </a>
                <a className="btn" href="#prologue">
                  Read the story
                </a>
              </div>
            </div>
            <div className="hero-slot" data-shape="portrait" aria-hidden />
            <p className="hud hud-left" aria-hidden>
              Scroll: the dots settle into the portrait
            </p>
            <p className="hud hud-right" aria-hidden>
              <span className="live" /> <span data-hud-stage>raw data</span> / signal <span data-hud-pct>0%</span>
            </p>
          </div>
        </section>

        {/* ---------- Prologue ---------- */}
        <Chapter id="prologue" n="00" kicker="Who's telling this" title="The dots were me." accent="Hi." shape="hello" caption="the hello">
          <div className="prologue">
            <figure className="photo" data-rv>
              <div className="photo-image">
                <img src={profile.portraits.formal} alt={`Portrait of ${profile.name}`} width={880} height={1216} loading="lazy" />
              </div>
              <figcaption>The real one. {profile.location}.</figcaption>
            </figure>
            <div className="prose">
              <p className="lead" data-rv>
                {about.lead}
              </p>
              {about.body.map((p, i) => (
                <p key={i} data-rv style={{ ["--d" as string]: i + 1 }}>
                  {p}
                </p>
              ))}
            </div>
          </div>
          <dl className="facts" data-rv>
            {about.facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </Chapter>

        {/* ---------- 01 Lead ---------- */}
        <Chapter id="lead" n="01" kicker="Riau → Cikarang" title="Where I learned to" accent="lead." shape="mic" caption="the voice">
          <div className="places">
            {[school, campus].map((e) => (
              <article className="place" key={e.id} data-rv>
                <header>
                  <img src={e.logo} alt="" width={52} height={52} loading="lazy" />
                  <div>
                    <h3>{e.place}</h3>
                    <p>
                      {e.program} · {e.city}
                    </p>
                  </div>
                  <span className="tag">{e.period}</span>
                </header>
                {e.highlights?.map((h) => (
                  <p className="place-highlight" key={h}>
                    <span aria-hidden>★</span> {h}
                  </p>
                ))}
                <ol>
                  {e.roles.map((r) => (
                    <li key={r.title + (r.org ?? "")}>
                      <strong>{r.title}</strong>
                      {(r.org || r.period) && (
                        <em>
                          {r.org}
                          {r.org && r.period && " · "}
                          {r.period}
                        </em>
                      )}
                      <span>{r.note}</span>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
          <div data-rv>
            <Folders
              label="Moments"
              items={[
                {
                  id: "moments",
                  label: "Moments",
                  sub: `${moments.length} photos · tap to open`,
                  peek: [moments[1].image, moments[0].image],
                  content: <Polaroids items={moments} />,
                },
              ]}
            />
          </div>
        </Chapter>

        {/* ---------- 02 Data ---------- */}
        <Chapter id="data" n="02" kicker="What I picked up" title="Where I found" accent="data." shape="chart" caption="the signal">
          <div className="skills">
            {skills.map((g, i) => (
              <article key={g.id} data-rv style={{ ["--d" as string]: i }}>
                <h3>
                  <span>0{i + 1}</span> {g.title}
                </h3>
                <p>{g.blurb}</p>
                <ul>
                  {g.items.map((s) => (
                    <li key={s.name}>
                      <span>{s.name}</span>
                      <small>{s.note}</small>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div data-rv>
            <Folders
              label="Certificates"
              items={[
                {
                  id: "certificates",
                  label: "Certificates",
                  sub: `${certificates.length} certificates · tap to open`,
                  peek: [media("badge-ai-for-data-analysis"), media("cert-dicoding-ds")],
                  content: (
                    <div className="cert-panel">
                      {certificates
                        .filter((c) => c.courses)
                        .map((c) => (
                          <article className="cert-feature" key={c.id}>
                            <header>
                              <p className="mono muted">
                                {c.issuer} · {c.date}
                              </p>
                              <h3>{c.title}</h3>
                              <p>
                                {c.courses!.length} courses completed
                                {c.credential && <> · ID {c.credential}</>}
                                {c.verify && (
                                  <>
                                    {" · "}
                                    <a className="link" href={c.verify} target="_blank" rel="noreferrer">
                                      Verify ↗
                                    </a>
                                  </>
                                )}
                              </p>
                            </header>
                            <ul className="badges">
                              {c.courses!.map((k) => (
                                <li key={k.name}>
                                  {k.badge ? (
                                    <img src={k.badge} alt="" width={96} height={96} loading="lazy" />
                                  ) : (
                                    <span className="badge-blank" aria-hidden>
                                      G
                                    </span>
                                  )}
                                  <span>{k.name}</span>
                                </li>
                              ))}
                            </ul>
                          </article>
                        ))}
                      <ul className="certs">
                        {certificates
                          .filter((c) => !c.courses)
                          .map((c) => (
                            <li key={c.id}>
                              {c.image ? (
                                <ZoomImage src={c.image} alt={`${c.title} certificate`} />
                              ) : (
                                <span className="cert-tile" aria-hidden>
                                  <b>{c.issuer.split(" ")[0]}</b>
                                  <i>certified</i>
                                </span>
                              )}
                              <div>
                                <h3>{c.title}</h3>
                                <p>{c.issuer}</p>
                                <p className="mono">
                                  {c.date}
                                  {c.credential && <> · ID {c.credential}</>}
                                </p>
                                {c.verify && (
                                  <a className="link" href={c.verify} target="_blank" rel="noreferrer">
                                    Verify ↗
                                  </a>
                                )}
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </Chapter>

        {/* ---------- 03 Work ---------- */}
        <Chapter id="work" n="03" kicker="Things I led and built" title="Where ideas became" accent="real." shape="folder" caption="the work">
          <div data-rv>
            <Folders
              label="Projects"
              initial={projects[0].id}
              items={projects.map((p) => ({
                id: p.id,
                label: p.title,
                sub: `${p.kind.split(" · ")[0]} · ${p.year}`,
                peek: [p.image, p.image],
                content: (
                  <article className="case">
                    <div className="case-media">
                      <ZoomImage src={p.image} alt={`${p.title} preview`} />
                    </div>
                    <div className="case-head">
                      <p className="mono muted">
                        {p.index} · {p.kind} · {p.year}
                      </p>
                      <div className="case-title">
                        <h3>{p.title}</h3>
                        <span className="tag tag-accent">{p.role}</span>
                      </div>
                      <p className="case-summary">{p.summary}</p>
                      <div className="case-foot">
                        <ul className="chips">
                          {p.tags.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                        {p.links.map((l) => (
                          <a key={l.href} className="link" href={l.href} target="_blank" rel="noreferrer">
                            {l.label} ↗
                          </a>
                        ))}
                      </div>
                    </div>
                    <dl className="case-facts">
                      <div>
                        <dt>Problem</dt>
                        <dd>{p.problem}</dd>
                      </div>
                      <div>
                        <dt>What I did</dt>
                        <dd>
                          <ul>
                            {p.did.map((d) => (
                              <li key={d}>{d}</li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                      <div>
                        <dt>Outcome</dt>
                        <dd>{p.outcome}</dd>
                      </div>
                    </dl>
                  </article>
                ),
              }))}
            />
          </div>
        </Chapter>

        {/* ---------- 04 Guestbook ---------- */}
        <Chapter id="guestbook" n="04" kicker="Live guestbook" title="Where you come" accent="in." shape="cup" caption="the coffee">
          <p className="intro-line" data-rv>
            Leave a line, react to others, or pour me a coffee from the cup in the corner. Everything here updates live for
            every visitor.
          </p>
          <div data-rv>
            <Guestbook variant="card" submitLabel="Post it" />
          </div>
        </Chapter>

        {/* ---------- Epilogue ---------- */}
        <Chapter id="contact" n="05" kicker="Let's talk" title="Have data that needs a" accent="question?" shape="envelope" caption="the message">
          <p className="intro-line" data-rv>
            {profile.availability}. Planning a collaboration or have an opportunity? Send me a message below.
          </p>
          <div data-rv>
            <ContactForm email={profile.email} />
          </div>
          <p className="or-line" data-rv>
            Prefer your own email app?
          </p>
          <div className="cta" data-rv>
            <CopyEmail email={profile.email} className="btn btn-lg" />
            {profile.cv && (
              <a className="btn btn-lg" href={profile.cv}>
                Download CV
              </a>
            )}
          </div>
          <ul className="socials" data-rv>
            {profile.socials
              .filter((s) => s.id !== "email")
              .map((s) => (
                <li key={s.id}>
                  <a href={s.href} target="_blank" rel="noreferrer">
                    <SocialIcon id={s.id} />
                    <span>
                      {s.label}
                      <small>{s.handle}</small>
                    </span>
                  </a>
                </li>
              ))}
          </ul>
        </Chapter>
      </main>

      <footer className="foot">
        <span>© 2026 {profile.name}</span>
        <span>Same data, new shape. Made with a lot of coffee.</span>
      </footer>
      <Coffee />
    </div>
  );
}
