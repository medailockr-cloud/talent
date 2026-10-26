import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowRight,
  Check,
  ChevronRight,
  MapPin,
  Clock,
  CalendarDays,
  Briefcase,
  Plus,
  X,
  Music2,
  ShieldCheck,
  Search,
  Send,
  Play,
} from 'lucide-react-native';
import { api } from '../../utils/api';
import { useWorkPilotStore } from '../../store/workPilotStore.web';
import { rupees, type Application, type Brief } from '../../utils/workPilot';
import { WorkPilotStyles } from './WorkPilotStyles.web';

const stamp = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const date = (s: string) =>
  new Date(s).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const blank: Brief = {
  id: '',
  title: '',
  organizer: '',
  city: 'Bengaluru',
  category: 'Singing',
  format: 'In person',
  date: '',
  deadline: '',
  fee: 6000,
  minutes: 45,
  requirements: '',
  equipment: '',
  rights: 'Live performance only. Recording or reuse needs separate artist permission.',
  cancellation: '',
  owner: true,
};

export function WorkPilot({ embedded = false, onBack }: { embedded?: boolean; onBack?: () => void }) {
  const router = useRouter(),
    store = useWorkPilotStore();
  const [view, setView] = useState<'Discover' | 'My work' | 'Organize'>('Discover'),
    [briefId, setBriefId] = useState(''),
    [applicationId, setApplicationId] = useState(''),
    [creating, setCreating] = useState(false),
    [draft, setDraft] = useState<Brief>(blank),
    [query, setQuery] = useState(''),
    [format, setFormat] = useState('All'),
    [category, setCategory] = useState('All'),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [videos, setVideos] = useState<any[]>([]),
    [loading, setLoading] = useState(true),
    [loadError, setLoadError] = useState(false),
    [selected, setSelected] = useState(''),
    [sample, setSample] = useState(false),
    [note, setNote] = useState(''),
    [fee, setFee] = useState(''),
    [terms, setTerms] = useState(false),
    [message, setMessage] = useState(''),
    [previewRole, setPreviewRole] = useState<'Artist' | 'Organizer'>('Organizer');

  const brief = store.briefs.find((b) => b.id === briefId),
    application = store.applications.find((a) => a.id === applicationId);

  const load = () => {
    setLoading(true);
    setLoadError(false);
    api
      .get('/profile/me')
      .then((r) => setVideos(r.data?.videos || []))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;
    api
      .get('/profile/me')
      .then((r) => {
        if (active) setVideos(r.data?.videos || []);
      })
      .catch(() => {
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const reset = () => {
    setBriefId('');
    setApplicationId('');
    setCreating(false);
    setError('');
    setNotice('');
    setTerms(false);
    setNote('');
    setSelected('');
    setSample(false);
    setMessage('');
  };

  const openBrief = (b: Brief) => {
    reset();
    setBriefId(b.id);
    setFee(String(b.fee));
  };

  const openApplication = (a: Application) => {
    reset();
    setBriefId(a.briefId);
    setApplicationId(a.id);
    setPreviewRole(view === 'Organize' ? 'Organizer' : 'Artist');
  };

  const attempt = (fn: () => void) => {
    setError('');
    try {
      fn();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const apply = () =>
    attempt(() => {
      if (!brief || !terms) throw Error('Confirm availability and the brief terms.');
      const performance = videos.find((v) => String(v.id) === selected);
      const a: Application = {
        id: stamp(),
        briefId: brief.id,
        name: sample ? 'Your demo artist persona' : 'You',
        performanceId: sample ? '31' : selected,
        performanceTitle: sample ? 'Licensed guitar excerpt · demo use' : performance?.title || '',
        note: note.trim(),
        fee: Number(fee),
        status: 'Applied',
        artistConfirmed: false,
        organizerConfirmed: false,
        messages: [],
        sample: false,
      };
      store.apply(brief, a);
      setApplicationId(a.id);
      setPreviewRole('Artist');
      setNotice('Application saved in this lab. No organizer was contacted.');
    });

  const advance = (action: Parameters<typeof store.advance>[1], role: 'Artist' | 'Organizer') =>
    attempt(() => {
      if (!application) return;
      if ((action === 'accept' || action === 'confirm') && !terms)
        throw Error('Read and confirm the terms below first.');
      store.advance(application.id, action, role);
      setTerms(false);
      setNotice(
        action === 'confirm'
          ? 'Confirmation recorded for the demo. Both roles must confirm to complete.'
          : 'Demo status updated. No notification was sent.'
      );
    });

  const shown = store.briefs.filter(
    (b) =>
      (format === 'All' || b.format === format) &&
      (category === 'All' || b.category === category) &&
      (b.title + ' ' + b.city + ' ' + b.category).toLowerCase().includes(query.toLowerCase())
  );
  const active = store.applications.filter(
    (a) => !a.sample && !['Declined', 'Withdrawn', 'Completed'].includes(a.status)
  );
  const completed = store.applications.filter((a) => a.status === 'Completed');

  const card = (b: Brief) => (
    <button
      key={b.id}
      className="wp-brief"
      onClick={() => openBrief(b)}
      aria-label={`Open paid brief ${b.title}`}
    >
      <div className="wp-cardtop">
        <span className="wp-tag">
          {b.format === 'Online' ? 'ONLINE' : 'AT THE VENUE'} · {b.category}
        </span>
        <span className="wp-money">
          {rupees(b.fee)}
          <small>total artist fee</small>
        </span>
      </div>
      <h3>{b.title}</h3>
      <p>{b.organizer}</p>
      <div className="wp-meta">
        <span>
          <MapPin size={13} />
          {b.city}
        </span>
        <span>
          <Clock size={13} />
          {b.minutes} min set
        </span>
      </div>
      <div className="wp-cardfoot">
        <span>{date(b.date)} IST</span>
        <span>
          View brief <ArrowUpRight size={15} />
        </span>
      </div>
    </button>
  );

  const applicationCard = (a: Application) => (
    <button
      key={a.id}
      className="wp-record"
      onClick={() => openApplication(a)}
      aria-label={`Open application ${a.name} ${a.status}`}
    >
      <span className="wp-status">{a.status}</span>
      <h3>{store.briefs.find((b) => b.id === a.briefId)?.title || 'Opportunity'}</h3>
      <p>
        {a.name} · {rupees(a.fee)}
      </p>
      <small>{a.sample ? 'Fictional sample applicant' : a.performanceTitle}</small>
      <ChevronRight size={18} />
    </button>
  );

  const header = (
    <header className="wp-header">
      <button
        aria-label={brief || creating ? 'Back to opportunities' : onBack ? 'Back to Shows' : 'Back to Home'}
        onClick={() => (brief || creating ? reset() : onBack ? onBack() : router.replace('/' as any))}
      >
        <ArrowLeft size={21} />
      </button>
      <span className="wp-brand">
        talent<i>.</i>
      </span>
      <span className="wp-pilot">BENGALURU PILOT</span>
    </header>
  );

  return (
    <section className={`wp ${embedded ? 'wp-embedded' : ''}`}>
      <WorkPilotStyles />
      {!embedded && header}
      <div className="wp-body">
        {(brief || creating) && embedded && (
          <button className="wp-back" onClick={reset}>
            <ArrowLeft size={16} /> Opportunities
          </button>
        )}
        {!brief && !creating && (
          <>
            <div className="wp-eyebrow">ABILITY, MEET OPPORTUNITY.</div>
            <h1>
              Your work.
              <br />
              <span>Your next stage.</span>
            </h1>
            <p className="wp-intro">
              Get considered for paid work that fits.
              <br />
              Your performance makes the introduction.
            </p>
            <nav className="wp-nav" aria-label="Opportunity workspace">
              {(['Discover', 'My work', 'Organize'] as const).map((v) => (
                <button
                  key={v}
                  aria-pressed={view === v}
                  onClick={() => {
                    setView(v);
                    reset();
                  }}
                >
                  {v}
                  {v === 'My work' && active.length > 0 && <span>{active.length}</span>}
                </button>
              ))}
            </nav>
            {view === 'Discover' && (
              <>
                <div className="wp-search">
                  <Search size={17} />
                  <input
                    aria-label="Search paid briefs"
                    placeholder="A craft, a city, a stage…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <div className="wp-filters">
                  <select
                    aria-label="Performance format"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                  >
                    {['All', 'In person', 'Online'].map((s) => (
                      <option key={s} value={s}>
                        {s === 'All' ? 'All formats' : s}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Performance category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {['All', 'Singing', 'Guitar', 'Music'].map((s) => (
                      <option key={s} value={s}>
                        {s === 'All' ? 'All music' : s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="wp-section-title">
                  <h2>Open for your ability</h2>
                  <span>{shown.length} sample briefs</span>
                </div>
                {shown.map(card)}
                {!shown.length && (
                  <div className="wp-empty">
                    <Search size={25} />
                    <h3>No matching briefs</h3>
                    <p>Try another craft or format.</p>
                    <button
                      onClick={() => {
                        setQuery('');
                        setFormat('All');
                        setCategory('All');
                      }}
                    >
                      Clear filters
                    </button>
                  </div>
                )}
                <div className="wp-assurance">
                  <ShieldCheck size={22} />
                  <div>
                    <strong>Considered for your work.</strong>
                    <p>No follower, score or badge minimum. Each brief shows the fee, requirements and usage terms.</p>
                  </div>
                </div>
              </>
            )}
            {view === 'My work' && (
              <>
                <div className="wp-metrics">
                  <div>
                    <strong>{active.length}</strong>
                    <span>In progress</span>
                  </div>
                  <div>
                    <strong>{completed.filter((a) => !a.sample).length}</strong>
                    <span>Demo completions</span>
                  </div>
                </div>
                <div className="wp-section-title">
                  <h2>Your applications &amp; bookings</h2>
                </div>
                {store.applications.filter((a) => !a.sample).map(applicationCard)}
                {!store.applications.some((a) => !a.sample) && (
                  <div className="wp-empty">
                    <Briefcase size={27} />
                    <h3>Your next step starts here.</h3>
                    <p>Apply with a performance and keep the brief, offer and completion record together.</p>
                    <button onClick={() => setView('Discover')}>
                      Find a paid brief <ArrowRight size={15} />
                    </button>
                  </div>
                )}
                <button className="wp-secondary" onClick={() => router.push('/you' as any)}>
                  Prepare your Talent Passport <ArrowUpRight size={16} />
                </button>
              </>
            )}
            {view === 'Organize' && (
              <>
                <div className="wp-organizer">
                  <Briefcase size={24} />
                  <h2>
                    Find the right act.
                    <br />
                    Know what you’re agreeing.
                  </h2>
                  <p>A clear brief. Actual performances. One record from application to completion.</p>
                  <button
                    className="wp-primary"
                    onClick={() => {
                      setDraft({ ...blank });
                      setCreating(true);
                    }}
                  >
                    Create a paid brief <Plus size={17} />
                  </button>
                </div>
                <div className="wp-section-title">
                  <h2>Your briefs</h2>
                  <span>{store.briefs.filter((b) => b.owner).length} created here</span>
                </div>
                {store.briefs.filter((b) => b.owner).map(card)}
                {!store.briefs.some((b) => b.owner) && (
                  <p className="wp-muted">
                    Create your first brief, or explore the fictional selection workflow below.
                  </p>
                )}
                <details className="wp-demo-tools">
                  <summary>Try a sample organizer workspace</summary>
                  <p>
                    Fictional applicants and licensed footage. This does not represent a real audition or employer.
                  </p>
                  {store.briefs
                    .filter((b) => !b.owner)
                    .map((b) => (
                      <button
                        key={b.id}
                        className="wp-secondary"
                        onClick={() => {
                          store.sampleApplicants(b.id);
                          openBrief(b);
                        }}
                      >
                        Review demo applicants · {b.category}
                        <ChevronRight size={16} />
                      </button>
                    ))}
                </details>
              </>
            )}
          </>
        )}
        {creating && (
          <>
            <div className="wp-eyebrow">A CLEAR BRIEF IS A BETTER BEGINNING</div>
            <h1>
              Build the
              <br />
              <span>right invitation.</span>
            </h1>
            <p className="wp-intro">
              Music pilot · Bengaluru &amp; online. No follower threshold. All fields below are required.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                attempt(() => {
                  const next = { ...draft, id: 'brief-' + stamp() };
                  store.addBrief(next);
                  setCreating(false);
                  setBriefId(next.id);
                  setNotice('Brief saved on this device. Not publicly posted.');
                });
              }}
            >
              {[
                ['title', 'Brief title'],
                ['organizer', 'Organizer / venue name'],
                ['city', 'City or Online'],
              ].map(([k, label]) => (
                <label className="wp-label" key={k}>
                  {label}
                  <input
                    required
                    maxLength={100}
                    value={(draft as any)[k]}
                    onChange={(e) => setDraft((d) => ({ ...d, [k]: e.target.value }))}
                  />
                </label>
              ))}
              <div className="wp-two">
                <label className="wp-label">
                  Craft
                  <select
                    value={draft.category}
                    onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                  >
                    {['Singing', 'Guitar', 'Music'].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label className="wp-label">
                  Format
                  <select
                    value={draft.format}
                    onChange={(e) => setDraft((d) => ({ ...d, format: e.target.value as Brief['format'] }))}
                  >
                    <option>In person</option>
                    <option>Online</option>
                  </select>
                </label>
              </div>
              <label className="wp-label">
                Performance date &amp; time · IST
                <input
                  type="datetime-local"
                  required
                  value={draft.date.replace('+05:30', '')}
                  onInput={(e) => {
                    const value = e.currentTarget.value;
                    setDraft((d) => ({ ...d, date: value ? value + '+05:30' : '' }));
                  }}
                />
              </label>
              <label className="wp-label">
                Applications close · IST
                <input
                  type="date"
                  required
                  value={draft.deadline}
                  onInput={(e) => {
                    const value = e.currentTarget.value;
                    setDraft((d) => ({ ...d, deadline: value }));
                  }}
                />
              </label>
              <div className="wp-two">
                <label className="wp-label">
                  Total artist fee · ₹
                  <input
                    type="number"
                    required
                    min={1}
                    max={10000000}
                    value={draft.fee}
                    onChange={(e) => setDraft((d) => ({ ...d, fee: Number(e.target.value) }))}
                  />
                </label>
                <label className="wp-label">
                  Set length · minutes
                  <input
                    type="number"
                    required
                    min={5}
                    max={480}
                    value={draft.minutes}
                    onChange={(e) => setDraft((d) => ({ ...d, minutes: Number(e.target.value) }))}
                  />
                </label>
              </div>
              {[
                ['requirements', 'Performance & selection requirements'],
                ['equipment', 'Equipment, soundcheck & travel'],
                ['rights', 'Recording & usage rights'],
                ['cancellation', 'Cancellation & rescheduling terms'],
              ].map(([k, label]) => (
                <label className="wp-label" key={k}>
                  {label}
                  <textarea
                    required
                    maxLength={1200}
                    value={(draft as any)[k]}
                    onChange={(e) => setDraft((d) => ({ ...d, [k]: e.target.value }))}
                  />
                </label>
              ))}
              <label className="wp-check">
                <input type="checkbox" required />I have authority to organize this engagement and permission to name the venue. This declaration is not identity verification.
              </label>
              <button className="wp-primary" type="submit">
                Save preview brief <ArrowRight size={17} />
              </button>
            </form>
          </>
        )}
        {brief && !application && (
          <>
            <div className="wp-eyebrow">PAID PERFORMANCE · SAMPLE BRIEF</div>
            <h1 className="wp-detail-title">{brief.title}</h1>
            <p className="wp-intro">{brief.organizer}</p>
            <div className="wp-fee">
              <strong>{rupees(brief.fee)}</strong>
              <span>
                Total artist fee · {brief.minutes}-minute set
                <br />
                No application fee. No payment collected.
              </span>
            </div>
            <div className="wp-facts">
              <div>
                <CalendarDays size={18} />
                <strong>{date(brief.date)} IST</strong>
                <span>{brief.format}</span>
              </div>
              <div>
                <MapPin size={18} />
                <strong>{brief.city}</strong>
                <span>Closes {brief.deadline}</span>
              </div>
            </div>
            <div className="wp-copy">
              <h2>The performance</h2>
              <p>{brief.requirements}</p>
              <h2>Equipment &amp; logistics</h2>
              <p>{brief.equipment}</p>
              <h2>Your work, your rights</h2>
              <p>{brief.rights}</p>
              <h2>Cancellation &amp; rescheduling</h2>
              <p>{brief.cancellation}</p>
            </div>
            <div className="wp-trust">
              <ShieldCheck size={18} />
              <p>
                Organizer checks: <strong>not verified in this lab.</strong> Self-declarations and sample records are never verified credentials.
              </p>
            </div>
            {view === 'Organize' ? (
              <>
                <div className="wp-section-title">
                  <h2>Review the work</h2>
                  <span>{store.applications.filter((a) => a.briefId === brief.id).length} applicants</span>
                </div>
                {store.applications.filter((a) => a.briefId === brief.id).map(applicationCard)}
                <button className="wp-secondary" onClick={() => store.sampleApplicants(brief.id)}>
                  Add fictional applicants for testing <Plus size={16} />
                </button>
                <p className="wp-muted">
                  Compare performances and suitability. Backers and public scores are not selection gates.
                </p>
              </>
            ) : (
              <>
                <div className="wp-section-title">
                  <h2>Let your work introduce you.</h2>
                </div>
                {store.applications
                  .filter((a) => a.briefId === brief.id && !a.sample && !['Withdrawn', 'Declined'].includes(a.status))
                  .map(applicationCard)}
                {!store.applications.some(
                  (a) => a.briefId === brief.id && !a.sample && !['Withdrawn', 'Declined'].includes(a.status)
                ) && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      apply();
                    }}
                  >
                    {loading ? (
                      <p>Loading your Passport…</p>
                    ) : loadError ? (
                      <button type="button" className="wp-secondary" onClick={load}>
                        Retry Passport
                      </button>
                    ) : videos.length > 0 ? (
                      <label className="wp-label">
                        Choose your performance
                        <select
                          required={!sample}
                          disabled={sample}
                          value={selected}
                          onChange={(e) => setSelected(e.target.value)}
                        >
                          <option value="">Select a performance</option>
                          {videos.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.title}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      <div className="wp-empty">
                        <Music2 size={23} />
                        <h3>Add your first performance.</h3>
                        <p>Choose work you have the right to share.</p>
                        <button type="button" onClick={() => router.push('/create' as any)}>
                          Upload a performance <Plus size={15} />
                        </button>
                      </div>
                    )}
                    <label className="wp-check">
                      <input
                        type="checkbox"
                        checked={sample}
                        onChange={(e) => setSample(e.target.checked)}
                      />
                      Try with a licensed sample excerpt. For testing only; this is not my work.
                    </label>
                    <label className="wp-label">
                      Your proposed total fee · ₹
                      <input
                        type="number"
                        required
                        min={1}
                        max={10000000}
                        value={fee}
                        onChange={(e) => setFee(e.target.value)}
                      />
                    </label>
                    <label className="wp-label">
                      Availability &amp; why this fits
                      <textarea
                        required
                        maxLength={1200}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Confirm the date, your proposed set and any logistics to agree."
                      />
                    </label>
                    <label className="wp-check">
                      <input
                        type="checkbox"
                        checked={terms}
                        onChange={(e) => setTerms(e.target.checked)}
                        required
                      />
                      I am available for the stated date and have read the requirements, rights and cancellation terms.
                    </label>
                    <button
                      className="wp-primary"
                      disabled={loading || (!selected && !sample) || !terms}
                      type="submit"
                    >
                      Save preview application <ArrowRight size={17} />
                    </button>
                  </form>
                )}
              </>
            )}
          </>
        )}
        {application && brief && (
          <>
            <div className="wp-eyebrow">ONE RECORD. EVERY NEXT STEP.</div>
            <h1 className="wp-detail-title">{brief.title}</h1>
            <p className="wp-intro">
              {application.name} · {application.sample ? 'Fictional applicant' : 'Your lab application'}
            </p>
            <div className="wp-role">
              <span>Test as</span>
              {(['Artist', 'Organizer'] as const).map((role) => (
                <button
                  key={role}
                  aria-pressed={previewRole === role}
                  onClick={() => {
                    setPreviewRole(role);
                    setTerms(false);
                    setError('');
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
            <p className="wp-muted">
              Role switching simulates both sides on this device. No real person receives these actions.
            </p>
            <ol className="wp-timeline">
              {['Applied', 'Shortlisted', 'Offered', 'Accepted', 'Completed'].map((s, i) => (
                <li
                  key={s}
                  data-done={
                    ['Applied', 'Shortlisted', 'Offered', 'Accepted', 'Completed'].indexOf(application.status) >= i
                  }
                >
                  <span>
                    {['Applied', 'Shortlisted', 'Offered', 'Accepted', 'Completed'].indexOf(application.status) >
                    i ? (
                      <Check size={12} />
                    ) : (
                      i + 1
                    )}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
            <div className="wp-contract">
              <span className="wp-status">{application.status}</span>
              <h2>
                {rupees(application.fee)}
                <small> proposed total artist fee</small>
              </h2>
              <p>
                {date(brief.date)} IST · {brief.minutes} minutes · {brief.city}
              </p>
              <button
                className="wp-secondary"
                onClick={() => router.push(('/video/' + application.performanceId) as any)}
              >
                <Play size={15} />
                {application.performanceTitle}
              </button>
              <p>{application.note}</p>
              <details>
                <summary>Read the booking terms</summary>
                <p>
                  <strong>Performance:</strong> {brief.requirements}
                </p>
                <p>
                  <strong>Logistics:</strong> {brief.equipment}
                </p>
                <p>
                  <strong>Rights:</strong> {brief.rights}
                </p>
                <p>
                  <strong>Cancellation:</strong> {brief.cancellation}
                </p>
                <p>
                  <strong>Payment:</strong> Not collected or protected in Discovery Lab. A production offer needs an agreed payment schedule and payment provider.
                </p>
              </details>
            </div>
            {previewRole === 'Organizer' && application.status === 'Applied' && (
              <button className="wp-primary" onClick={() => advance('shortlist', 'Organizer')}>
                Shortlist this performance <Check size={16} />
              </button>
            )}
            {previewRole === 'Organizer' && application.status === 'Shortlisted' && (
              <button className="wp-primary" onClick={() => advance('offer', 'Organizer')}>
                Make preview offer · {rupees(application.fee)} <ArrowRight size={16} />
              </button>
            )}
            {previewRole === 'Artist' && application.status === 'Offered' && (
              <>
                <label className="wp-check">
                  <input
                    type="checkbox"
                    checked={terms}
                    onChange={(e) => setTerms(e.target.checked)}
                  />
                  I agree to the fee, date, deliverables, rights and cancellation terms in this demo offer.
                </label>
                <button
                  className="wp-primary"
                  disabled={!terms}
                  onClick={() => advance('accept', 'Artist')}
                >
                  Accept preview offer <Check size={17} />
                </button>
                <button className="wp-secondary" onClick={() => advance('decline', 'Artist')}>
                  Decline offer
                </button>
              </>
            )}
            {previewRole === 'Artist' && ['Applied', 'Shortlisted'].includes(application.status) && (
              <button className="wp-secondary" onClick={() => advance('withdraw', 'Artist')}>
                Withdraw application
              </button>
            )}
            {application.status === 'Accepted' && (
              <>
                <div className="wp-confirmations">
                  <h2>Completion needs both sides.</h2>
                  <p>
                    Artist: {application.artistConfirmed ? 'Confirmed' : 'Awaiting confirmation'}
                    <br />
                    Organizer: {application.organizerConfirmed ? 'Confirmed' : 'Awaiting confirmation'}
                  </p>
                </div>
                {!(previewRole === 'Artist'
                  ? application.artistConfirmed
                  : application.organizerConfirmed) && (
                  <>
                    <label className="wp-check">
                      <input
                        type="checkbox"
                        checked={terms}
                        onChange={(e) => setTerms(e.target.checked)}
                      />
                      For this simulated workflow, confirm that the agreed performance was completed. This does not verify a real event.
                    </label>
                    <button
                      className="wp-primary"
                      disabled={!terms}
                      onClick={() => advance('confirm', previewRole)}
                    >
                      Record {previewRole.toLowerCase()} confirmation <Check size={17} />
                    </button>
                  </>
                )}
              </>
            )}
            {application.status === 'Completed' && (
              <div className="wp-assurance">
                <Check size={24} />
                <div>
                  <strong>Demo outcome recorded.</strong>
                  <p>
                    Both simulated roles confirmed. This appears in your Passport as a lab record, never a verified professional credit.
                  </p>
                  <button onClick={() => router.push('/you' as any)}>
                    View your Passport <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            )}
            <div className="wp-section-title">
              <h2>Keep the conversation together</h2>
            </div>
            <div className="wp-messages" aria-live="polite">
              {application.messages.length ? (
                application.messages.map((m, i) => (
                  <div key={i}>
                    <strong>{m.role} · local draft</strong>
                    <p>{m.text}</p>
                  </div>
                ))
              ) : (
                <p className="wp-muted">Clarify equipment, repertoire or arrival time. Messages stay in this lab.</p>
              )}
            </div>
            <form
              className="wp-message-form"
              onSubmit={(e) => {
                e.preventDefault();
                attempt(() => {
                  store.message(application.id, previewRole, message);
                  setMessage('');
                  setNotice('Message saved locally. Not sent.');
                });
              }}
            >
              <label className="wp-label">
                Message as {previewRole}
                <textarea
                  maxLength={1200}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Keep agreements clear…"
                />
              </label>
              <button className="wp-secondary" disabled={!message.trim()}>
                Save local message <Send size={15} />
              </button>
            </form>
          </>
        )}
        {error && (
          <p className="wp-error" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="wp-notice" role="status">
            {notice}
            <button aria-label="Dismiss status" onClick={() => setNotice('')}>
              <X size={15} />
            </button>
          </p>
        )}
        <footer className="wp-disclosure">
          DISCOVERY LAB · FICTIONAL LISTINGS
          <br />
          Applications, messages and role confirmations stay on this device. No employer contact, public listing, identity verification or payment. Dates use IST.
        </footer>
      </div>
    </section>
  );
}
