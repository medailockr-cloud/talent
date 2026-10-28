import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  X,
  Plus,
  Search,
  Users,
  ChevronRight,
  Check,
  Clock,
  MapPin,
  CalendarDays,
  MessageCircle,
  Settings,
  Swords,
  ImagePlus,
} from 'lucide-react-native';
import { useCommunityStore } from '../../store/communityStore.web';
import { useShowsLabStore } from '../../store/showsLabStore.web';
import { useClubWorkspaceStore } from '../../store/clubWorkspaceStore.web';
import { useThemeStore } from '../../store/themeStore';
import {
  workspaceClubs,
  sampleActivities,
  clubRequestId,
  type WorkspaceClub,
  type ClubActivity,
} from '../../utils/clubWorkspace';
import { clubEvents, type ClubEvent } from '../../utils/communityCatalogue';
import { ClubAvatar, clubImage } from '../ui/ClubIdentity.web';
import { ClubWorkspaceStyles } from './ClubWorkspaceStyles.web';

const uid = () => `club-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const blank = {
  name: '',
  category: 'Music',
  city: 'Bengaluru',
  description: '',
  logoUrl: '',
  coverUrl: '',
  joinPolicy: 'approval' as 'approval' | 'open',
  title: '',
  kind: 'Practice' as ClubActivity['kind'],
  format: 'Online' as 'Online' | 'In person',
  date: '',
  location: '',
  brief: '',
  partnerId: '',
};

const time = (date: string) =>
  new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  });

function ClubDialog({
  title,
  back,
  close,
  children,
}: {
  title: string;
  back: () => void;
  close: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement | null>(null),
    onBack = useRef(back);
  useEffect(() => {
    onBack.current = back;
  }, [back]);
  useEffect(() => {
    const prior = document.activeElement as HTMLElement;
    ref.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onBack.current();
      }
      if (e.key !== 'Tab') return;
      const items = Array.from(
        ref.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),input:not(:disabled),select,textarea,a[href]'
        ) || []
      ).filter((e) => e.getClientRects().length);
      if (e.shiftKey && (document.activeElement === items[0] || document.activeElement === ref.current)) {
        e.preventDefault();
        items.at(-1)?.focus();
      } else if (!e.shiftKey && document.activeElement === items.at(-1)) {
        e.preventDefault();
        items[0]?.focus();
      }
    };
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('keydown', key);
      prior?.focus();
    };
  }, []);
  const { theme } = useThemeStore();
  return createPortal(
    <>
      <ClubWorkspaceStyles />
      <div className="cw-overlay">
        <section
          className="cw-dialog"
          ref={ref}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          style={{ backgroundColor: theme.bg, color: theme.text }}
        >
          <header className="cw-dialog-head">
            <button className="cw-icon" aria-label="Back in club" onClick={back}>
              <ArrowLeft size={21} />
            </button>
            <strong>{title}</strong>
            <button className="cw-icon" aria-label="Close club" onClick={close}>
              <X size={21} />
            </button>
          </header>
          {children}
        </section>
      </div>
    </>,
    document.body
  );
}

export function ClubsWorkspace({
  initialClub,
  profileName,
  onClubChange,
  onBack,
  onProfile,
  onShow,
}: {
  initialClub?: string;
  profileName: string;
  onClubChange: (id: string) => void;
  onBack: () => void;
  onProfile: () => void;
  onShow: (event: ClubEvent) => void;
}) {
  const community = useCommunityStore(),
    lab = useShowsLabStore(),
    store = useClubWorkspaceStore(),
    { theme } = useThemeStore();
  const all: WorkspaceClub[] = [
    ...lab.clubs.map((c) => ({ ...c, joinPolicy: 'approval' as const, ...store.edits[c.id] })),
    ...workspaceClubs.map((c) => ({ ...c, ...store.edits[c.id] })),
  ];
  const active = initialClub || null,
    club = all.find((c) => c.id === active),
    owner = club?.ownerId === 999,
    member = Boolean(club && (owner || community.memberships[club.id])),
    request = club ? store.requests[clubRequestId(club.id, 999)] : undefined;
  const [mode, setMode] = useState(initialClub === '__new' ? 'create' : 'club'),
    [tab, setTab] = useState('Activities'),
    [browse, setBrowse] = useState('Explore'),
    [query, setQuery] = useState(''),
    [category, setCategory] = useState('All'),
    [form, setForm] = useState(blank),
    [role, setRole] = useState<'Fan' | 'Performer'>('Fan'),
    [note, setNote] = useState(''),
    [agreed, setAgreed] = useState(false),
    [error, setError] = useState(''),
    [demo, setDemo] = useState(false),
    [target, setTarget] = useState<ClubActivity | null>(null),
    [url, setUrl] = useState(''),
    [post, setPost] = useState('');

  const mine = all.filter((c) => c.ownerId === 999 || community.memberships[c.id]),
    filtered = all.filter(
      (c) =>
        (browse !== 'My clubs' || mine.some((m) => m.id === c.id)) &&
        (category === 'All' || c.category === category) &&
        `${c.name} ${c.category} ${c.city}`.toLowerCase().includes(query.toLowerCase())
    );
  const activities = [...store.activities, ...sampleActivities]
      .filter((a) => a.clubId === club?.id || a.partnerId === club?.id)
      .sort((a, b) => Date.parse(a.date) - Date.parse(b.date)),
    pending = Object.values(store.requests).filter(
      (r) => r.clubId === club?.id && r.status === 'pending'
    );

  const change = (next: string) => {
    setMode(next);
    setError('');
    setAgreed(false);
    setNote('');
    setPost('');
  };
  const open = (id: string) => {
      onClubChange(id);
      change('club');
      setTab('Activities');
      setDemo(false);
    },
    close = () => {
      onClubChange('');
      change('club');
    },
    create = () => {
      setForm(blank);
      onClubChange('__new');
      change('create');
    };
  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const run = (action: () => void) => {
    try {
      action();
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save this local change.');
    }
  };

  const saveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    run(() => {
      if (form.name.trim().length < 3 || form.description.trim().length < 15 || form.city.trim().length < 2)
        throw new Error('Add a name, location and description of at least 15 characters.');
      const values = {
        name: form.name.trim(),
        category: form.category,
        city: form.city.trim(),
        description: form.description.trim(),
        logoUrl: form.logoUrl,
        coverUrl: form.coverUrl,
        joinPolicy: form.joinPolicy,
      };
      if (mode === 'create') {
        const id = uid();
        lab.addClub({
          id,
          ...values,
          initials: values.name.slice(0, 2).toUpperCase(),
          color: '#ae2865',
          prompt: 'Share your craft and support your community.',
          kind: 'Local community',
          ownerId: 999,
        });
        store.editClub(id, values);
        community.join(id, 'Performer');
        open(id);
      } else if (club && owner) {
        store.editClub(club.id, values);
        change('club');
      }
    });
  };

  const upload = async (e: React.ChangeEvent<HTMLInputElement>, key: 'logoUrl' | 'coverUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      update(key, await clubImage(file));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Image unavailable.');
    }
  };

  const edit = () => {
    if (!club || !owner) return;
    setForm({
      ...blank,
      ...club,
      logoUrl: club.logoUrl || '',
      coverUrl: club.coverUrl || blank.coverUrl,
    });
    change('identity');
  };

  const join = (e: React.FormEvent) => {
    e.preventDefault();
    if (!club || !agreed) return;
    run(() => {
      const r = store.request(club, role, note, profileName);
      if (r.status === 'accepted') community.join(club.id, r.role);
      change('club');
    });
  };

  const review = (id: string, status: 'accepted' | 'declined') => {
    if (!club || (!owner && !demo)) return;
    run(() => {
      const r = store.review(club, owner ? 999 : club.ownerId, id, status);
      if (r.userId === 999 && status === 'accepted') community.join(club.id, r.role);
    });
  };

  const participate = (a: ClubActivity, kind: 'Watch' | 'Participate') => {
    if (!member) {
      change('join');
      return;
    }
    if (a.exchangeStatus !== 'proposed') store.participate(a.id, kind);
  };

  const leave = () => {
    if (!club || owner) return;
    community.leave(club.id);
    store.withdraw(club.id);
    activities.forEach((a) => store.cancelParticipation(a.id));
    change('club');
  };

  const saveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!club || !owner) return;
    run(() => {
      store.addActivity({
        id: uid(),
        clubId: club.id,
        title: form.title.trim(),
        kind: form.kind,
        format: form.format,
        date: form.date ? new Date(form.date).toISOString() : '',
        location: form.location.trim(),
        brief: form.brief.trim(),
        partnerId: form.kind === 'Club exchange' ? form.partnerId : undefined,
        exchangeStatus: form.kind === 'Club exchange' ? 'proposed' : undefined,
      });
      change('club');
      setTab('Activities');
    });
  };

  const field = (label: string, key: keyof typeof blank, textarea = false) => (
    <label className="cw-field">
      {label}
      {textarea ? (
        <textarea
          className="cw-input"
          required
          maxLength={1000}
          value={form[key]}
          onChange={(e) => update(key, e.target.value)}
        />
      ) : (
        <input
          className="cw-input"
          required
          maxLength={key === 'name' ? 70 : 150}
          type={key === 'date' ? 'datetime-local' : 'text'}
          value={form[key]}
          onChange={(e) => update(key, e.target.value)}
        />
      )}
    </label>
  );

  const select = (label: string, key: keyof typeof blank, options: string[]) => (
    <label className="cw-field">
      {label}
      <select className="cw-input" value={form[key]} onChange={(e) => update(key, e.target.value)}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );

  const message = error && (
    <p className="cw-error" role="alert">
      {error}
    </p>
  );

  return (
    <main className="cw" style={{ backgroundColor: theme.bg, color: theme.text }}>
      <ClubWorkspaceStyles />
      <header className="cw-head">
        <div className="cw-top">
          <div>
            <button className="cw-icon" aria-label="Back to Shows" onClick={onBack}>
              <ArrowLeft size={21} />
            </button>
            <span className="cw-wordmark">
              talent<b>.</b>
            </span>
          </div>
          <div>
            <button className="cw-icon" aria-label="Create a club" onClick={create}>
              <Plus size={22} />
            </button>
            <button className="cw-icon" aria-label="Open your profile" onClick={onProfile}>
              <Users size={21} />
            </button>
          </div>
        </div>
        <h1>Clubs</h1>
        <p className="cw-lead">Find your circle. Make something together.</p>
        <label className="cw-search">
          <Search size={17} />
          <input
            aria-label="Search clubs"
            placeholder="Search a club, craft or city"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="cw-tabs" role="tablist" aria-label="Browse clubs">
          {['Explore', 'My clubs'].map((t) => (
            <button key={t} role="tab" aria-selected={browse === t} onClick={() => setBrowse(t)}>
              {t}
              {t === 'My clubs' ? ` · ${mine.length}` : ''}
            </button>
          ))}
        </div>
      </header>
      <div className="cw-content">
        <div className="cw-chips">
          {['All', 'Music', 'Dance', 'Comedy', 'Film', 'Writing', 'Art'].map((c) => (
            <button key={c} aria-pressed={category === c} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
        {mine.length > 0 && browse === 'Explore' && (
          <>
            <div className="cw-heading">
              <h2>Your circles</h2>
              <button className="cw-link" onClick={() => setBrowse('My clubs')}>
                Manage <ChevronRight size={13} />
              </button>
            </div>
            <div className="cw-mine-tray">
              {mine.map((c) => (
                <button key={c.id} onClick={() => open(c.id)}>
                  <ClubAvatar club={c} size={46} />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {!query && browse === 'Explore' && category === 'All' && (
          <article className="cw-feature">
            <small>CLUB EXCHANGE · SAMPLE ACTIVITY</small>
            <div className="cw-exchange-logos">
              <ClubAvatar club={all.find((c) => c.id === 'voices')!} size={39} />
              <Swords size={17} />
              <ClubAvatar club={all.find((c) => c.id === 'rhythm')!} size={39} />
              <span style={{ fontSize: 10, color: '#c1c1ce' }}>21 Nov · Online</span>
            </div>
            <h3>Two clubs. One creative brief.</h3>
            <p>Join a circle, practise together and put your work forward for a shared showcase.</p>
            <button className="cw-link" onClick={() => open('voices')}>
              Explore the exchange <ChevronRight size={14} />
            </button>
          </article>
        )}
        <div className="cw-heading">
          <h2>{browse === 'My clubs' ? 'Clubs you belong to' : 'Find your people'}</h2>
          <small>{filtered.length} sample &amp; local clubs</small>
        </div>
        {filtered.map((c) => (
          <article className="cw-card" key={c.id}>
            <button className="cw-card-main" aria-label={`Open club ${c.name}`} onClick={() => open(c.id)}>
              <div className="cw-cover">
                {c.coverUrl ? (
                  <img src={c.coverUrl} alt={`${c.name} club cover`} loading="lazy" />
                ) : (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: `radial-gradient(circle at 70% 30%, ${c.color || '#E91E76'}33 0%, #150914 100%)`,
                    }}
                  />
                )}
                <span className="cw-cover-label">
                  {c.joinPolicy === 'approval' ? 'Host approval' : 'Open to join'}
                </span>
              </div>
              <div className="cw-card-body">
                <ClubAvatar club={c} size={56} />
                <div className="cw-card-label">
                  {c.ownerId === 999 ? 'CREATED BY YOU' : 'SAMPLE COMMUNITY'}
                </div>
                <h3>{c.name}</h3>
                <p>
                  {c.category} · {c.city}
                </p>
                <p>{c.description}</p>
              </div>
            </button>
            <div className="cw-card-bottom">
              {c.ownerId === 999 || community.memberships[c.id] ? (
                <span className="cw-status">
                  <Check size={11} />
                  {c.ownerId === 999 ? 'Owner' : community.memberships[c.id]}
                </span>
              ) : store.requests[clubRequestId(c.id, 999)]?.status === 'pending' ? (
                <span className="cw-status">
                  <Clock size={11} />
                  Request pending
                </span>
              ) : (
                <span className="cw-subtle">Activities · Shows · Members</span>
              )}
              <button className="cw-link" onClick={() => open(c.id)}>
                Open club <ChevronRight size={13} />
              </button>
            </div>
          </article>
        ))}
        {!filtered.length && (
          <div className="cw-empty">
            <Users size={26} />
            <h3>Your circle starts here</h3>
            <p>Join an existing club or bring your own community together.</p>
            <button className="cw-primary" onClick={create}>
              Create a club
            </button>
          </div>
        )}
        <p className="cw-note">
          Discovery Lab · Sample communities and device-local actions. No real membership or organizer notification.
        </p>
      </div>
      {active && typeof document !== 'undefined' && (
        <ClubDialog
          title={
            mode === 'create'
              ? 'Create your club'
              : mode === 'join'
              ? 'Join this community'
              : mode === 'review'
              ? 'Membership requests'
              : club?.name || 'Club'
          }
          back={() => (mode === 'club' || mode === 'create' ? close() : change('club'))}
          close={close}
        >
          {(mode === 'create' || mode === 'identity') && (
            <form className="cw-form" onSubmit={saveIdentity}>
              <h2>{mode === 'create' ? 'A home for your people.' : 'Make it your club.'}</h2>
              <p>
                An artist collective, a local class or a neighbourhood circle. Choose a logo or face photo so people recognise your club.
              </p>
              {field('Club name', 'name')}
              {select('Category', 'category', [
                'Music',
                'Dance',
                'Comedy',
                'Film',
                'Writing',
                'Art',
                'Magic',
                'Learning',
              ])}
              {field('City or online community', 'city')}
              {field('About your club', 'description', true)}
              <div className="cw-upload">
                {form.logoUrl ? (
                  <img
                    src={form.logoUrl}
                    alt="Club logo preview"
                    width={48}
                    height={48}
                    style={{ borderRadius: 12, objectFit: 'cover' }}
                  />
                ) : (
                  <ImagePlus size={28} />
                )}
                <label>
                  Logo or face photo
                  <small>JPG, PNG or WebP · up to 5 MB</small>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    aria-label="Club logo or face photo"
                    onChange={(e) => void upload(e, 'logoUrl')}
                  />
                </label>
              </div>
              <div className="cw-upload">
                <label>
                  Cover photo
                  <small>Compressed and saved on this device</small>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    aria-label="Club cover photo"
                    onChange={(e) => void upload(e, 'coverUrl')}
                  />
                </label>
              </div>
              <label className="cw-field">
                How people join
                <select
                  className="cw-input"
                  value={form.joinPolicy}
                  onChange={(e) => update('joinPolicy', e.target.value)}
                >
                  <option value="approval">Request host approval</option>
                  <option value="open">Open after accepting rules</option>
                </select>
              </label>
              {message}
              <button className="cw-primary">
                {mode === 'create' ? 'Create local club' : 'Save club identity'}
              </button>
              <p className="cw-note">
                This creates a local preview. Photos stay in your browser; no public club is published.
              </p>
            </form>
          )}
          {club && mode === 'club' && (
            <>
              <div className="cw-detail-cover">
                {club.coverUrl ? (
                  <img src={club.coverUrl} alt={`${club.name} cover`} />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      background: `radial-gradient(circle at 70% 30%, ${club.color || '#E91E76'}44 0%, #150914 100%)`,
                    }}
                  />
                )}
              </div>
              <div className="cw-detail-body">
                <div className="cw-identity">
                  <ClubAvatar club={club} size={77} />
                  {owner ? (
                    <button className="cw-secondary" onClick={edit}>
                      <Settings size={14} /> Manage identity
                    </button>
                  ) : (
                    <span className="cw-status">
                      {member
                        ? `Member · ${community.memberships[club.id]}`
                        : request?.status === 'pending'
                        ? 'Request pending'
                        : club.joinPolicy === 'approval'
                        ? 'Host approval'
                        : 'Open membership'}
                    </span>
                  )}
                </div>
                <h2>{club.name}</h2>
                <div className="cw-meta">
                  <MapPin size={13} />
                  {club.city} · {club.category} · {owner ? 'Your local club' : 'Sample community'}
                </div>
                <p className="cw-intro">{club.description}</p>
                <div className="cw-actions">
                  {member ? (
                    <button className="cw-primary" onClick={() => change('post')}>
                      <MessageCircle size={15} /> Share with your club
                    </button>
                  ) : (
                    <button className="cw-primary" onClick={() => change('join')}>
                      {request?.status === 'pending'
                        ? 'View your request'
                        : club.joinPolicy === 'approval'
                        ? 'Request to join'
                        : 'Join club'}{' '}
                      <Plus size={15} />
                    </button>
                  )}
                  {owner && (
                    <button
                      className="cw-secondary"
                      onClick={() => {
                        setForm(blank);
                        change('activity');
                      }}
                    >
                      <Plus size={15} /> Activity
                    </button>
                  )}
                </div>
                {request?.status === 'pending' && !owner && workspaceClubs.some((c) => c.id === club.id) && (
                  <button
                    className="cw-link"
                    onClick={() => {
                      setDemo(true);
                      change('review');
                    }}
                  >
                    Preview the host’s approval screen
                  </button>
                )}
                {owner && (
                  <button
                    className="cw-link"
                    onClick={() => {
                      setDemo(false);
                      change('review');
                    }}
                  >
                    Review membership requests · {pending.length}
                  </button>
                )}
                <div className="cw-section-tabs" role="tablist" aria-label="Club sections">
                  {['Activities', 'Shows', 'Members', 'Board', 'About'].map((t) => (
                    <button
                      key={t}
                      role="tab"
                      aria-selected={tab === t}
                      onClick={() => setTab(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {tab === 'Activities' && (
                  <>
                    {activities.map((a) => (
                      <article className="cw-activity" key={a.id}>
                        <div className="cw-activity-top">
                          <span>
                            {a.kind === 'Club exchange'
                              ? 'CLUB VS CLUB · FRIENDLY EXCHANGE'
                              : a.kind.toUpperCase()}
                          </span>
                          <span>{a.format}</span>
                        </div>
                        <h3>{a.title}</h3>
                        <p>
                          <CalendarDays size={12} /> {time(a.date)} IST
                          <br />
                          {a.location}
                        </p>
                        <p>{a.brief}</p>
                        {a.exchangeStatus === 'proposed' ? (
                          <div className="cw-callout">
                            <strong>Partner acceptance pending</strong>
                            <p>Participation opens only after the partner accepts this proposal.</p>
                            {owner &&
                              a.clubId === club.id &&
                              workspaceClubs.some((c) => c.id === a.partnerId) && (
                                <button
                                  className="cw-link"
                                  onClick={() =>
                                    run(() => {
                                      const partner = all.find((c) => c.id === a.partnerId)!;
                                      store.acceptExchange(a.id, partner, partner.ownerId);
                                    })
                                  }
                                >
                                  Simulate sample partner acceptance
                                </button>
                              )}
                            {owner && a.partnerId === club.id && (
                              <button
                                className="cw-link"
                                onClick={() => run(() => store.acceptExchange(a.id, club, 999))}
                              >
                                Accept as partner owner
                              </button>
                            )}
                          </div>
                        ) : store.participation[a.id] ? (
                          <>
                            <span className="cw-status">
                              <Check size={12} />
                              {store.participation[a.id] === 'Watch'
                                ? 'Watching · interest saved'
                                : 'Participation interest saved'}
                            </span>
                            <button className="cw-link" onClick={() => store.cancelParticipation(a.id)}>
                              Cancel interest
                            </button>
                          </>
                        ) : (
                          <div className="cw-actions">
                            <button className="cw-secondary" onClick={() => participate(a, 'Watch')}>
                              {member ? 'I’ll watch' : 'Join to take part'}
                            </button>
                            {member && (
                              <button
                                className="cw-secondary"
                                onClick={() => participate(a, 'Participate')}
                              >
                                I want to participate
                              </button>
                            )}
                          </div>
                        )}
                        {a.kind === 'Challenge' && member && (
                          <button
                            className="cw-link"
                            onClick={() => {
                              change('submit');
                              setTarget(a);
                              setUrl(store.submissions[a.id]?.url || '');
                              setNote(store.submissions[a.id]?.note || '');
                            }}
                          >
                            {store.submissions[a.id]
                              ? 'Edit your submission'
                              : 'Submit an original performance'}
                          </button>
                        )}
                        {a.kind === 'Club exchange' && (
                          <p className="cw-note">
                            Interest is not a lineup selection. Hosts choose performers; no winner is declared.
                          </p>
                        )}
                      </article>
                    ))}
                    {!activities.length && (
                      <div className="cw-empty">
                        <CalendarDays size={25} />
                        <h3>The next activity starts here</h3>
                        <p>
                          {owner
                            ? 'Create a practice, challenge or exchange for your members.'
                            : 'The host can post the next activity here.'}
                        </p>
                        {owner && (
                          <button
                            className="cw-primary"
                            onClick={() => {
                              setForm(blank);
                              change('activity');
                            }}
                          >
                            Create an activity
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
                {tab === 'Shows' && (
                  <>
                    {clubEvents
                      .filter((e) => e.clubId === club.id)
                      .map((e) => (
                        <article className="cw-activity" key={e.id}>
                          <div className="cw-activity-top">
                            <span>{e.format === 'In person' ? 'OFFLINE SHOW' : 'ONLINE SHOW'}</span>
                            <span>Sample listing</span>
                          </div>
                          <h3>{e.title}</h3>
                          <p>
                            {e.date} · {e.time}
                            <br />
                            {e.location}
                          </p>
                          <button
                            className="cw-link"
                            onClick={() => {
                              close();
                              onShow(e);
                            }}
                          >
                            Attend or apply to perform <ChevronRight size={13} />
                          </button>
                        </article>
                      ))}
                    {!clubEvents.some((e) => e.clubId === club.id) && (
                      <div className="cw-empty">
                        <h3>No public shows yet</h3>
                        <p>Member activities and public Shows are separate. Public host eligibility still applies.</p>
                      </div>
                    )}
                  </>
                )}
                {tab === 'Members' && (
                  <>
                    <p className="cw-note">
                      Accepted local membership appears here. Sample hosts are illustrative, not verified endorsements.
                    </p>
                    <div className="cw-person">
                      <span className="cw-person-bubble">{owner ? 'V' : 'H'}</span>
                      <span>
                        <strong>{owner ? profileName : 'Sample club host'}</strong>
                        <small>Owner · {owner ? 'you' : 'demo identity'}</small>
                      </span>
                      <span className="cw-status">Owner</span>
                    </div>
                    {member && !owner && (
                      <div className="cw-person">
                        <span className="cw-person-bubble">V</span>
                        <span>
                          <strong>{profileName}</strong>
                          <small>{community.memberships[club.id]} · local member</small>
                        </span>
                        <Check size={15} />
                      </div>
                    )}
                    {Object.values(store.requests)
                      .filter((r) => r.clubId === club.id && r.status === 'accepted' && r.userId !== 999)
                      .map((r) => (
                        <div className="cw-person" key={r.id}>
                          <span className="cw-person-bubble">D</span>
                          <span>
                            <strong>{r.name}</strong>
                            <small>{r.role} · local demo member</small>
                          </span>
                          {owner && (
                            <button
                              className="cw-link"
                              onClick={() => run(() => store.removeMember(club, 999, r.userId))}
                            >
                              Remove member
                            </button>
                          )}
                        </div>
                      ))}
                    {!member && <p className="cw-note">Your tag appears after membership is accepted.</p>}
                    {owner && (
                      <button
                        className="cw-link"
                        onClick={() => {
                          setDemo(false);
                          change('review');
                        }}
                      >
                        Review {pending.length} pending requests
                      </button>
                    )}
                  </>
                )}
                {tab === 'Board' && (
                  <>
                    {member && (
                      <button
                        className="cw-secondary"
                        style={{ marginTop: 15 }}
                        onClick={() => change('post')}
                      >
                        Post an update or collaboration
                      </button>
                    )}
                    <article className="cw-post">
                      <strong>Welcome to {club.name}</strong>
                      <p>{club.prompt}</p>
                      <small>Pinned welcome · sample club guide</small>
                    </article>
                    {lab.posts
                      .filter((p) => p.clubId === club.id)
                      .map((p) => (
                        <article className="cw-post" key={p.id}>
                          <strong>
                            {p.authorName || profileName} · {p.kind}
                          </strong>
                          <p>{p.text}</p>
                          <small>Device-local post · not sent to members</small>
                        </article>
                      ))}
                  </>
                )}
                {tab === 'About' && (
                  <article className="cw-activity">
                    <h3>How this club works</h3>
                    <p>
                      {club.joinPolicy === 'approval'
                        ? 'Introduce yourself and wait for host acceptance.'
                        : 'Choose a role and accept the rules to join.'}{' '}
                      You can belong to multiple clubs.
                    </p>
                    <h3>Community rules</h3>
                    <p>Respect others, share work you have rights to share and keep feedback constructive.</p>
                    <h3>Your profile affiliation</h3>
                    <p>
                      Accepted memberships appear under Communities I’m part of; owned clubs appear under Clubs I run. Use your profile’s eye controls to hide an affiliation.
                    </p>
                    {member && !owner && (
                      <button className="cw-link" onClick={() => change('leave')}>
                        Leave this club
                      </button>
                    )}
                  </article>
                )}
                {message}
                <p className="cw-note">
                  Discovery Lab · local simulations. No host or member is notified, and no live room is created.
                </p>
              </div>
            </>
          )}
          {club && mode === 'join' && (
            <form className="cw-form" onSubmit={join}>
              <ClubAvatar club={club} size={60} />
              <h2>
                {request?.status === 'pending'
                  ? 'Your request is with the host.'
                  : 'Find your place in this club.'}
              </h2>
              <p>
                {club.name} · {club.joinPolicy === 'approval' ? 'Host review required.' : 'Open membership after accepting rules.'}
              </p>
              {request?.status === 'pending' ? (
                <>
                  <div className="cw-callout">
                    <strong>Pending · {request.role}</strong>
                    <p>{request.note || 'No introduction added.'}</p>
                    Accepted profile tags are not granted yet.
                  </div>
                  <button
                    type="button"
                    className="cw-secondary"
                    onClick={() => {
                      store.withdraw(club.id);
                      change('club');
                    }}
                  >
                    Withdraw request
                  </button>
                </>
              ) : (
                <>
                  <label className="cw-field">
                    How would you like to take part?
                    <select
                      className="cw-input"
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'Fan' | 'Performer')}
                    >
                      <option>Fan</option>
                      <option>Performer</option>
                    </select>
                  </label>
                  <label className="cw-field">
                    Introduce yourself
                    <textarea
                      className="cw-input"
                      maxLength={500}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </label>
                  <label className="cw-check">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                    />
                    I agree to respect members, share only work I can share and give constructive feedback.
                  </label>
                  {message}
                  <button className="cw-primary" disabled={!agreed}>
                    {club.joinPolicy === 'approval' ? 'Send local join request' : 'Confirm local membership'}
                  </button>
                </>
              )}
              <p className="cw-note">No real organizer is contacted by this preview.</p>
            </form>
          )}
          {club && mode === 'review' && (
            <div className="cw-form">
              <h2>Welcome the right people.</h2>
              {demo && (
                <div className="cw-callout">
                  <strong>Sample host simulation</strong>
                  <br />
                  This is a fictional organizer screen. Acceptance changes only this local demonstration, not a real membership.
                </div>
              )}
              {pending.map((r) => (
                <article className="cw-activity" key={r.id}>
                  <strong>{r.name}</strong>
                  <p>
                    {r.role} · introduction
                    <br />
                    {r.note || 'No introduction.'}
                  </p>
                  <div className="cw-actions">
                    <button className="cw-primary" onClick={() => review(r.id, 'accepted')}>
                      Accept member
                    </button>
                    <button className="cw-secondary" onClick={() => review(r.id, 'declined')}>
                      Decline request
                    </button>
                  </div>
                </article>
              ))}
              {!pending.length && (
                <div className="cw-empty">
                  <Check size={25} />
                  <h3>No pending requests</h3>
                  <p>Accepted members can take part and show a local profile affiliation.</p>
                </div>
              )}
              {owner && (
                <button
                  className="cw-link"
                  onClick={() => run(() => store.sampleApplicant(club, 999))}
                >
                  Add sample applicant for testing
                </button>
              )}
              {message}
              <button className="cw-link" onClick={() => change('club')}>
                Return to club <ChevronRight size={13} />
              </button>
            </div>
          )}
          {club && mode === 'activity' && owner && (
            <form className="cw-form" onSubmit={saveActivity}>
              <h2>Give your club a next step.</h2>
              {select('Activity type', 'kind', ['Practice', 'Challenge', 'Club exchange'])}
              {field('Title', 'title')}
              {field('Date and time · your browser’s local time', 'date')}
              {select('Format', 'format', ['Online', 'In person'])}
              {field('Meeting place or room label', 'location')}
              {form.kind === 'Club exchange' && (
                <label className="cw-field">
                  Proposed partner club
                  <select
                    className="cw-input"
                    required
                    value={form.partnerId}
                    onChange={(e) => update('partnerId', e.target.value)}
                  >
                    <option value="">Choose another club</option>
                    {all
                      .filter((c) => c.id !== club.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </label>
              )}
              {field('Creative brief', 'brief', true)}
              {message}
              <button className="cw-primary">Create local activity</button>
              <p className="cw-note">
                Club exchanges start as proposals. A real partner would need to accept before a joint event is announced. No broadcast or public show is created.
              </p>
            </form>
          )}
          {club && mode === 'submit' && target && member && (
            <form
              className="cw-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!agreed) return;
                run(() => {
                  store.submit(target.id, url.trim(), note.trim());
                  change('club');
                });
              }}
            >
              <h2>Your response to the brief.</h2>
              <p>{target.title}</p>
              <label className="cw-field">
                Original performance link
                <input
                  className="cw-input"
                  type="url"
                  required
                  placeholder="https://…"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </label>
              <label className="cw-field">
                Tell the club about your work
                <textarea
                  className="cw-input"
                  required
                  maxLength={500}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
              <label className="cw-check">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                I can share this performance and understand this is a local submission preview.
              </label>
              {message}
              <button className="cw-primary" disabled={!agreed}>
                Save local submission
              </button>
              <p className="cw-note">
                The HTTPS link is saved as text, not fetched, published or sent to a host.
              </p>
            </form>
          )}
          {club && mode === 'post' && member && (
            <form
              className="cw-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (post.trim().length < 3) return;
                lab.addPost({
                  authorName: profileName,
                  id: uid(),
                  clubId: club.id,
                  kind: 'Update',
                  text: post.trim(),
                  createdAt: new Date().toISOString(),
                });
                change('club');
                setTab('Board');
              }}
            >
              <h2>Keep your circle moving.</h2>
              <p>Share an update, a question or a collaboration idea.</p>
              <label className="cw-field">
                Your post
                <textarea
                  className="cw-input"
                  required
                  minLength={3}
                  maxLength={1000}
                  value={post}
                  onChange={(e) => setPost(e.target.value)}
                />
              </label>
              <button className="cw-primary">Save club post</button>
              <p className="cw-note">Saved locally. No member receives a message.</p>
            </form>
          )}
          {club && mode === 'leave' && (
            <div className="cw-form">
              <h2>Leave {club.name}?</h2>
              <p>
                Your accepted profile affiliation and participation interests for this club will be removed. You can request to join again.
              </p>
              <button className="cw-primary" onClick={leave}>
                Leave this local club
              </button>
              <button className="cw-link" onClick={() => change('club')}>
                Stay in the club
              </button>
            </div>
          )}
          {!club && mode !== 'create' && (
            <div className="cw-empty">
              <h3>Club not found</h3>
              <button className="cw-link" onClick={close}>
                Explore clubs
              </button>
            </div>
          )}
        </ClubDialog>
      )}
    </main>
  );
}
