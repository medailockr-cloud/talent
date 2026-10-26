import { WorkPilot } from './WorkPilot.web';
import { ClubsWorkspace } from './ClubsWorkspace.web';
import { ClubAvatar } from '../ui/ClubIdentity.web';
import { workspaceClubs } from '../../utils/clubWorkspace';
import { useClubWorkspaceStore } from '../../store/clubWorkspaceStore.web';
import { useThemeStore } from '../../store/themeStore';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Search,
  Plus,
  X,
  MapPin,
  ArrowUpRight,
  ArrowRight,
  Bookmark,
  Ticket,
  Users,
  Mic2,
  CalendarDays,
  Globe,
  Check,
  LockKeyhole,
  ShieldCheck,
  Video,
  Music2,
  Briefcase,
  Minus,
  Play,
  ChevronRight,
  ChevronLeft,
  Star,
  MessageCircle,
  SlidersHorizontal,
} from 'lucide-react-native';
import { useCommunityStore } from '../../store/communityStore.web';
import { useShowsLabStore, type LocalClub, type ShowDraft } from '../../store/showsLabStore.web';
import { clubs, clubEvents, type Club, type ClubEvent } from '../../utils/communityCatalogue';
import {
  clubKinds,
  eventDetails,
  opportunities,
  discoverShows,
  validFutureDate,
  type Opportunity,
} from '../../utils/showsDiscovery';
import { showEligibility } from '../../utils/showEligibility';
import { api } from '../../utils/api';
import { ShowsStyles } from './ShowsStyles.web';
import { ShowsPolish } from './ShowsPolish.web';
import { showArtwork } from '../../utils/showsPresentation';

type Section = 'shows' | 'clubs' | 'opportunities' | 'mine';
type Panel =
  | { type: 'filters' }
  | { type: 'event'; event: ClubEvent }
  | { type: 'club'; club: Club }
  | { type: 'join'; club: Club }
  | { type: 'ticket'; event: ClubEvent }
  | { type: 'room'; event: ClubEvent }
  | { type: 'trailer'; event: ClubEvent }
  | { type: 'apply'; event?: ClubEvent; opportunity?: Opportunity }
  | { type: 'opportunity'; opportunity: Opportunity }
  | { type: 'create' }
  | { type: 'createClub' }
  | { type: 'host'; draft?: ShowDraft }
  | { type: 'location' }
  | { type: 'post'; club: Club }
  | { type: 'session'; club: Club }
  | null;

const categories = ['Music', 'Dance', 'Comedy', 'Film', 'Writing', 'Art'];
const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const price = (value: number) => (value ? `₹${value.toLocaleString('en-IN')}` : 'Free');
const emptyForm = {
  name: '',
  category: 'Music',
  city: 'Bengaluru',
  kind: 'Local community',
  description: '',
  title: '',
  date: '',
  location: '',
  format: 'Online',
  brief: '',
};

export function ShowsView() {
  const router = useRouter();
  const [entryParams, setEntryParams] = useState<{ section?: string; club?: string }>({});

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('talent-shows-entry');
      if (!raw) return;
      const entry = new URLSearchParams(raw),
        section = entry.get('section') || 'shows';
      if (['shows', 'clubs', 'opportunities', 'mine'].includes(section))
        queueMicrotask(() => setEntryParams({ section, club: entry.get('club') || '' }));
    } catch {}
  }, []);

  const routeParams = useLocalSearchParams<{ section?: string; club?: string }>();
  const params = routeParams.section ? routeParams : entryParams;
  const section: Section = ['clubs', 'opportunities', 'mine'].includes(params.section || '')
    ? (params.section as Section)
    : 'shows';

  const community = useCommunityStore();
  const lab = useShowsLabStore();
  const clubWorkspace = useClubWorkspaceStore();

  const [panel, setPanel] = useState<Panel>(null),
    [query, setQuery] = useState(''),
    [filter, setFilter] = useState('All'),
    [city, setCity] = useState('Everywhere'),
    [clubTab, setClubTab] = useState('About'),
    [mineTab, setMineTab] = useState('Plans');

  const [role, setRole] = useState<'Fan' | 'Performer'>('Fan'),
    [agreed, setAgreed] = useState(false),
    [profile, setProfile] = useState<any>(null),
    [profileError, setProfileError] = useState(false),
    [form, setForm] = useState(emptyForm),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [quantity, setQuantity] = useState(1),
    [selected, setSelected] = useState(''),
    [note, setNote] = useState(''),
    [postKind, setPostKind] = useState<'Update' | 'Performance' | 'Collaboration'>('Update');

  const [eventMode, setEventMode] = useState('Attend');
  const [dateWindow, setDateWindow] = useState<'any' | '7' | '30'>('any'),
    [freeOnly, setFreeOnly] = useState(false),
    [sort, setSort] = useState<'soonest' | 'price'>('soonest');
  const activeBrowse = dateWindow !== 'any' || freeOnly || sort !== 'soonest';
  const resetBrowse = () => {
    setDateWindow('any');
    setFreeOnly(false);
    setSort('soonest');
  };

  const [hosted, setHosted] = useState<any[]>([]),
    [searchOpen, setSearchOpen] = useState(false),
    [showAll, setShowAll] = useState(false);

  const dialog = useRef<HTMLElement | null>(null);
  const priorFocus = useRef<HTMLElement | null>(null);
  const scroller = useRef<HTMLElement | null>(null);

  const allClubs: Club[] = [...lab.clubs, ...clubs].map((c) => ({
    ...c,
    ...clubWorkspace.edits[c.id],
  }));
  const getClub = (clubId: string) => allClubs.find((c) => c.id === clubId);

  const [hostReady, setHostReady] = useState({
    organizerDeclared: false,
    venueConfirmed: false,
    termsAccepted: false,
  });
  const eligibility = showEligibility(hostReady);
  const ownClub = (c: Club) => 'ownerId' in c && (c as LocalClub).ownerId === 999;
  const { theme } = useThemeStore();
  const vars = useMemo(() => {
    if (theme.isDark) {
      return {
        '--sl-bg': theme.bg,
        '--sl-card': theme.cardBg,
        '--sl-surface': theme.surfaceBg,
        '--sl-header': theme.headerBg || theme.bg,
        '--sl-ink': theme.text,
        '--sl-muted': theme.textSecondary,
        '--sl-border': theme.border,
        '--sl-primary': theme.primary,
      } as React.CSSProperties;
    }
    return {
      '--sl-bg': '#ffffff',
      '--sl-card': '#ffffff',
      '--sl-surface': '#f5f7f3',
      '--sl-header': '#ffffff',
      '--sl-ink': '#1c2821',
      '--sl-muted': '#65736a',
      '--sl-border': '#e1e7df',
      '--sl-primary': '#ed177b',
    } as React.CSSProperties;
  }, [theme]);

  const refresh = () => {
    setProfileError(false);
    api
      .get('/profile/me')
      .then((r) => setProfile(r.data))
      .catch(() => setProfileError(true));
  };

  useEffect(() => {
    api
      .get('/shows')
      .then((r) => setHosted((r.data || []).filter((s: any) => s.userId === 999)))
      .catch(() => {});
    api
      .get('/profile/me')
      .then((r) => setProfile(r.data))
      .catch(() => setProfileError(true));
  }, []);

  const open = (next: Panel) => {
    if (next?.type === 'club') {
      setPanel(null);
      router.setParams({ section: 'clubs', club: next.club.id });
      return;
    }
    setPanel(next);
    setMessage('');
    setAgreed(false);
    setSelected('');
    setNote('');
    setQuantity(1);
    setForm(emptyForm);
    if (next?.type === 'event') setEventMode('Attend');
    if (next?.type === 'join') setRole(community.memberships[next.club.id] || 'Fan');
    if (next?.type === 'host' && next.draft) setForm({ ...emptyForm, ...next.draft });
  };

  const chooseSection = (next: Section) => {
    router.setParams({ section: next });
    setQuery('');
    setFilter('All');
  };

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [section]);

  useEffect(() => {
    if (!panel) return;
    priorFocus.current = document.activeElement as HTMLElement;
    dialog.current?.focus();
    dialog.current?.scrollTo({ top: 0 });
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPanel(null);
        return;
      }
      if (e.key !== 'Tab') return;
      const items = Array.from(
        dialog.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),input:not(:disabled),select,textarea,a[href],video[controls]'
        ) || []
      ).filter((el) => el.getClientRects().length > 0);
      if (!items.length) {
        e.preventDefault();
        return;
      }
      const first = items[0],
        last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handle);
    return () => {
      document.removeEventListener('keydown', handle);
      priorFocus.current?.focus();
    };
  }, [panel]);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const localNotice = (
    <p className="sl-footnote">
      Discovery Lab · Sample listings. Memberships, tickets and applications are saved only on this device. No payment, live broadcast or organizer notification.
    </p>
  );

  const empty = (title: string, body: string, action?: () => void, button = 'Explore') => (
    <div className="sl-empty">
      <Music2 size={27} />
      <strong>{title}</strong>
      <p>{body}</p>
      {action && (
        <button className="sl-secondary" onClick={action}>
          {button}
        </button>
      )}
    </div>
  );

  const eventRow = (event: ClubEvent) => {
    const meta = eventDetails[event.id],
      art = showArtwork[event.id] || showArtwork['open-room'];
    return (
      <button
        className="sl-event"
        key={event.id}
        onClick={() => open({ type: 'event', event })}
        aria-label={`View show ${event.title}`}
      >
        <div className="sl-event-art">
          <img src={art.image} alt="" loading="lazy" />
          <span className={`sl-format-badge ${event.format !== 'In person' ? 'online' : ''}`}>
            {event.format === 'In person' ? 'OFFLINE' : 'ONLINE'}
          </span>
        </div>
        <div className="sl-event-copy">
          <h3>{event.title}</h3>
          <div className="sl-kicker">
            {event.category} · {event.format === 'Club vs club' ? 'Club exchange' : 'Live performance'}
          </div>
          <p>
            {event.format === 'In person' ? <MapPin size={11} /> : <Globe size={11} />}{' '}
            {event.format === 'In person' ? event.location.split(' · ').pop() : 'Online'}{' '}
            <CalendarDays size={11} style={{ marginLeft: 5 }} /> {event.date}
          </p>
          <p className="sl-card-access">
            <Mic2 size={10} />
            {meta?.slots || 0} performer slots · Apply in details
          </p>
        </div>
        <div className="sl-event-price">
          <span>
            <ArrowUpRight size={15} />
          </span>
          <small>{community.attending[event.id] ? 'Going' : price(meta?.price || 0)}</small>
        </div>
      </button>
    );
  };

  const clubCard = (c: Club) => (
    <button
      key={c.id}
      className="sl-club-card"
      onClick={() => open({ type: 'club', club: c })}
      aria-label={`Open club ${c.name}`}
    >
      <ClubAvatar
        club={{
          ...(workspaceClubs.find((w) => w.id === c.id) || {
            ...c,
            ownerId: (c as LocalClub).ownerId || 0,
            joinPolicy: 'approval' as const,
          }),
          ...clubWorkspace.edits[c.id],
        }}
        size={52}
      />
      <div className="sl-kicker" style={{ fontSize: 8, letterSpacing: '.5px' }}>
        {'kind' in c ? String(c.kind) : clubKinds[c.id]}
      </div>
      <h3>{c.name}</h3>
      <p>
        {c.category} · {c.city}
      </p>
      {community.memberships[c.id] && (
        <p className="sl-joined">
          {ownClub(c) ? 'Your club' : `Joined · ${community.memberships[c.id]}`}
        </p>
      )}
    </button>
  );

  const oppRow = (o: Opportunity) => (
    <article className="sl-opp" key={o.id}>
      <button aria-label={`View opportunity ${o.title}`} onClick={() => open({ type: 'opportunity', opportunity: o })}>
        <div className="sl-opp-top">
          <span className="sl-badge pink">{o.kind}</span>
          <span className="sl-kicker" style={{ letterSpacing: 0 }}>
            Closes {o.deadline}
          </span>
        </div>
        <h3>{o.title}</h3>
        <p>
          {o.category} · {o.city} · {getClub(o.clubId)?.name}
        </p>
        <div className="sl-row">
          <div className="sl-opp-reward">
            {lab.opportunityApplications[o.id] ? 'Application saved' : o.reward}
          </div>
          <ArrowUpRight size={18} />
        </div>
      </button>
    </article>
  );

  const filteredEvents = discoverShows(clubEvents, {
    query,
    format: filter,
    city,
    window: dateWindow,
    freeOnly,
    sort,
  });
  const featuredVisible = !activeBrowse && !query && filter === 'All' && city === 'Everywhere';
  const listedEvents = filteredEvents.filter((e) => !featuredVisible || e.id !== clubEvents[0].id);
  const filteredClubs = allClubs.filter(
    (c) =>
      (filter === 'All' || c.category === filter || ('kind' in c ? c.kind : clubKinds[c.id]) === filter) &&
      (city === 'Everywhere' || c.city === city) &&
      (c.name + ' ' + c.category + ' ' + c.city).toLowerCase().includes(query.toLowerCase())
  );

  const selectedVideos = profile?.videos || [];
  const performancePicker = (
    <>
      {profileError ? (
        <div className="sl-status">
          Couldn’t load your Talent Passport. <button onClick={refresh}>Retry</button>
        </div>
      ) : selectedVideos.length ? (
        <>
          <label className="sl-label" htmlFor="sl-performance">
            Choose your performance
          </label>
          <select
            id="sl-performance"
            className="sl-select"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Select from your Talent Passport</option>
            {selectedVideos.map((v: any) => (
              <option key={v.id} value={v.id}>
                {v.title || 'Untitled performance'}
              </option>
            ))}
          </select>
          <p className="sl-footnote">
            The host reviews this work and your Passport. Follower count is not an application requirement.
          </p>
        </>
      ) : (
        <div className="sl-callout">
          <strong>Add your first performance</strong>
          <p>Your Passport needs a recording the organizer can review.</p>
          <button
            className="sl-text-link"
            onClick={() => {
              setPanel(null);
              router.push('/create' as any);
            }}
          >
            Add a performance <ArrowUpRight size={15} />
          </button>
        </div>
      )}
    </>
  );

  const apply = () => {
    if (panel?.type !== 'apply' || !selected) return;
    const performance = selectedVideos.find((v: any) => String(v.id) === selected);
    if (!performance) return;
    if (panel.event) {
      community.apply(panel.event.id, performance.title || 'Portfolio performance');
      lab.applyOpportunity('show:' + panel.event.id, {
        performanceId: selected,
        performanceTitle: performance.title,
        note: note.trim(),
        createdAt: new Date().toISOString(),
      });
    } else if (panel.opportunity) {
      lab.applyOpportunity(panel.opportunity.id, {
        performanceId: selected,
        performanceTitle: performance.title,
        note: note.trim(),
        createdAt: new Date().toISOString(),
      });
    }
    setMessage('Application saved on this device. No organizer has received it.');
  };

  const createClub = () => {
    if (!form.name.trim() || !form.city.trim() || !form.description.trim() || !agreed) {
      setMessage('Add a club name, location, description and agree to the club guidelines.');
      return;
    }
    const club: LocalClub = {
      id: 'local-' + id(),
      name: form.name.trim(),
      category: form.category,
      city: form.city.trim(),
      kind: form.kind as LocalClub['kind'],
      ownerId: 999,
      description: form.description.trim(),
      initials: form.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((x) => x[0])
        .join('')
        .toUpperCase(),
      color: '#71535e',
      prompt: 'Share something original and help someone improve.',
    };
    lab.addClub(club);
    community.join(club.id, 'Performer');
    open({ type: 'club', club });
  };

  const saveShow = async (publish = false) => {
    if (!form.title.trim() || !form.location.trim() || !validFutureDate(form.date) || !form.brief.trim()) {
      setMessage('Add a title, a future date, location and performer brief.');
      return;
    }
    const draft: ShowDraft = {
      id: panel?.type === 'host' && panel.draft ? panel.draft.id : 'draft-' + id(),
      title: form.title.trim(),
      location: form.location.trim(),
      date: form.date,
      format: form.format as 'Online' | 'In person',
      brief: form.brief.trim(),
    };
    if (!publish) {
      lab.saveDraft(draft);
      setMessage('Draft saved. Find it in My space → Hosting. It is not a published show.');
      return;
    }
    if (!eligibility.eligible) {
      setMessage('Complete the organizer readiness declarations. You can always save a draft.');
      return;
    }
    setBusy(true);
    try {
      const created = await api.post('/shows', { ...draft, readiness: hostReady });
      setHosted((s) => [created.data, ...s]);
      lab.saveDraft(draft);
      setMessage('Demo show saved locally. No public listing was created.');
    } catch {
      setMessage('Could not save the show. Host eligibility is checked again before saving.');
    } finally {
      setBusy(false);
    }
  };

  const createSession = () => {
    if (panel?.type !== 'session' || !ownClub(panel.club)) return;
    if (!form.title.trim() || !form.location.trim() || !validFutureDate(form.date)) {
      setMessage('Add a title, future date and location.');
      return;
    }
    lab.addSession({
      id: 'session-' + id(),
      clubId: panel.club.id,
      title: form.title.trim(),
      date: form.date,
      format: form.format as 'Online' | 'In person',
      location: form.location.trim(),
    });
    open({ type: 'club', club: panel.club });
    setClubTab('Sessions');
  };

  const sharePost = () => {
    if (panel?.type !== 'post' || !community.memberships[panel.club.id]) return;
    if (!note.trim() || (postKind === 'Performance' && !selected)) {
      setMessage('Add a message and choose a performance when sharing your work.');
      return;
    }
    const performance = selectedVideos.find((v: any) => String(v.id) === selected);
    lab.addPost({
      id: 'post-' + id(),
      clubId: panel.club.id,
      kind: postKind,
      text: note.trim(),
      ...(postKind === 'Performance' ? { performanceId: selected, performanceTitle: performance?.title } : {}),
      createdAt: new Date().toISOString(),
    });
    open({ type: 'club', club: panel.club });
    setClubTab('Board');
  };

  const panelTitle =
    panel?.type === 'filters'
      ? 'Filter shows'
      : panel?.type === 'event'
      ? 'Show details'
      : panel?.type === 'club'
      ? 'Club details'
      : panel?.type === 'join'
      ? 'Join club'
      : panel?.type === 'host'
      ? 'Host a show'
      : panel?.type === 'createClub'
      ? 'Create a club'
      : panel?.type === 'ticket'
      ? 'Preview booking'
      : panel?.type === 'opportunity'
      ? 'Opportunity details'
      : panel?.type === 'apply'
      ? 'Apply with Talent Passport'
      : panel?.type === 'location'
      ? 'Choose location'
      : panel?.type === 'post'
      ? 'Share with your club'
      : panel?.type === 'session'
      ? 'Create a club session'
      : panel?.type === 'trailer'
      ? 'Performance preview'
      : panel?.type === 'room'
      ? 'Online room preview'
      : 'Create in Shows';

  const clubsSurface =
    section === 'clubs' ? (
      <ClubsWorkspace
        initialClub={params.club}
        profileName={profile?.name || 'Your profile'}
        onClubChange={(club) => router.setParams({ section: 'clubs', club })}
        onBack={() => router.setParams({ section: 'shows', club: '' })}
        onProfile={() => router.push('/you' as any)}
        onShow={(event) => {
          router.setParams({ section: 'shows', club: '' });
          open({ type: 'event', event });
        }}
      />
    ) : null;

  return section === 'opportunities' ? (
    <WorkPilot onBack={() => chooseSection('shows')} />
  ) : (
    clubsSurface || (
      <main ref={scroller} className="sl" style={vars}>
        <ShowsStyles />
        <ShowsPolish />
        <header className="sl-head">
          <div className="sl-top">
            <div className="sl-brand-wrap">
              <button
                className="sl-back"
                aria-label={section === 'shows' ? 'Back to Home' : 'Back to Shows'}
                onClick={() => (section === 'shows' ? router.replace('/' as any) : chooseSection('shows'))}
              >
                <ChevronLeft size={25} strokeWidth={1.7} />
              </button>
              <div className="sl-wordmark">
                talent<i>.</i>
              </div>
            </div>
            <div className="sl-head-actions">
              <button
                className="sl-icon"
                aria-label="Search Shows"
                aria-pressed={searchOpen}
                onClick={() => setSearchOpen((v) => !v)}
              >
                <Search size={22} strokeWidth={1.7} />
              </button>
              <button
                className="sl-profile"
                aria-label="Open your profile"
                onClick={() => router.push('/you' as any)}
              >
                <img src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=200&auto=format&fit=crop'} alt="" />
              </button>
            </div>
          </div>
          <div className="sl-heading">
            <h1>{section === 'shows' ? 'Shows' : section === 'clubs' ? 'Clubs' : 'My space'}</h1>
            <p>
              {section === 'shows'
                ? 'Live experiences built around real talent.'
                : section === 'clubs'
                ? 'Find your people. Make something together.'
                : 'Your shows, communities and next steps.'}
            </p>
          </div>
          {(searchOpen || section === 'clubs') && (
            <div className="sl-search">
              <Search size={16} />
              <input
                aria-label={`Search ${section}`}
                placeholder={
                  section === 'shows'
                    ? 'Search shows, a talent, a city…'
                    : section === 'clubs'
                    ? 'Search clubs and neighbourhoods…'
                    : 'Find an opportunity…'
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button className="sl-icon" aria-label="Clear search" onClick={() => setQuery('')}>
                  <X size={15} />
                </button>
              )}
            </div>
          )}
          {section === 'shows' ? (
            <div className="sl-chips" aria-label="Filter shows">
              {[
                ['All', 'All'],
                ['In person', 'Offline'],
                ['Online', 'Online'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  aria-pressed={filter === key}
                  onClick={() => {
                    setFilter(key);
                    setShowAll(true);
                  }}
                >
                  {label}
                </button>
              ))}
              <button aria-pressed={false} onClick={() => chooseSection('clubs')}>
                Clubs
              </button>
              <button aria-pressed={city !== 'Everywhere'} onClick={() => open({ type: 'location' })}>
                Near you
              </button>
            </div>
          ) : (
            <nav className="sl-nav" role="tablist" aria-label="Shows sections">
              {(
                [
                  ['shows', 'Shows'],
                  ['clubs', 'Clubs'],
                  ['opportunities', 'Opportunities'],
                  ['mine', 'My space'],
                ] as [Section, string][]
              ).map(([key, label]) => (
                <button
                  role="tab"
                  aria-selected={section === key}
                  key={key}
                  onClick={() => chooseSection(key)}
                >
                  {label}
                </button>
              ))}
            </nav>
          )}
        </header>
        <div className="sl-content">
          {section === 'shows' && city !== 'Everywhere' && (
            <div className="sl-selected-location">
              <span>Showing {city === 'Online' ? 'online shows' : city}</span>
              <button onClick={() => setCity('Everywhere')}>Clear location ×</button>
            </div>
          )}
          {section === 'clubs' && (
            <div className="sl-chips" aria-label="Filter results">
              {(section === 'clubs'
                ? ['All', ...categories, 'Learning studio', 'Local community']
                : ['All', 'Open lineup', 'Collaboration', 'Sponsor brief']
              ).map((f) => (
                <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>
                  {f}
                </button>
              ))}
            </div>
          )}
          {section === 'shows' && (
            <>
              <div className="sl-filterbar">
                <button
                  aria-label="Filter shows by date and price"
                  aria-pressed={dateWindow !== 'any' || sort !== 'soonest'}
                  onClick={() => open({ type: 'filters' })}
                >
                  <SlidersHorizontal size={13} />
                  {dateWindow === 'any' ? 'Date & price' : `Next ${dateWindow} days`}
                </button>
                <button
                  aria-pressed={freeOnly}
                  onClick={() => {
                    setFreeOnly((v) => !v);
                    setShowAll(true);
                  }}
                >
                  Free shows
                </button>
                {activeBrowse && (
                  <button
                    className="sl-filter-reset"
                    aria-label="Reset date, price and sort"
                    onClick={resetBrowse}
                  >
                    Reset
                  </button>
                )}
              </div>
              {featuredVisible && (
                <>
                  <article className="sl-hero" aria-label="Featured show">
                    <img src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop" alt="Illustrative singer on an amber-lit stage" />
                    <div className="sl-feature-tag">
                      <Star size={12} fill="#f2dcc1" /> Featured · Sample show
                    </div>
                    <div className="sl-feature-copy">
                      <h2>
                        Live at
                        <br />
                        The Next Stage
                      </h2>
                      <p>Discovered through talent.</p>
                      <div className="sl-feature-meta">
                        <span>
                          <MapPin size={13} /> Bengaluru
                        </span>
                        <span>
                          <CalendarDays size={13} /> 7 Nov
                        </span>
                        <span>
                          <Mic2 size={13} /> 4 slots
                        </span>
                      </div>
                      <div className="sl-feature-actions">
                        <button className="sl-primary" onClick={() => open({ type: 'event', event: clubEvents[0] })}>
                          View show <ArrowRight size={16} />
                        </button>
                        <button className="sl-secondary" onClick={() => open({ type: 'ticket', event: clubEvents[0] })}>
                          <Ticket size={16} /> Preview tickets
                        </button>
                      </div>
                    </div>
                  </article>
                  <p className="sl-demo-label">DEMO LISTINGS · ILLUSTRATIVE ARTWORK &amp; LICENSED SAMPLE FOOTAGE</p>
                </>
              )}
              <div className="sl-section">
                <h2>
                  {query || activeBrowse
                    ? 'Your matches'
                    : filter === 'Online'
                    ? 'Online shows'
                    : filter === 'In person'
                    ? 'Offline shows'
                    : city !== 'Everywhere'
                    ? 'Shows near you'
                    : 'Upcoming'}
                </h2>
                {!activeBrowse && filteredEvents.length > 4 && (
                  <button className="sl-text-link" onClick={() => setShowAll((v) => !v)}>
                    {showAll ? 'Show less' : `See all ${filteredEvents.length}`} <ChevronRight size={15} />
                  </button>
                )}
              </div>
              <div className="sl-result-line">
                <span>{filteredEvents.length} sample shows</span>
                <span>{sort === 'price' ? 'Lowest price first' : 'Soonest first'}</span>
              </div>
              {(showAll || activeBrowse ? listedEvents : listedEvents.slice(0, 4)).map(eventRow)}
              {!filteredEvents.length &&
                empty(
                  'No shows here yet.',
                  'Try another city or format. You can still explore online.',
                  () => {
                    setQuery('');
                    setFilter('All');
                    setCity('Everywhere');
                    resetBrowse();
                  },
                  'Explore all shows'
                )}
              <div className="sl-host-promo">
                <span className="sl-host-mark" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <div>
                  <h2>Ready to host?</h2>
                  <p>
                    Online or offline.
                    <br />A clear brief for real talent.
                  </p>
                </div>
                <button
                  className="sl-primary"
                  onClick={() => {
                    refresh();
                    open({ type: 'host' });
                  }}
                >
                  Create show <ArrowRight size={14} />
                </button>
              </div>
              <div className="sl-quick-links">
                <button onClick={() => chooseSection('clubs')}>
                  <Users size={17} /> Join clubs
                </button>
                <span />
                <button onClick={() => chooseSection('opportunities')}>
                  <Mic2 size={17} /> Opportunities
                </button>
                <span />
                <button onClick={() => chooseSection('mine')}>
                  <Ticket size={17} /> My tickets
                </button>
              </div>
              <div className="sl-banner">
                <ShieldCheck size={22} />
                <div>
                  <strong>Talent gets you to the stage.</strong>
                  <p>
                    Apply with your work at any follower count. Hosting starts with organizer readiness, venue permission and clear terms.
                  </p>
                  <button className="sl-text-link" onClick={() => chooseSection('opportunities')}>
                    Find your opportunity <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
          {section === 'clubs' && (
            <>
              <div className="sl-kicker">Belong before you break through</div>
              <h1 className="sl-page-title">
                Your people.
                <br />
                Your kind of room.
              </h1>
              <p className="sl-intro">
                Artist-led collectives, local circles and learning studios. Come to listen, practise or create together.
              </p>
              <div className="sl-club-grid">{filteredClubs.map(clubCard)}</div>
              {!filteredClubs.length &&
                empty(
                  'Your community could start here.',
                  'Try a different search, or create a club for your area.',
                  () => open({ type: 'createClub' }),
                  'Create a club'
                )}
              <div className="sl-banner">
                <Users size={24} />
                <div>
                  <strong>A music class. A street. A shared dream.</strong>
                  <p>
                    Start a club without a follower threshold. Invite people, share work and arrange member practice sessions.
                  </p>
                  <button className="sl-text-link" onClick={() => open({ type: 'createClub' })}>
                    Start your club <Plus size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
          {section === 'mine' && (
            <>
              <div className="sl-kicker">Watch. Belong. Take your next step.</div>
              <h2 className="sl-page-title">
                Your corner
                <br />
                of the stage.
              </h2>
              <div className="sl-chips" style={{ marginTop: 20 }}>
                {['Plans', 'Clubs', 'Applications', 'Saved', 'Hosting'].map((t) => (
                  <button key={t} aria-pressed={mineTab === t} onClick={() => setMineTab(t)}>
                    {t}
                  </button>
                ))}
              </div>
              {mineTab === 'Plans' && (
                <>
                  {clubEvents.filter((e) => community.attending[e.id]).map(eventRow)}
                  {!clubEvents.some((e) => community.attending[e.id]) &&
                    empty(
                      'Make room for a good show.',
                      'Your preview tickets and attendance plans will appear here.',
                      () => chooseSection('shows'),
                      'Discover shows'
                    )}
                </>
              )}
              {mineTab === 'Clubs' && (
                <>
                  <div className="sl-club-grid">
                    {allClubs.filter((c) => community.memberships[c.id]).map(clubCard)}
                  </div>
                  {!allClubs.some((c) => community.memberships[c.id]) &&
                    empty(
                      'Find people who get your work.',
                      'Join as a fan or a performer. You can switch roles later.',
                      () => chooseSection('clubs'),
                      'Explore clubs'
                    )}
                </>
              )}
              {mineTab === 'Applications' && (
                <>
                  {clubEvents
                    .filter((e) => community.applications[e.id])
                    .map((e) => (
                      <div className="sl-application" key={e.id}>
                        <strong>{e.title}</strong>
                        <p>{community.applications[e.id]} · Saved locally, not submitted</p>
                        <button className="sl-text-link" onClick={() => open({ type: 'event', event: e })}>
                          View show <ArrowUpRight size={14} />
                        </button>
                      </div>
                    ))}
                  {opportunities.filter((o) => lab.opportunityApplications[o.id]).map(oppRow)}
                  {!Object.keys(community.applications).length &&
                    !Object.keys(lab.opportunityApplications).length &&
                    empty(
                      'Your next opportunity starts with your work.',
                      'Choose a brief and apply with a performance from your Passport.',
                      () => chooseSection('opportunities'),
                      'Explore opportunities'
                    )}
                </>
              )}
              {mineTab === 'Saved' && (
                <>
                  {clubEvents.filter((e) => lab.saved.includes(e.id)).map(eventRow)}
                  {!clubEvents.some((e) => lab.saved.includes(e.id)) &&
                    empty(
                      'A shortlist worth coming back to.',
                      'Save a show from its details to find it here.',
                      () => chooseSection('shows'),
                      'Explore shows'
                    )}
                </>
              )}
              {mineTab === 'Hosting' && (
                <>
                  <button
                    className="sl-primary sl-wide"
                    onClick={() => {
                      refresh();
                      open({ type: 'host' });
                    }}
                  >
                    Plan a show <Plus size={16} />
                  </button>
                  {hosted.map((s) => (
                    <div className="sl-application" key={s.id}>
                      <span className="sl-badge pink">Device-local show</span>
                      <h3>{s.title}</h3>
                      <p>{s.location}</p>
                      <p>Saved in this preview. No public listing.</p>
                    </div>
                  ))}
                  {lab.drafts.map((d) => (
                    <div className="sl-application" key={d.id}>
                      <span className="sl-badge pink">Private draft</span>
                      <h3 style={{ marginTop: 8 }}>{d.title}</h3>
                      <p>
                        {d.format} · {d.location}
                      </p>
                      <button className="sl-text-link" onClick={() => open({ type: 'host', draft: d })}>
                        Continue planning <ArrowUpRight size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="sl-callout">
                    <strong>Public show hosting</strong>
                    <p>
                      No follower or score minimum. Prepare organizer details, venue permission and clear terms. Real public listings need an independent review before launch.
                    </p>
                  </div>
                </>
              )}
            </>
          )}
          {localNotice}
        </div>
        {panel &&
          typeof document !== 'undefined' &&
          createPortal(
            <div
              className="sl-overlay"
              style={vars}
              onClick={(e) => {
                if (e.target === e.currentTarget) setPanel(null);
              }}
            >
              <section
                className="sl-sheet"
                ref={dialog}
                role="dialog"
                aria-modal="true"
                aria-label={panelTitle}
                tabIndex={-1}
              >
                <div className="sl-handle" />
                <div className="sl-sheet-top">
                  <span className="sl-kicker">
                    {panel.type === 'location'
                      ? 'DISCOVERY LOCATION'
                      : panel.type === 'create'
                      ? 'MAKE SOMETHING HAPPEN'
                      : 'DISCOVERY LAB · PREVIEW'}
                  </span>
                  <button
                    className="sl-icon"
                    aria-label="Close Shows dialog"
                    onClick={() => setPanel(null)}
                  >
                    <X size={22} />
                  </button>
                </div>
                {panel.type === 'filters' && (
                  <>
                    <h2>Find your next show</h2>
                    <p className="sl-description">
                      Choose when to go and what to spend. Online and offline formats stay selected in the Shows header.
                    </p>
                    <h3 className="sl-filter-title">When</h3>
                    <div className="sl-filter-options">
                      {[
                        ['any', 'Any date'],
                        ['7', 'Next 7 days'],
                        ['30', 'Next 30 days'],
                      ].map(([key, label]) => (
                        <button
                          key={key}
                          aria-pressed={dateWindow === key}
                          onClick={() => setDateWindow(key as any)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <h3 className="sl-filter-title">Price</h3>
                    <div className="sl-filter-options">
                      <button aria-pressed={!freeOnly} onClick={() => setFreeOnly(false)}>
                        All prices
                      </button>
                      <button aria-pressed={freeOnly} onClick={() => setFreeOnly(true)}>
                        Free only
                      </button>
                    </div>
                    <h3 className="sl-filter-title">Sort results</h3>
                    <div className="sl-filter-options">
                      <button aria-pressed={sort === 'soonest'} onClick={() => setSort('soonest')}>
                        Soonest first
                      </button>
                      <button aria-pressed={sort === 'price'} onClick={() => setSort('price')}>
                        Lowest price
                      </button>
                    </div>
                    <div className="sl-filter-summary">
                      <strong>{filteredEvents.length} matching sample shows</strong>
                      Includes your current search, format and location.
                    </div>
                    <button
                      className="sl-primary sl-wide"
                      onClick={() => {
                        setShowAll(true);
                        setPanel(null);
                      }}
                    >
                      Show {filteredEvents.length} results <ArrowRight size={15} />
                    </button>
                    <button className="sl-text-link" onClick={resetBrowse}>
                      Reset date, price and sort
                    </button>
                  </>
                )}
                {panel.type === 'create' && (
                  <>
                    <h2>
                      A room. A stage.
                      <br />A beginning.
                    </h2>
                    <p className="sl-description">What would you like to bring together?</p>
                    <button className="sl-choice" onClick={() => open({ type: 'createClub' })}>
                      <Users size={25} />
                      <span>
                        <strong>Create a club</strong>
                        <small>For an artist, your area or your class. Open to everyone.</small>
                      </span>
                      <ChevronRight size={18} />
                    </button>
                    <button
                      className="sl-choice"
                      onClick={() => {
                        refresh();
                        open({ type: 'host' });
                      }}
                    >
                      <Ticket size={25} />
                      <span>
                        <strong>Plan a public show</strong>
                        <small>Online or in person. Verified host requirements apply.</small>
                      </span>
                      <ChevronRight size={18} />
                    </button>
                    <p className="sl-footnote">
                      Members of your own club can practise together through private club sessions without publishing a public show.
                    </p>
                  </>
                )}
                {panel.type === 'location' && (
                  <>
                    <h2>Closer to your people.</h2>
                    <p className="sl-description">Choose a place to browse. This does not use your device location.</p>
                    {['Everywhere', 'Bengaluru', 'Mumbai', 'Delhi', 'Online'].map((location) => (
                      <button
                        className="sl-choice"
                        key={location}
                        onClick={() => {
                          setCity(location);
                          setPanel(null);
                        }}
                        aria-pressed={city === location}
                      >
                        {location === 'Online' ? <Globe size={20} /> : <MapPin size={20} />}
                        <strong>{location}</strong>
                        {city === location && <Check size={18} />}
                      </button>
                    ))}
                  </>
                )}
                {panel.type === 'event' &&
                  (() => {
                    const event = panel.event,
                      meta = eventDetails[event.id],
                      club = getClub(event.clubId),
                      offline = event.format === 'In person';
                    return (
                      <>
                        <div className="sl-cover">
                          <img
                            src={(showArtwork[event.id] || showArtwork['open-room']).image}
                            alt="Sample show artwork"
                          />
                        </div>
                        <div className="sl-row">
                          <span className="sl-badge pink">
                            {offline
                              ? 'Offline show'
                              : event.format === 'Club vs club'
                              ? 'Online · Club exchange'
                              : 'Online show'}
                          </span>
                          <button
                            className={`sl-icon ${lab.saved.includes(event.id) ? 'sl-saved' : ''}`}
                            aria-label={lab.saved.includes(event.id) ? 'Unsave show' : 'Save show'}
                            aria-pressed={lab.saved.includes(event.id)}
                            onClick={() => lab.toggleSaved(event.id)}
                          >
                            <Bookmark
                              size={21}
                              fill={lab.saved.includes(event.id) ? '#44644c' : 'transparent'}
                            />
                          </button>
                        </div>
                        <h2>{event.title}</h2>
                        <div
                          className="sl-event-modes"
                          role="tablist"
                          aria-label="Take part in this show"
                        >
                          {['Attend', 'Perform'].map((mode) => (
                            <button
                              role="tab"
                              aria-selected={eventMode === mode}
                              key={mode}
                              onClick={() => setEventMode(mode)}
                            >
                              {mode === 'Attend' ? 'Attend the show' : 'Apply to perform'}
                            </button>
                          ))}
                        </div>
                        {eventMode === 'Attend' ? (
                          <>
                            <div className="sl-show-facts">
                              <div>
                                <CalendarDays size={18} />
                                <strong>{event.date} 2026</strong>
                                <small>
                                  {event.time} · {meta?.duration}
                                </small>
                              </div>
                              <div>
                                {offline ? <MapPin size={18} /> : <Globe size={18} />}
                                <strong>{offline ? 'At the venue' : 'Join from anywhere'}</strong>
                                <small>{event.location}</small>
                              </div>
                            </div>
                            {club && (
                              <button className="sl-text-link" onClick={() => open({ type: 'club', club })}>
                                <Users size={16} /> Hosted by {club.name}
                                <ArrowUpRight size={14} />
                              </button>
                            )}
                            <p className="sl-description">
                              {meta?.subtitle}{' '}
                              {offline
                                ? 'Come to listen, discover a new performer and enjoy a shared stage.'
                                : 'Enjoy the showcase from wherever you are.'}{' '}
                              No talent score is needed to attend.
                            </p>
                            <button className="sl-preview-link" onClick={() => open({ type: 'trailer', event })}>
                              <span>
                                <Play size={17} fill="currentColor" />
                              </span>
                              <span>
                                <strong>Watch a sample performance</strong>
                                <small>Recorded footage · not this show’s confirmed lineup</small>
                              </span>
                              <ChevronRight size={17} />
                            </button>
                            <div className="sl-callout">
                              <div className="sl-row">
                                <strong>
                                  {community.attending[event.id]
                                    ? 'Your preview place is saved'
                                    : price(meta?.price || 0) + ' / person'}
                                </strong>
                                <Ticket size={21} />
                              </div>
                              <p className="sl-event-price-note">
                                {offline
                                  ? 'A preview pass for the venue.'
                                  : 'A preview pass with online-room access.'}{' '}
                                No payment is collected.
                              </p>
                              <button className="sl-primary sl-wide" onClick={() => open({ type: 'ticket', event })}>
                                {community.attending[event.id]
                                  ? 'View my preview pass'
                                  : offline
                                  ? 'Choose preview tickets'
                                  : 'Reserve an online place'}
                                <ArrowRight size={16} />
                              </button>
                            </div>
                            <details className="sl-booking-info">
                              <summary>Venue &amp; booking information</summary>
                              <p>
                                Sample venue and unconfirmed lineup. This is a UI preview, not a real ticket sale. A live listing must show organizer checks, accessibility, full price, cancellation terms and contact details before payment.
                              </p>
                            </details>
                          </>
                        ) : (
                          <>
                            <span className="sl-badge">OPEN PERFORMANCE CALL</span>
                            <h3>Bring your work to this stage.</h3>
                            <p className="sl-description">{event.brief}</p>
                            <div className="sl-show-facts">
                              <div>
                                <Mic2 size={18} />
                                <strong>{meta?.slots} sample slots</strong>
                                <small>{event.category} · review by the host</small>
                              </div>
                              <div>
                                <CalendarDays size={18} />
                                <strong>Closes {meta?.deadline}</strong>
                                <small>
                                  Show: {event.date} · {event.time}
                                </small>
                              </div>
                            </div>
                            <div className="sl-callout">
                              <strong>Your performance comes first.</strong>
                              <p>
                                No badge or follower minimum to apply. The host reviews your work and fit. Applying is separate from audience tickets and does not guarantee selection.
                              </p>
                            </div>
                            {community.applications[event.id] ? (
                              <div className="sl-status">
                                Application saved: {community.applications[event.id]}
                                <br />
                                Not sent to a real organizer.
                              </div>
                            ) : (
                              <button
                                className="sl-primary sl-wide"
                                onClick={() => {
                                  refresh();
                                  open({ type: 'apply', event });
                                }}
                              >
                                Apply with Talent Passport <ArrowRight size={16} />
                              </button>
                            )}
                            <p className="sl-footnote">
                              Sample performance call. Real briefs need clear pay, credits, rights and selection terms.
                            </p>
                          </>
                        )}
                      </>
                    );
                  })()}
                {panel.type === 'ticket' &&
                  (() => {
                    const event = panel.event,
                      meta = eventDetails[event.id],
                      booked = Boolean(community.attending[event.id]),
                      ticket = lab.tickets?.[event.id];
                    return (
                      <>
                        <h2>{booked ? 'You’ve made a plan.' : 'A place in the audience.'}</h2>
                        <div className="sl-ticket">
                          <div className="sl-row">
                            <span className="sl-badge pink">{booked ? 'PREVIEW PASS' : 'SAMPLE RESERVATION'}</span>
                            <Ticket size={24} />
                          </div>
                          <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 24 }}>{event.title}</h3>
                          <p className="sl-meta">
                            {event.date} 2026 · {event.time}
                          </p>
                          <p className="sl-meta">{event.location}</p>
                          {booked ? (
                            <>
                              <p className="sl-meta">
                                {ticket?.quantity || 1} {(ticket?.quantity || 1) === 1 ? 'place' : 'places'} ·{' '}
                                {event.format === 'In person' ? 'In person' : 'Online'}
                              </p>
                              <div className="sl-ticket-code">DEMO-{event.id.toUpperCase()}-999</div>
                              <p className="sl-footnote">Not valid for entry. No payment or real reservation.</p>
                            </>
                          ) : (
                            <>
                              <div className="sl-rule" />
                              <div className="sl-row">
                                <strong>People</strong>
                                <div className="sl-stepper">
                                  <button
                                    aria-label="Fewer tickets"
                                    disabled={quantity <= 1}
                                    onClick={() => setQuantity((q) => q - 1)}
                                  >
                                    <Minus size={15} />
                                  </button>
                                  <span aria-live="polite">{quantity}</span>
                                  <button
                                    aria-label="More tickets"
                                    disabled={quantity >= 4}
                                    onClick={() => setQuantity((q) => q + 1)}
                                  >
                                    <Plus size={15} />
                                  </button>
                                </div>
                              </div>
                              <div className="sl-row" style={{ marginTop: 20 }}>
                                <strong>Sample total</strong>
                                <strong>{price((meta?.price || 0) * quantity)}</strong>
                              </div>
                              <p className="sl-footnote">No fees or payments are collected in this preview.</p>
                            </>
                          )}
                        </div>
                        {booked ? (
                          <>
                            {event.format !== 'In person' && (
                              <button className="sl-primary sl-wide" onClick={() => open({ type: 'room', event })}>
                                Preview online room <Video size={17} />
                              </button>
                            )}
                            <button
                              className="sl-secondary sl-wide"
                              onClick={() => {
                                community.cancel(event.id);
                                lab.cancelTicket(event.id);
                                setMessage('Preview reservation cancelled.');
                              }}
                            >
                              Cancel preview reservation
                            </button>
                          </>
                        ) : (
                          <>
                            <label className="sl-check">
                              <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                              />
                              I understand this is a preview pass, not a real booking or payment.
                            </label>
                            <button
                              className="sl-primary sl-wide"
                              disabled={!agreed}
                              onClick={() => {
                                community.rsvp(event.id, event.format === 'In person' ? 'In person' : 'Online');
                                lab.reserve(event.id, quantity, (meta?.price || 0) * quantity);
                                setMessage('Saved to My space → Plans on this device.');
                              }}
                            >
                              Confirm preview reservation <Check size={16} />
                            </button>
                          </>
                        )}
                      </>
                    );
                  })()}
                {panel.type === 'room' && (
                  <>
                    <span className="sl-online-tag">
                      <Globe size={12} /> Online show · preview
                    </span>
                    <h2>{panel.event.title}</h2>
                    <div className="sl-room-lobby">
                      <Video size={33} />
                      <h3>Your seat. From anywhere.</h3>
                      <p>
                        {panel.event.date} · {panel.event.time}
                        <br />
                        This demo room is not live.
                      </p>
                      <button
                        className="sl-primary sl-wide"
                        onClick={() => open({ type: 'trailer', event: panel.event })}
                      >
                        <Play size={15} /> Watch a sample performance
                      </button>
                    </div>
                    <div className="sl-show-facts">
                      <div>
                        <CalendarDays size={18} />
                        <strong>Before the show</strong>
                        <small>Check the schedule and your saved pass.</small>
                      </div>
                      <div>
                        <MessageCircle size={18} />
                        <strong>During the show</strong>
                        <small>Performance, audience responses and host updates.</small>
                      </div>
                    </div>
                    <button className="sl-text-link" onClick={() => open({ type: 'ticket', event: panel.event })}>
                      View my preview pass <Ticket size={15} />
                    </button>
                    <p className="sl-footnote">
                      Room layout preview only. No broadcast, audience chat or real access credentials.
                    </p>
                  </>
                )}
                {panel.type === 'trailer' &&
                  (() => {
                    const art = showArtwork[panel.event.id] || showArtwork['open-room'];
                    return (
                      <>
                        <span className="sl-badge pink">LICENSED SAMPLE · RECORDED</span>
                        <h2>A taste of the craft.</h2>
                        <p className="sl-description">
                          {art.sample}. Demonstration footage to help you explore this flow—not the performers booked for {panel.event.title}.
                        </p>
                        <video
                          className="sl-room-video"
                          controls
                          playsInline
                          preload="metadata"
                          poster={art.image}
                          src={art.video}
                          aria-label="Recorded sample performance"
                        />
                        <p className="sl-footnote">
                          {art.credit} ·{' '}
                          <a href="/credits.html" target="_blank" rel="noreferrer">
                            Original sources &amp; licences
                          </a>
                        </p>
                        <button
                          className="sl-primary sl-wide"
                          onClick={() => open({ type: 'event', event: panel.event })}
                        >
                          Back to show <ArrowRight size={16} />
                        </button>
                        {panel.event.format !== 'In person' && (
                          <button
                            className="sl-text-link"
                            onClick={() => open({ type: 'room', event: panel.event })}
                          >
                            Explore the online room <Video size={15} />
                          </button>
                        )}
                      </>
                    );
                  })()}
                {panel.type === 'club' &&
                  (() => {
                    const c = panel.club,
                      joined = community.memberships[c.id],
                      mine = ownClub(c);
                    return (
                      <>
                        <div className="sl-club-head">
                          <div className="sl-club-art" style={{ background: c.color }}>
                            {c.initials}
                          </div>
                          <div>
                            <div className="sl-kicker">{'kind' in c ? String(c.kind) : clubKinds[c.id]}</div>
                            <h2>{c.name}</h2>
                          </div>
                        </div>
                        <p className="sl-meta">
                          <MapPin size={15} />
                          {c.city} · {c.category} · {mine ? 'Created by you' : 'Sample community'}
                        </p>
                        <div className="sl-row" style={{ marginTop: 15 }}>
                          <button className="sl-primary" onClick={() => open({ type: 'join', club: c })}>
                            {joined ? `Joined · ${joined}` : 'Join this club'}
                            {joined ? <Check size={16} /> : <Plus size={16} />}
                          </button>
                          {joined && (
                            <button className="sl-text-link" onClick={() => open({ type: 'post', club: c })}>
                              Share with club <Plus size={15} />
                            </button>
                          )}
                        </div>
                        <div className="sl-mini-tabs" role="tablist" aria-label="Club sections">
                          {['About', 'Sessions', 'Board'].map((t) => (
                            <button
                              key={t}
                              role="tab"
                              aria-selected={clubTab === t}
                              onClick={() => setClubTab(t)}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                        {clubTab === 'About' && (
                          <>
                            <p className="sl-description">{c.description}</p>
                            <div className="sl-callout pink">
                              <div className="sl-kicker">This week’s creative prompt</div>
                              {c.prompt}
                            </div>
                            <h3>A place for every role.</h3>
                            <p className="sl-description">
                              Fans listen, support and attend. Performers share work, practise and apply for lineups. Your membership role can change whenever you’re ready.
                            </p>
                            {opportunities.filter((o) => o.clubId === c.id).map(oppRow)}
                            {mine && (
                              <button
                                className="sl-secondary sl-wide"
                                onClick={() => open({ type: 'session', club: c })}
                              >
                                Plan a member practice <CalendarDays size={16} />
                              </button>
                            )}
                          </>
                        )}
                        {clubTab === 'Sessions' && (
                          <>
                            {clubEvents.filter((e) => e.clubId === c.id).map(eventRow)}
                            {lab.sessions
                              .filter((s) => s.clubId === c.id)
                              .map((s) => (
                                <div className="sl-application" key={s.id}>
                                  <span className="sl-badge pink">Members’ practice · local plan</span>
                                  <h3>{s.title}</h3>
                                  <p>
                                    {new Date(s.date).toLocaleString('en-IN', {
                                      timeZone: 'Asia/Kolkata',
                                      dateStyle: 'medium',
                                      timeStyle: 'short',
                                    })}{' '}
                                    IST
                                  </p>
                                  <p>
                                    {s.format} · {s.location}
                                  </p>
                                  <p>No public tickets or live room. Visible only on this device.</p>
                                </div>
                              ))}
                            {!clubEvents.some((e) => e.clubId === c.id) &&
                              !lab.sessions.some((s) => s.clubId === c.id) &&
                              empty('Start small. Practise together.', 'There are no sessions planned here yet.')}
                            <button
                              className="sl-secondary sl-wide"
                              onClick={() => (mine ? open({ type: 'session', club: c }) : open({ type: 'host' }))}
                            >
                              {mine ? 'Plan a member practice' : 'See public hosting requirements'}
                            </button>
                          </>
                        )}
                        {clubTab === 'Board' && (
                          <>
                            {joined ? (
                              <button className="sl-secondary sl-wide" onClick={() => open({ type: 'post', club: c })}>
                                Share work or find a collaborator <Plus size={16} />
                              </button>
                            ) : (
                              <div className="sl-callout">
                                Join the club to post updates, share a performance or ask for a collaborator.
                                <button className="sl-text-link" onClick={() => open({ type: 'join', club: c })}>
                                  Find your place <ArrowRight size={14} />
                                </button>
                              </div>
                            )}
                            {lab.posts
                              .filter((p) => p.clubId === c.id)
                              .map((post) => (
                                <div className="sl-post" key={post.id}>
                                  <div className="sl-row">
                                    <strong>You</strong>
                                    <span className="sl-badge pink">{post.kind}</span>
                                  </div>
                                  <small>Device-local club post</small>
                                  <p style={{ marginTop: 10 }}>{post.text}</p>
                                  {post.performanceId && (
                                    <button
                                      className="sl-text-link"
                                      onClick={() => {
                                        setPanel(null);
                                        router.push(('/video/' + post.performanceId) as any);
                                      }}
                                    >
                                      <Play size={14} />
                                      {post.performanceTitle || 'View performance'}
                                    </button>
                                  )}
                                </div>
                              ))}
                            {!lab.posts.some((p) => p.clubId === c.id) &&
                              empty(
                                'Every community starts with a hello.',
                                'Introduce yourself, share what you’re practising, or find someone to create with.'
                              )}
                          </>
                        )}
                        {localNotice}
                      </>
                    );
                  })()}
                {panel.type === 'join' && (
                  <>
                    <h2>Find your place.</h2>
                    <p className="sl-description">
                      {panel.club.name}
                      <br />
                      How would you like to take part?
                    </p>
                    {(['Fan', 'Performer'] as const).map((r) => (
                      <button
                        className="sl-choice"
                        key={r}
                        aria-pressed={role === r}
                        onClick={() => setRole(r)}
                      >
                        {r === 'Fan' ? <Ticket size={23} /> : <Mic2 size={23} />}
                        <span>
                          <strong>{r === 'Fan' ? 'Watch & support' : 'Create & perform'}</strong>
                          <small>
                            {r === 'Fan'
                              ? 'Attend shows and follow your community.'
                              : 'Share work, practise and apply for opportunities.'}
                          </small>
                        </span>
                        <span className="sl-radio" />
                      </button>
                    ))}
                    <label className="sl-check">
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                      />
                      I’ll respect members, share work I have the right to share and offer constructive feedback.
                    </label>
                    <button
                      className="sl-primary sl-wide"
                      disabled={!agreed}
                      onClick={() => {
                        community.join(panel.club.id, role);
                        open({ type: 'club', club: panel.club });
                      }}
                    >
                      Confirm membership <Check size={16} />
                    </button>
                    {community.memberships[panel.club.id] && !ownClub(panel.club) && (
                      <button
                        className="sl-text-link"
                        style={{ margin: '12px auto 0' }}
                        onClick={() => {
                          community.leave(panel.club.id);
                          open({ type: 'club', club: panel.club });
                        }}
                      >
                        Leave this club
                      </button>
                    )}
                    <p className="sl-footnote">
                      You can change your role later. Membership does not guarantee a performance slot.
                    </p>
                  </>
                )}
                {panel.type === 'createClub' && (
                  <>
                    <h2>
                      Great things start
                      <br />
                      with a few people.
                    </h2>
                    <p className="sl-description">
                      An artist’s circle, a neighbourhood club or your tuition studio. No follower requirement.
                    </p>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        createClub();
                      }}
                    >
                      <label className="sl-label" htmlFor="sl-name">
                        Club name
                      </label>
                      <input
                        id="sl-name"
                        className="sl-input"
                        maxLength={70}
                        value={form.name}
                        onChange={(e) => update('name', e.target.value)}
                        placeholder="e.g. JP Nagar Music Circle"
                        required
                      />
                      <div className="sl-two">
                        <div>
                          <label className="sl-label" htmlFor="sl-category">
                            Talent category
                          </label>
                          <select
                            id="sl-category"
                            className="sl-select"
                            value={form.category}
                            onChange={(e) => update('category', e.target.value)}
                          >
                            {categories.map((c) => (
                              <option key={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="sl-label" htmlFor="sl-kind">
                            Club type
                          </label>
                          <select
                            id="sl-kind"
                            className="sl-select"
                            value={form.kind}
                            onChange={(e) => update('kind', e.target.value)}
                          >
                            {['Local community', 'Artist-led', 'Learning studio'].map((c) => (
                              <option key={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <label className="sl-label" htmlFor="sl-city">
                        Area / city, or Online
                      </label>
                      <input
                        id="sl-city"
                        className="sl-input"
                        maxLength={80}
                        value={form.city}
                        onChange={(e) => update('city', e.target.value)}
                        required
                      />
                      <label className="sl-label" htmlFor="sl-description">
                        What brings you together?
                      </label>
                      <textarea
                        id="sl-description"
                        className="sl-textarea"
                        maxLength={600}
                        value={form.description}
                        onChange={(e) => update('description', e.target.value)}
                        placeholder="Who is this for? What will you practise or create?"
                        required
                      />
                      <label className="sl-check">
                        <input
                          type="checkbox"
                          checked={agreed}
                          onChange={(e) => setAgreed(e.target.checked)}
                        />
                        I’ll maintain a respectful community and won’t claim to represent an artist or studio without permission.
                      </label>
                      <button className="sl-primary sl-wide" type="submit" disabled={!agreed}>
                        Create preview club <Plus size={16} />
                      </button>
                    </form>
                    {localNotice}
                  </>
                )}
                {panel.type === 'opportunity' &&
                  (() => {
                    const o = panel.opportunity,
                      application = lab.opportunityApplications[o.id];
                    return (
                      <>
                        <span className="sl-badge pink">{o.kind} · Sample brief</span>
                        <h2>{o.title}</h2>
                        <p className="sl-meta">
                          <MapPin size={15} />
                          {o.city} · {o.category}
                        </p>
                        <p className="sl-meta">
                          <CalendarDays size={15} />
                          Applications close {o.deadline} 2026
                        </p>
                        <p className="sl-meta">
                          <Briefcase size={15} />
                          {o.reward}
                        </p>
                        <button
                          className="sl-text-link"
                          onClick={() => {
                            const c = getClub(o.clubId);
                            if (c) open({ type: 'club', club: c });
                          }}
                        >
                          By {getClub(o.clubId)?.name} <ArrowUpRight size={14} />
                        </button>
                        <p className="sl-description">{o.brief}</p>
                        <h3>What to bring</h3>
                        {o.requirements.map((r) => (
                          <div key={r} className="sl-meta">
                            <Check size={15} />
                            {r}
                          </div>
                        ))}
                        <div className="sl-callout pink">
                          <strong>Your work comes first.</strong>
                          <p>
                            No follower minimum to apply. Selection should consider your performance, suitability and availability.
                          </p>
                        </div>
                        {application ? (
                          <>
                            <div className="sl-status">
                              Application saved locally
                              <br />
                              <strong>{application.performanceTitle}</strong>
                              {application.note && <p>{application.note}</p>}
                              No real organizer has received this application.
                            </div>
                            <button
                              className="sl-secondary sl-wide"
                              onClick={() => {
                                lab.withdrawOpportunity(o.id);
                                setMessage('Local application withdrawn.');
                              }}
                            >
                              Withdraw local application
                            </button>
                          </>
                        ) : (
                          <button
                            className="sl-primary sl-wide"
                            onClick={() => {
                              refresh();
                              open({ type: 'apply', opportunity: o });
                            }}
                          >
                            Apply with Talent Passport <ArrowRight size={16} />
                          </button>
                        )}
                        {o.eventId && (
                          <button
                            className="sl-text-link"
                            onClick={() => {
                              const event = clubEvents.find((e) => e.id === o.eventId);
                              if (event) open({ type: 'event', event });
                            }}
                          >
                            View the show <ArrowUpRight size={14} />
                          </button>
                        )}
                        <p className="sl-footnote">
                          Sample opportunity. No application fee, paid reach or guaranteed selection. In the live product, organizer checks and clear credit, usage and payment terms are required.
                        </p>
                      </>
                    );
                  })()}
                {panel.type === 'apply' && (
                  <>
                    <span className="sl-badge pink">YOUR ABILITY → YOUR NEXT STEP</span>
                    <h2>
                      Let your work
                      <br />
                      introduce you.
                    </h2>
                    <p className="sl-description">{panel.event?.title || panel.opportunity?.title}</p>
                    {message ? (
                      <div className="sl-callout">
                        <Check size={23} />
                        <strong> Your application is saved.</strong>
                        <p>Find it in My space → Applications. This preview has not sent it to anyone.</p>
                        <button
                          className="sl-text-link"
                          onClick={() => {
                            setPanel(null);
                            chooseSection('mine');
                            setMineTab('Applications');
                          }}
                        >
                          View my applications <ArrowRight size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        {performancePicker}
                        <label className="sl-label" htmlFor="sl-note">
                          Why is this a good fit? <span style={{ fontWeight: 400 }}>(optional)</span>
                        </label>
                        <textarea
                          id="sl-note"
                          className="sl-textarea"
                          maxLength={600}
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Your idea, availability, or what you’d like to bring…"
                        />
                        <button
                          className="sl-primary sl-wide"
                          disabled={!selected}
                          onClick={apply}
                        >
                          Save preview application <ArrowRight size={16} />
                        </button>
                        <p className="sl-footnote">
                          Your selected performance and Passport would go to the host. No follower minimum. No guaranteed selection.
                        </p>
                      </>
                    )}
                  </>
                )}
                {panel.type === 'post' && (
                  <>
                    <h2>
                      Make the room
                      <br />a little more yours.
                    </h2>
                    <p className="sl-meta">{panel.club.name}</p>
                    {!community.memberships[panel.club.id] ? (
                      <div className="sl-status">Join the club before posting.</div>
                    ) : (
                      <>
                        <label className="sl-label" htmlFor="sl-post-kind">
                          What would you like to share?
                        </label>
                        <select
                          id="sl-post-kind"
                          className="sl-select"
                          value={postKind}
                          onChange={(e) => setPostKind(e.target.value as typeof postKind)}
                        >
                          {['Update', 'Performance', 'Collaboration'].map((k) => (
                            <option key={k}>{k}</option>
                          ))}
                        </select>
                        {postKind === 'Performance' && performancePicker}
                        <label className="sl-label" htmlFor="sl-post-text">
                          Your message
                        </label>
                        <textarea
                          id="sl-post-text"
                          className="sl-textarea"
                          value={note}
                          maxLength={1200}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder={
                            postKind === 'Collaboration'
                              ? 'Who do you need? Tell people about the project, credits, payment and availability.'
                              : 'What are you working on? What feedback would help?'
                          }
                        />
                        <button
                          className="sl-primary sl-wide"
                          disabled={!note.trim() || (postKind === 'Performance' && !selected)}
                          onClick={sharePost}
                        >
                          Share preview post <Plus size={16} />
                        </button>
                      </>
                    )}
                    {localNotice}
                  </>
                )}
                {(panel.type === 'host' || panel.type === 'session') && (
                  <>
                    <span className="sl-badge pink">
                      {panel.type === 'host'
                        ? 'PUBLIC SHOW · ORGANIZER READINESS'
                        : 'MEMBERS’ PRACTICE · PRIVATE PLAN'}
                    </span>
                    <h2>
                      {panel.type === 'host'
                        ? 'Build a stage\nworth stepping onto.'
                        : 'Small sessions.\nSteady progress.'}
                    </h2>
                    {panel.type === 'host' ? (
                      <>
                        <p className="sl-description">
                          Plan a show at any follower count. These declarations prepare a draft for review; they do not verify your identity or publish a real event.
                        </p>
                        <div className="sl-callout">
                          {[
                            ['organizerDeclared', 'I can supply organizer identity for review.'],
                            ['venueConfirmed', 'I have venue permission or authority to host online.'],
                            ['termsAccepted', 'I will disclose participant, usage, payment and cancellation terms.'],
                          ].map(([key, label]) => (
                            <label className="sl-check" key={key}>
                              <input
                                type="checkbox"
                                checked={(hostReady as any)[key]}
                                onChange={(e) =>
                                  setHostReady((r) => ({ ...r, [key]: e.target.checked }))
                                }
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                        {eligibility.checks.map((check) => (
                          <div className="sl-proof-step" key={check.label}>
                            {check.met ? <ShieldCheck size={21} /> : <LockKeyhole size={20} />}
                            <div>
                              <strong>{check.label}</strong>
                              <small>Current: {check.current}</small>
                            </div>
                          </div>
                        ))}
                        <p className="sl-footnote">
                          No backer, score or badge gate. A live service must independently review identity, venue authority and event terms. This lab only saves a device-local demo.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="sl-description">
                          For members of {panel.club.name}. A practice, lesson or collaboration session—not a public, ticketed show.
                        </p>
                        <div className="sl-callout">
                          Member practices remain separate from public ticketed shows. Organizer readiness applies to public show drafts.
                        </div>
                      </>
                    )}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (panel.type === 'host') void saveShow();
                        else createSession();
                      }}
                    >
                      <label className="sl-label" htmlFor="sl-show-title">
                        {panel.type === 'host' ? 'Show' : 'Session'} title
                      </label>
                      <input
                        id="sl-show-title"
                        className="sl-input"
                        value={form.title}
                        maxLength={100}
                        onChange={(e) => update('title', e.target.value)}
                        required
                      />
                      <div className="sl-two">
                        <div>
                          <label className="sl-label" htmlFor="sl-format">
                            Format
                          </label>
                          <select
                            id="sl-format"
                            className="sl-select"
                            value={form.format}
                            onChange={(e) => update('format', e.target.value)}
                          >
                            <option>Online</option>
                            <option>In person</option>
                          </select>
                        </div>
                        <div>
                          <label className="sl-label" htmlFor="sl-date">
                            Date &amp; time · IST
                          </label>
                          <input
                            id="sl-date"
                            className="sl-input"
                            type="datetime-local"
                            value={form.date.replace('+05:30', '')}
                            onInput={(e) =>
                              update(
                                'date',
                                e.currentTarget.value ? e.currentTarget.value + '+05:30' : ''
                              )
                            }
                            required
                          />
                        </div>
                      </div>
                      <label className="sl-label" htmlFor="sl-location">
                        {form.format === 'Online' ? 'Online session description' : 'Venue and area'}
                      </label>
                      <input
                        id="sl-location"
                        className="sl-input"
                        value={form.location}
                        maxLength={160}
                        placeholder={form.format === 'Online' ? 'e.g. Online acoustic rehearsal' : 'Venue, area and city'}
                        onChange={(e) => update('location', e.target.value)}
                        required
                      />
                      {panel.type === 'host' && (
                        <>
                          <label className="sl-label" htmlFor="sl-brief">
                            What kind of performers are you looking for?
                          </label>
                          <textarea
                            id="sl-brief"
                            className="sl-textarea"
                            value={form.brief}
                            maxLength={1000}
                            onChange={(e) => update('brief', e.target.value)}
                            placeholder="Talent, set length, pay, requirements and selection process…"
                            required
                          />
                        </>
                      )}
                      <button className="sl-primary sl-wide" type="submit">
                        {panel.type === 'host' ? 'Save private draft' : 'Save member practice plan'}{' '}
                        <Check size={16} />
                      </button>
                      {panel.type === 'host' && (
                        <button
                          className="sl-secondary sl-wide"
                          type="button"
                          disabled={!eligibility.eligible || busy}
                          onClick={() => void saveShow(true)}
                        >
                          {eligibility.eligible ? 'Save ready demo show' : 'Complete readiness checks'}
                          <LockKeyhole size={15} />
                        </button>
                      )}
                    </form>
                    {panel.type === 'host' && !eligibility.eligible && (
                      <button
                        className="sl-text-link"
                        onClick={() => {
                          setPanel(null);
                          router.push('/you' as any);
                        }}
                      >
                        Work on your Talent Passport <ArrowUpRight size={14} />
                      </button>
                    )}
                    {localNotice}
                  </>
                )}
                {!!message && panel.type !== 'apply' && (
                  <p className="sl-status" role="status">
                    {message}
                  </p>
                )}
              </section>
            </div>,
            document.body
          )}
      </main>
    )
  );
}
