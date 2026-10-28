import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
  TextInput,
  RefreshControl,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  MapPin,
  Calendar,
  Users,
  Ticket,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Globe,
  Check,
  X,
  QrCode,
  Sparkles,
  Plus,
  Clock,
  Briefcase,
  Bookmark,
  Star,
  MessageCircle,
  Music2,
  Activity,
  Mic2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { useCommunityStore } from '../../store/communityStore';
import { useClubWorkspaceStore } from '../../store/clubWorkspaceStore';
import { useWorkPilotStore } from '../../store/workPilotStore';
import { useShowsLabStore, type LocalClub } from '../../store/showsLabStore';
import { clubs as defaultClubs, clubEvents, type Club, type ClubEvent } from '../../utils/communityCatalogue';
import { workspaceClubs, type WorkspaceClub } from '../../utils/clubWorkspace';
import { pilotBriefs, type Brief, type Application } from '../../utils/workPilot';

interface ShowItem {
  id: number;
  title: string;
  category: string;
  type: string;
  location: string;
  isOnline: boolean;
  date: string;
  fullDate: string;
  slots: string;
  price: string;
  rawPrice: number;
  image: string;
  description: string;
  visiting: number;
  isBooked: boolean;
  ticketCode: string;
}

function getInitials(name: string): string {
  if (!name) return 'A';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function StageVisual({
  category = 'Music',
  format = 'In person',
  accent,
  size = 'card',
}: {
  category?: string;
  format?: string;
  accent?: string;
  size?: 'hero' | 'card' | 'modal' | 'thumb';
}) {
  const isOnline = format !== 'In person';
  const catLower = (category || 'music').toLowerCase();

  const getTheme = () => {
    if (catLower.includes('dance')) {
      return { bg: '#231008', accent: '#F97316', label: 'DANCE STAGE' };
    }
    if (catLower.includes('comedy')) {
      return { bg: '#221B05', accent: '#EAB308', label: 'COMEDY STAGE' };
    }
    if (catLower.includes('film') || catLower.includes('theatre')) {
      return { bg: '#061C24', accent: '#06B6D4', label: 'CINEMA STAGE' };
    }
    if (catLower.includes('magic')) {
      return { bg: '#1B0C32', accent: '#A855F7', label: 'ILLUSION STAGE' };
    }
    if (catLower.includes('poetry') || catLower.includes('writing')) {
      return { bg: '#0E1F1A', accent: '#10B981', label: 'PROSE STAGE' };
    }
    return { bg: '#220815', accent: '#E91E76', label: 'MUSIC STAGE' };
  };

  const themeConfig = getTheme();
  const activeAccent = accent || themeConfig.accent;

  const renderIcon = (iconSize: number) => {
    if (catLower.includes('dance')) return <Activity size={iconSize} color={activeAccent} strokeWidth={1.8} />;
    if (catLower.includes('comedy')) return <Mic2 size={iconSize} color={activeAccent} strokeWidth={1.8} />;
    if (catLower.includes('film')) return <Sparkles size={iconSize} color={activeAccent} strokeWidth={1.8} />;
    if (catLower.includes('magic')) return <Sparkles size={iconSize} color={activeAccent} strokeWidth={1.8} />;
    if (catLower.includes('poetry')) return <Sparkles size={iconSize} color={activeAccent} strokeWidth={1.8} />;
    return <Music2 size={iconSize} color={activeAccent} strokeWidth={1.8} />;
  };

  if (size === 'thumb') {
    return (
      <View
        style={{ backgroundColor: themeConfig.bg, borderColor: activeAccent + '40' }}
        className="w-[96px] h-[108px] rounded-xl border items-center justify-center relative overflow-hidden"
      >
        <View
          style={{
            position: 'absolute',
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: activeAccent,
            opacity: 0.15,
          }}
        />
        {renderIcon(30)}
        <View
          style={{ backgroundColor: isOnline ? '#2563EB' : '#15803D' }}
          className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded"
        >
          <Text className="text-white text-[9px] font-bold tracking-wider uppercase">
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Text>
        </View>
      </View>
    );
  }

  if (size === 'modal') {
    return (
      <View
        style={{ backgroundColor: themeConfig.bg, borderColor: activeAccent + '30' }}
        className="w-full h-44 rounded-2xl border items-center justify-center relative overflow-hidden"
      >
        <View
          style={{
            position: 'absolute',
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: activeAccent,
            opacity: 0.15,
          }}
        />
        {renderIcon(52)}
        <View className="flex-row items-center gap-2 mt-3">
          <View
            style={{ backgroundColor: activeAccent + '25', borderColor: activeAccent }}
            className="px-3 py-1 rounded-full border"
          >
            <Text style={{ color: activeAccent }} className="text-[10px] font-bold tracking-widest uppercase">
              {themeConfig.label}
            </Text>
          </View>
          <View
            style={{ backgroundColor: isOnline ? '#2563EB' : '#15803D' }}
            className="px-2.5 py-1 rounded-full"
          >
            <Text className="text-white text-[10px] font-bold tracking-wider uppercase">
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // default / hero
  return (
    <View
      style={{ backgroundColor: themeConfig.bg }}
      className="absolute inset-0 items-center justify-center overflow-hidden"
    >
      <View
        style={{
          position: 'absolute',
          width: 340,
          height: 340,
          borderRadius: 170,
          backgroundColor: activeAccent,
          opacity: 0.2,
          top: -60,
          right: -50,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: activeAccent,
          opacity: 0.12,
          bottom: -40,
          left: -30,
        }}
      />
      <View className="items-center justify-center opacity-85">
        {renderIcon(size === 'hero' ? 70 : 44)}
      </View>
    </View>
  );
}

const FEATURED_SHOW: ShowItem = {
  id: 100,
  title: 'The Next Stage',
  category: 'Music',
  type: 'Headline Showcase',
  location: 'Bengaluru',
  isOnline: false,
  date: '7 Nov',
  fullDate: '2026-11-07T20:00:00Z',
  slots: '4 slots',
  price: '₹499',
  rawPrice: 499,
  image: '',
  description: 'Headline acoustic showcase featuring top rising indie artists discovered on talent platform.',
  visiting: 215,
  isBooked: false,
  ticketCode: 'PASS-TNS-2026',
};

const INITIAL_SAMPLE_SHOWS: ShowItem[] = [
  {
    id: 1,
    title: 'Rhythm & Roots',
    category: 'Music',
    type: 'Live performance',
    location: 'Bengaluru',
    isOnline: false,
    date: '2 Nov',
    fullDate: '2026-11-02T19:30:00Z',
    slots: '2 performer slots',
    price: '₹349',
    rawPrice: 349,
    image: '',
    description: 'An intimate evening of classical and contemporary acoustic fusion.',
    visiting: 42,
    isBooked: false,
    ticketCode: 'PASS-RR-2026',
  },
  {
    id: 2,
    title: 'The freestyle exchange',
    category: 'Dance',
    type: 'Live performance',
    location: 'Online',
    isOnline: true,
    date: '8 Nov',
    fullDate: '2026-11-08T20:00:00Z',
    slots: '6 performer slots',
    price: 'Free',
    rawPrice: 0,
    image: '',
    description: 'Global cypher bringing street dancers together in real-time streaming battle.',
    visiting: 128,
    isBooked: false,
    ticketCode: 'PASS-FE-2026',
  },
  {
    id: 3,
    title: 'Your first five minutes',
    category: 'Comedy',
    type: 'Live performance',
    location: 'Bengaluru',
    isOnline: false,
    date: '14 Nov',
    fullDate: '2026-11-14T20:30:00Z',
    slots: '3 performer slots',
    price: '₹199',
    rawPrice: 199,
    image: '',
    description: 'Curated open mic night for breakthrough stand-up comedians.',
    visiting: 65,
    isBooked: false,
    ticketCode: 'PASS-YFFM-2026',
  },
  {
    id: 4,
    title: 'One scene, many interpretations',
    category: 'Film',
    type: 'Live performance',
    location: 'Mumbai',
    isOnline: false,
    date: '21 Nov',
    fullDate: '2026-11-21T18:30:00Z',
    slots: '4 performer slots',
    price: '₹299',
    rawPrice: 299,
    image: '',
    description: 'Live table read and scene work with acting feedback from industry judges.',
    visiting: 38,
    isBooked: false,
    ticketCode: 'PASS-OSMI-2026',
  },
  {
    id: 5,
    title: 'A Little Impossible',
    category: 'Magic',
    type: 'Live performance',
    location: 'Mumbai',
    isOnline: false,
    date: '29 Nov',
    fullDate: '2026-11-29T19:00:00Z',
    slots: '3 performer slots',
    price: '₹249',
    rawPrice: 249,
    image: '',
    description: 'Close-up illusion and mentalism showcase by traditional sleight masters.',
    visiting: 51,
    isBooked: false,
    ticketCode: 'PASS-ALI-2026',
  },
  {
    id: 6,
    title: 'Acoustic Sunset Sessions',
    category: 'Music',
    type: 'Live performance',
    location: 'Kochi',
    isOnline: false,
    date: '5 Dec',
    fullDate: '2026-12-05T17:30:00Z',
    slots: '2 performer slots',
    price: '₹199',
    rawPrice: 199,
    image: '',
    description: 'Seaside sunset acoustic rhythms and indie singer-songwriter spotlight.',
    visiting: 80,
    isBooked: false,
    ticketCode: 'PASS-ASS-2026',
  },
  {
    id: 7,
    title: 'Beatbox & Vocal Loop Lab',
    category: 'Music',
    type: 'Live performance',
    location: 'Online',
    isOnline: true,
    date: '11 Dec',
    fullDate: '2026-12-11T21:00:00Z',
    slots: '5 performer slots',
    price: 'Free',
    rawPrice: 0,
    image: '',
    description: 'Live interactive looping showcase with real-time viewer voting and cypher.',
    visiting: 190,
    isBooked: false,
    ticketCode: 'PASS-BVLL-2026',
  },
  {
    id: 8,
    title: 'Raw Verse: Spoken Word',
    category: 'Poetry',
    type: 'Live performance',
    location: 'Delhi NCR',
    isOnline: false,
    date: '17 Dec',
    fullDate: '2026-12-17T19:00:00Z',
    slots: '4 performer slots',
    price: '₹149',
    rawPrice: 149,
    image: '',
    description: 'Poets and lyricists taking the floor with uncensored spoken word prose.',
    visiting: 44,
    isBooked: false,
    ticketCode: 'PASS-RVSW-2026',
  },
  {
    id: 9,
    title: 'Midnight Jazz Collective',
    category: 'Music',
    type: 'Live performance',
    location: 'Bengaluru',
    isOnline: false,
    date: '24 Dec',
    fullDate: '2026-12-24T22:00:00Z',
    slots: '3 performer slots',
    price: '₹449',
    rawPrice: 449,
    image: '',
    description: 'Improvised modal jazz session featuring guest saxophonists and drummers.',
    visiting: 76,
    isBooked: false,
    ticketCode: 'PASS-MJC-2026',
  },
];

type MainTab = 'shows' | 'clubs' | 'opportunities' | 'activity';
type ActivitySubTab = 'passes' | 'clubs' | 'applications';

export function ShowsView() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const topInset = insets.top > 0 ? insets.top : (Platform.OS === 'android' ? 28 : 20);

  const communityStore = useCommunityStore();
  const clubWorkspaceStore = useClubWorkspaceStore();
  const workPilotStore = useWorkPilotStore();
  const showsLabStore = useShowsLabStore();

  const [activeTab, setActiveTab] = useState<MainTab>('shows');
  const [activitySubTab, setActivitySubTab] = useState<ActivitySubTab>('passes');
  const [refreshing, setRefreshing] = useState(false);

  // Shows State
  const [shows, setShows] = useState<ShowItem[]>(INITIAL_SAMPLE_SHOWS);
  const [featuredShow, setFeaturedShow] = useState<ShowItem>(FEATURED_SHOW);
  const [showFilter, setShowFilter] = useState<'All' | 'Offline' | 'Online' | 'Near you'>('All');
  const [isFreeOnly, setIsFreeOnly] = useState(false);
  const [sortByPrice, setSortByPrice] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedShow, setSelectedShow] = useState<ShowItem | null>(null);
  const [ticketQrShow, setTicketQrShow] = useState<ShowItem | null>(null);
  const [isCreateShowModalOpen, setIsCreateShowModalOpen] = useState(false);
  const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false);

  // New Show Form State
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('Bengaluru');
  const [newCategory, setNewCategory] = useState('Music');
  const [newPrice, setNewPrice] = useState('₹299');
  const [newSlots, setNewSlots] = useState('3 performer slots');
  const [creatingShow, setCreatingShow] = useState(false);

  // Clubs State
  const [clubCategory, setClubCategory] = useState('All');
  const [clubSearch, setClubSearch] = useState('');
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [isCreateClubModalOpen, setIsCreateClubModalOpen] = useState(false);
  const [joinRole, setJoinRole] = useState<'Fan' | 'Performer'>('Fan');
  const [joinNote, setJoinNote] = useState('');
  const [newClubName, setNewClubName] = useState('');
  const [newClubCategory, setNewClubCategory] = useState('Music');
  const [newClubCity, setNewClubCity] = useState('Bengaluru');
  const [newClubDesc, setNewClubDesc] = useState('');
  const [newClubPrompt, setNewClubPrompt] = useState('');

  // Opportunities (WorkPilot) State
  const [oppCategory, setOppCategory] = useState('All');
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  const [isCreateBriefModalOpen, setIsCreateBriefModalOpen] = useState(false);
  const [applyName, setApplyName] = useState(user?.name || user?.username || '');
  const [applyPerfTitle, setApplyPerfTitle] = useState('');
  const [applyNote, setApplyNote] = useState('');
  const [applyFee, setApplyFee] = useState('');
  const [newBriefTitle, setNewBriefTitle] = useState('');
  const [newBriefCategory, setNewBriefCategory] = useState('Music');
  const [newBriefCity, setNewBriefCity] = useState('Bengaluru');
  const [newBriefFee, setNewBriefFee] = useState('₹5,000');
  const [newBriefDeadline, setNewBriefDeadline] = useState('15 Nov');
  const [newBriefReqs, setNewBriefReqs] = useState('');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }, []);

  // Shows RSVP Handler
  const handleToggleRSVP = (show: ShowItem) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const isBooking = !show.isBooked;

      if (show.id === featuredShow.id) {
        setFeaturedShow((prev) => ({
          ...prev,
          isBooked: isBooking,
          visiting: isBooking ? prev.visiting + 1 : Math.max(0, prev.visiting - 1),
        }));
      }

      setShows((prev) =>
        prev.map((s) => {
          if (s.id === show.id) {
            return {
              ...s,
              isBooked: isBooking,
              visiting: isBooking ? s.visiting + 1 : Math.max(0, s.visiting - 1),
            };
          }
          return s;
        })
      );

      if (selectedShow && selectedShow.id === show.id) {
        setSelectedShow((prev) =>
          prev
            ? {
                ...prev,
                isBooked: isBooking,
                visiting: isBooking ? prev.visiting + 1 : Math.max(0, prev.visiting - 1),
              }
            : null
        );
      }

      if (isBooking) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Pass Booked',
          `Your entry pass for "${show.title}" is confirmed. Present your digital QR pass at the entrance.`
        );
      }
    } catch {
      Alert.alert('Error', 'Could not process RSVP. Please try again.');
    }
  };

  const handleCreateShow = () => {
    if (!newTitle.trim()) {
      Alert.alert('Missing Details', 'Please provide a show title.');
      return;
    }
    setCreatingShow(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setTimeout(() => {
      const isOnlineLocation = newLocation.toLowerCase().includes('online');
      const parsedPrice = parseInt(newPrice.replace(/[^0-9]/g, '')) || 0;

      const created: ShowItem = {
        id: Date.now(),
        title: newTitle.trim(),
        category: newCategory,
        type: 'Live performance',
        location: newLocation.trim() || 'Bengaluru',
        isOnline: isOnlineLocation,
        date: '28 Dec',
        fullDate: '2026-12-28T20:00:00Z',
        slots: newSlots.trim() || '3 performer slots',
        price: parsedPrice === 0 ? 'Free' : `₹${parsedPrice}`,
        rawPrice: parsedPrice,
        image: '',
        description: 'New verified live talent gig hosted on talent stage.',
        visiting: 1,
        isBooked: true,
        ticketCode: `PASS-NEW-${Date.now().toString().slice(-4)}`,
      };

      setShows((prev) => [created, ...prev]);
      setCreatingShow(false);
      setIsCreateShowModalOpen(false);
      setNewTitle('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Show Published', 'Your live show has been created and listed.');
    }, 500);
  };

  // Club Handlers
  const allClubs = useMemo(() => {
    return [...defaultClubs, ...showsLabStore.clubs];
  }, [showsLabStore.clubs]);

  const filteredClubs = useMemo(() => {
    return allClubs.filter((c) => {
      const matchesCat = clubCategory === 'All' || c.category.toLowerCase() === clubCategory.toLowerCase();
      const matchesSearch =
        !clubSearch.trim() ||
        c.name.toLowerCase().includes(clubSearch.toLowerCase()) ||
        c.city.toLowerCase().includes(clubSearch.toLowerCase()) ||
        c.description.toLowerCase().includes(clubSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [allClubs, clubCategory, clubSearch]);

  const handleJoinClub = (club: Club) => {
    communityStore.join(club.id, joinRole);
    try {
      const wsClub: WorkspaceClub = {
        ...club,
        ownerId: 101,
        joinPolicy: 'open',
      };
      clubWorkspaceStore.request(wsClub, joinRole, joinNote, user?.name || user?.username || 'Talent User');
    } catch {
      // workspace store sync fallback
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Joined Club', `You are now a member of ${club.name} as a ${joinRole}.`);
    setJoinNote('');
    setSelectedClub(null);
  };

  const handleLeaveClub = (clubId: string) => {
    communityStore.leave(clubId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Membership Ended', 'You have left the club.');
    setSelectedClub(null);
  };

  const handleCreateClub = () => {
    if (!newClubName.trim() || !newClubDesc.trim()) {
      Alert.alert('Missing Info', 'Please enter club name and description.');
      return;
    }
    const initials = newClubName
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('');
    const newClub: LocalClub = {
      id: `club-${Date.now()}`,
      name: newClubName.trim(),
      category: newClubCategory,
      city: newClubCity.trim() || 'Bengaluru',
      initials: initials || 'TC',
      color: '#E91E76',
      description: newClubDesc.trim(),
      prompt: newClubPrompt.trim() || 'Create and perform with us.',
      kind: 'Local community',
      ownerId: 999,
    };
    showsLabStore.addClub(newClub);
    communityStore.join(newClub.id, 'Performer');
    setIsCreateClubModalOpen(false);
    setNewClubName('');
    setNewClubDesc('');
    setNewClubPrompt('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Club Created', `Your club "${newClub.name}" is now live.`);
  };

  // Brief / Opportunities Handlers
  const allBriefs = useMemo(() => {
    return workPilotStore.briefs.length ? workPilotStore.briefs : pilotBriefs;
  }, [workPilotStore.briefs]);

  const filteredBriefs = useMemo(() => {
    return allBriefs.filter((b) => {
      return oppCategory === 'All' || b.category.toLowerCase().includes(oppCategory.toLowerCase());
    });
  }, [allBriefs, oppCategory]);

  const handleApplyBrief = (brief: Brief) => {
    if (!applyPerfTitle.trim()) {
      Alert.alert('Missing Detail', 'Please provide a title or link for your performance sample.');
      return;
    }
    const feeNum = parseInt(applyFee.replace(/[^0-9]/g, '')) || brief.fee;
    const application: Application = {
      id: `app-${Date.now()}`,
      briefId: brief.id,
      name: applyName.trim() || 'Talent Performer',
      performanceId: String(Date.now()),
      performanceTitle: applyPerfTitle.trim(),
      note: applyNote.trim() || 'Looking forward to collaborating on this opportunity.',
      fee: feeNum,
      status: 'Applied',
      artistConfirmed: true,
      organizerConfirmed: false,
      messages: [],
      sample: false,
    };
    workPilotStore.apply(brief, application);
    setSelectedBrief(null);
    setApplyPerfTitle('');
    setApplyNote('');
    setApplyFee('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Application Sent', `Your application for "${brief.title}" has been submitted.`);
  };

  const handleCreateBrief = () => {
    if (!newBriefTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for this opportunity.');
      return;
    }
    const parsedFee = parseInt(newBriefFee.replace(/[^0-9]/g, '')) || 5000;
    const newBrief: Brief = {
      id: `brief-${Date.now()}`,
      title: newBriefTitle.trim(),
      organizer: user?.name || user?.username || 'Talent Stage',
      city: newBriefCity.trim() || 'Bengaluru',
      category: newBriefCategory,
      format: newBriefCity.toLowerCase().includes('online') ? 'Online' : 'In person',
      date: '20 Dec',
      deadline: newBriefDeadline.trim() || '15 Nov',
      fee: parsedFee,
      minutes: 45,
      requirements: newBriefReqs.trim() || 'Original performance demo required.',
      equipment: 'Stage PA and standard monitors provided.',
      rights: 'Artist retains ownership of original composition.',
      cancellation: '48-hour mutual written cancellation notice.',
      owner: true,
    };
    workPilotStore.addBrief(newBrief);
    setIsCreateBriefModalOpen(false);
    setNewBriefTitle('');
    setNewBriefReqs('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Opportunity Posted', `"${newBrief.title}" is now open for artist submissions.`);
  };

  // Filtered Shows
  const filteredShows = useMemo(() => {
    let result = [...shows];
    if (showFilter === 'Offline') {
      result = result.filter((s) => !s.isOnline);
    } else if (showFilter === 'Online') {
      result = result.filter((s) => s.isOnline);
    } else if (showFilter === 'Near you') {
      result = result.filter((s) => s.location.toLowerCase().includes('bengaluru'));
    }
    if (isFreeOnly) {
      result = result.filter((s) => s.rawPrice === 0 || s.price.toLowerCase() === 'free');
    }
    if (sortByPrice) {
      result.sort((a, b) => a.rawPrice - b.rawPrice);
    }
    return result;
  }, [shows, showFilter, isFreeOnly, sortByPrice]);

  const displayedShows = isExpanded ? filteredShows : filteredShows.slice(0, 3);
  const myBookedShows = useMemo(
    () => [...shows.filter((s) => s.isBooked), ...(featuredShow.isBooked ? [featuredShow] : [])],
    [shows, featuredShow]
  );

  const myJoinedClubs = useMemo(() => {
    return allClubs.filter((c) => !!communityStore.memberships[c.id]);
  }, [allClubs, communityStore.memberships]);

  const myApplications = useMemo(() => {
    return workPilotStore.applications;
  }, [workPilotStore.applications]);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.bg }}>
      {/* Top Brand Header Bar */}
      <View
        className="pb-2.5 px-5 flex-row items-center justify-between border-b"
        style={{
          paddingTop: topInset + 6,
          borderBottomColor: theme.isDark ? '#27272a' : '#F3F4F6',
          backgroundColor: theme.bg,
        }}
      >
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push('/(tabs)');
              }
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color={theme.text} />
          </TouchableOpacity>

          <Text className="text-[24px] font-black tracking-tight" style={{ color: theme.text }}>
            talent<Text className="text-[#E91E76]">.</Text>
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/search');
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Search size={22} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/you');
            }}
            activeOpacity={0.8}
          >
            {user?.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                className="w-8 h-8 rounded-full border border-neutral-300 dark:border-zinc-700"
              />
            ) : (
              <View
                className="w-8 h-8 rounded-full items-center justify-center border border-neutral-300 dark:border-zinc-700"
                style={{ backgroundColor: '#E91E76' }}
              >
                <Text className="text-white text-[12px] font-bold">
                  {getInitials(user?.name || user?.username || 'You')}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main 4-Tab Segmented Bar */}
      <View
        className="flex-row items-center px-4 py-2 border-b"
        style={{
          backgroundColor: theme.isDark ? '#121214' : '#FAFAFA',
          borderBottomColor: theme.isDark ? '#27272a' : '#E5E7EB',
        }}
      >
        {(
          [
            { id: 'shows', label: 'Shows' },
            { id: 'clubs', label: 'Clubs' },
            { id: 'opportunities', label: 'Opportunities' },
            { id: 'activity', label: 'My Activity' },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab.id);
              }}
              activeOpacity={0.75}
              style={{
                backgroundColor: isActive ? '#E91E76' : 'transparent',
              }}
              className="flex-1 py-2 rounded-full items-center justify-center mx-0.5"
            >
              <Text
                style={{
                  color: isActive ? '#FFFFFF' : theme.textSecondary,
                  fontSize: 12,
                  fontWeight: isActive ? '700' : '600',
                }}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E91E76" />}
      >
        {/* ============================================================== */}
        {/* TAB 1: SHOWS                                                   */}
        {/* ============================================================== */}
        {activeTab === 'shows' && (
          <View>
            {/* Title Section */}
            <View className="mb-4">
              <Text className="text-[30px] font-bold tracking-tight mb-1" style={{ color: theme.text }}>
                Shows
              </Text>
              <Text className="text-[13px]" style={{ color: theme.textSecondary }}>
                Live experiences built around real talent.
              </Text>
            </View>

            {/* Primary Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-3.5 -mx-4 px-4"
              contentContainerStyle={{ gap: 8 }}
            >
              {(['All', 'Offline', 'Online', 'Near you'] as const).map((filter) => {
                const isSelected = showFilter === filter;
                return (
                  <TouchableOpacity
                    key={filter}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowFilter(filter);
                    }}
                    activeOpacity={0.8}
                    style={{
                      backgroundColor: isSelected
                        ? theme.isDark
                          ? '#FFFFFF'
                          : '#121212'
                        : theme.isDark
                        ? '#1f1f23'
                        : '#FFFFFF',
                      borderColor: isSelected
                        ? 'transparent'
                        : theme.isDark
                        ? '#2e2e33'
                        : '#E5E7EB',
                      borderWidth: 1,
                    }}
                    className="px-5 py-2 rounded-full"
                  >
                    <Text
                      className="text-[13px] font-semibold"
                      style={{
                        color: isSelected
                          ? theme.isDark
                            ? '#000000'
                            : '#FFFFFF'
                          : theme.textSecondary,
                      }}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Secondary Filter Chips */}
            <View className="flex-row items-center gap-2 mb-4">
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSortByPrice(!sortByPrice);
                }}
                activeOpacity={0.8}
                style={{
                  backgroundColor: sortByPrice
                    ? theme.isDark
                      ? '#27272a'
                      : '#F3F4F6'
                    : 'transparent',
                  borderColor: theme.isDark ? '#2e2e33' : '#E5E7EB',
                  borderWidth: 1,
                }}
                className="flex-row items-center gap-2 px-3.5 py-1.5 rounded-full"
              >
                <SlidersHorizontal size={13} color={theme.textSecondary} />
                <Text className="text-[12px] font-medium" style={{ color: theme.textSecondary }}>
                  {sortByPrice ? 'Price: Low to High' : 'Date & price'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsFreeOnly(!isFreeOnly);
                }}
                activeOpacity={0.8}
                style={{
                  backgroundColor: isFreeOnly ? '#E91E76' : 'transparent',
                  borderColor: isFreeOnly ? '#E91E76' : theme.isDark ? '#2e2e33' : '#E5E7EB',
                  borderWidth: 1,
                }}
                className="px-3.5 py-1.5 rounded-full"
              >
                <Text
                  className="text-[12px] font-medium"
                  style={{ color: isFreeOnly ? '#FFFFFF' : theme.textSecondary }}
                >
                  Free shows
                </Text>
              </TouchableOpacity>
            </View>

            {/* Featured Show Card */}
            <View className="rounded-3xl overflow-hidden relative h-[310px] w-full mb-3 bg-black shadow-lg">
              <StageVisual
                category={featuredShow.category}
                format={featuredShow.isOnline ? 'Online' : 'In person'}
                size="hero"
              />
              <View className="absolute inset-0 bg-black/35" />

              <View className="flex-1 p-5 justify-between">
                <View className="self-start bg-black/60 px-3 py-1.5 rounded-full border border-white/20">
                  <Text className="text-white text-[10px] font-bold tracking-widest uppercase">
                    FEATURED SHOWCASE
                  </Text>
                </View>

                <View>
                  <Text className="text-white text-[26px] font-extrabold leading-[30px] mb-1">
                    {featuredShow.title}
                  </Text>
                  <Text className="text-white/80 text-[13px] mb-3 font-normal">
                    Discovered through talent.
                  </Text>

                  <View className="flex-row items-center gap-4 mb-4">
                    <View className="flex-row items-center gap-1.5">
                      <MapPin size={13} color="#FFFFFF" />
                      <Text className="text-white/95 text-[12px] font-medium">{featuredShow.location}</Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <Calendar size={13} color="#FFFFFF" />
                      <Text className="text-white/95 text-[12px] font-medium">{featuredShow.date}</Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <Users size={13} color="#FFFFFF" />
                      <Text className="text-white/95 text-[12px] font-medium">{featuredShow.slots}</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-2.5">
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedShow(featuredShow);
                      }}
                      activeOpacity={0.85}
                      className="flex-1 bg-[#E91E76] py-3 rounded-2xl flex-row items-center justify-center gap-2"
                    >
                      <Text className="text-white text-[14px] font-bold">View show</Text>
                      <ArrowRight size={15} color="#FFFFFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        handleToggleRSVP(featuredShow);
                      }}
                      activeOpacity={0.85}
                      className="flex-1 bg-white/15 border border-white/30 py-3 rounded-2xl flex-row items-center justify-center gap-2"
                    >
                      <Ticket size={15} color="#FFFFFF" />
                      <Text className="text-white text-[14px] font-bold">
                        {featuredShow.isBooked ? 'Booked' : 'Book pass'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Upcoming Shows Header */}
            <View className="mb-3 mt-4">
              <View className="flex-row items-center justify-between mb-0.5">
                <Text className="text-[20px] font-bold tracking-tight" style={{ color: theme.text }}>
                  Upcoming Live Shows
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setIsExpanded(!isExpanded);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  className="flex-row items-center gap-0.5"
                >
                  <Text className="text-[13px] font-medium" style={{ color: theme.textSecondary }}>
                    {isExpanded ? 'Show less' : `See all ${filteredShows.length}`}
                  </Text>
                  <ChevronRight size={14} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Shows Cards */}
            {displayedShows.map((show) => (
              <TouchableOpacity
                key={show.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedShow(show);
                }}
                activeOpacity={0.88}
                style={{
                  backgroundColor: theme.isDark ? '#18181b' : '#FFFFFF',
                  borderColor: theme.border,
                  borderWidth: 1,
                }}
                className="rounded-2xl mb-3 overflow-hidden flex-row p-2.5 shadow-sm"
              >
                <StageVisual
                  category={show.category}
                  format={show.isOnline ? 'Online' : 'In person'}
                  size="thumb"
                />

                <View className="flex-1 pl-3 justify-between py-0.5">
                  <View>
                    <View className="flex-row items-start justify-between">
                      <Text
                        className="text-[15px] font-bold leading-tight flex-1 pr-1"
                        style={{ color: theme.text }}
                        numberOfLines={1}
                      >
                        {show.title}
                      </Text>
                      <View
                        className="w-6 h-6 rounded-full items-center justify-center -mt-0.5"
                        style={{ backgroundColor: theme.isDark ? '#27272a' : '#F3F4F6' }}
                      >
                        <ArrowUpRight size={13} color={theme.text} />
                      </View>
                    </View>
                    <Text className="text-[12px] mt-0.5" style={{ color: theme.textSecondary }}>
                      {show.category} · {show.type}
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-3">
                    <View className="flex-row items-center gap-1">
                      {show.isOnline ? (
                        <Globe size={11} color={theme.textSecondary} />
                      ) : (
                        <MapPin size={11} color={theme.textSecondary} />
                      )}
                      <Text className="text-[11px]" style={{ color: theme.textSecondary }}>
                        {show.location}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Calendar size={11} color={theme.textSecondary} />
                      <Text className="text-[11px]" style={{ color: theme.textSecondary }}>
                        {show.date}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <Text className="text-[#E91E76] text-[11px] font-medium" numberOfLines={1}>
                      {show.slots}
                    </Text>
                    <Text className="text-[14px] font-extrabold" style={{ color: theme.text }}>
                      {show.price}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {/* Host a Show Prompt Card */}
            <View
              style={{
                backgroundColor: theme.isDark ? '#18181b' : '#FFFFFF',
                borderColor: theme.border,
                borderWidth: 1,
              }}
              className="rounded-2xl p-4 flex-row items-center justify-between mb-3 mt-2 shadow-sm"
            >
              <View className="flex-1 pr-3">
                <Text className="text-[16px] font-bold" style={{ color: theme.text }}>
                  Ready to host a show?
                </Text>
                <Text className="text-[12px] mt-0.5" style={{ color: theme.textSecondary }}>
                  Curate performers and list your live showcase.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsCreateShowModalOpen(true);
                }}
                activeOpacity={0.85}
                className="bg-[#E91E76] px-4 py-2 rounded-full flex-row items-center gap-1"
              >
                <Plus size={14} color="#FFFFFF" />
                <Text className="text-white text-[13px] font-bold">Host show</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ============================================================== */}
        {/* TAB 2: CLUBS (CLUBS WORKSPACE)                                 */}
        {/* ============================================================== */}
        {activeTab === 'clubs' && (
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1 pr-2">
                <Text className="text-[30px] font-bold tracking-tight mb-0.5" style={{ color: theme.text }}>
                  Clubs
                </Text>
                <Text className="text-[13px]" style={{ color: theme.textSecondary }}>
                  Join creative collectives, rehearsal rooms & jam sessions.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsCreateClubModalOpen(true);
                }}
                activeOpacity={0.85}
                className="bg-[#E91E76] px-3.5 py-2 rounded-full flex-row items-center gap-1"
              >
                <Plus size={14} color="#FFFFFF" />
                <Text className="text-white text-[12px] font-bold">New club</Text>
              </TouchableOpacity>
            </View>

            {/* Club Search Bar */}
            <View
              className="flex-row items-center px-3.5 py-2 rounded-xl mb-3 border"
              style={{
                backgroundColor: theme.isDark ? '#18181b' : '#FFFFFF',
                borderColor: theme.border,
              }}
            >
              <Search size={16} color={theme.textSecondary} />
              <TextInput
                value={clubSearch}
                onChangeText={setClubSearch}
                placeholder="Search clubs by name, city, prompt..."
                placeholderTextColor={theme.textSecondary}
                className="flex-1 ml-2 text-[13px]"
                style={{ color: theme.text }}
              />
              {!!clubSearch && (
                <TouchableOpacity onPress={() => setClubSearch('')}>
                  <X size={15} color={theme.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Category Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4 -mx-4 px-4"
              contentContainerStyle={{ gap: 8 }}
            >
              {['All', 'Music', 'Dance', 'Comedy', 'Film', 'Magic', 'Writing'].map((cat) => {
                const isSelected = clubCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setClubCategory(cat);
                    }}
                    activeOpacity={0.8}
                    style={{
                      backgroundColor: isSelected ? '#E91E76' : theme.isDark ? '#1f1f23' : '#FFFFFF',
                      borderColor: isSelected ? '#E91E76' : theme.border,
                      borderWidth: 1,
                    }}
                    className="px-4 py-1.5 rounded-full"
                  >
                    <Text
                      className="text-[12px] font-semibold"
                      style={{ color: isSelected ? '#FFFFFF' : theme.textSecondary }}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Clubs List */}
            {filteredClubs.map((club) => {
              const isMember = !!communityStore.memberships[club.id];
              const memberRole = communityStore.memberships[club.id];

              return (
                <TouchableOpacity
                  key={club.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedClub(club);
                  }}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: theme.isDark ? '#18181b' : '#FFFFFF',
                    borderColor: theme.border,
                    borderWidth: 1,
                  }}
                  className="rounded-2xl p-4 mb-3 shadow-sm"
                >
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-row items-center gap-3 flex-1 pr-2">
                      <View
                        className="w-11 h-11 rounded-full items-center justify-center"
                        style={{ backgroundColor: club.color || '#E91E76' }}
                      >
                        <Text className="text-white text-[15px] font-extrabold">{club.initials}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-[16px] font-bold" style={{ color: theme.text }}>
                          {club.name}
                        </Text>
                        <View className="flex-row items-center gap-2 mt-0.5">
                          <Text className="text-[12px] font-medium text-[#E91E76]">{club.category}</Text>
                          <Text className="text-[12px]" style={{ color: theme.textSecondary }}>
                            ·
                          </Text>
                          <Text className="text-[12px]" style={{ color: theme.textSecondary }}>
                            {club.city}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {isMember ? (
                      <View className="bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                        <Text className="text-emerald-500 text-[10px] font-bold uppercase">
                          {memberRole || 'Member'}
                        </Text>
                      </View>
                    ) : (
                      <View
                        className="px-3 py-1 rounded-full border"
                        style={{ borderColor: theme.border, backgroundColor: theme.isDark ? '#27272a' : '#F3F4F6' }}
                      >
                        <Text className="text-[11px] font-semibold" style={{ color: theme.text }}>
                          Explore
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text className="text-[13px] leading-relaxed mb-3" style={{ color: theme.textSecondary }}>
                    {club.description}
                  </Text>

                  {/* Creative Prompt Box */}
                  <View
                    className="p-2.5 rounded-xl border flex-row items-center gap-2"
                    style={{
                      backgroundColor: theme.isDark ? '#121214' : '#F9FAFB',
                      borderColor: theme.border,
                    }}
                  >
                    <Sparkles size={13} color="#E91E76" />
                    <Text className="text-[11px] font-medium flex-1 italic" style={{ color: theme.text }}>
                      "{club.prompt}"
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ============================================================== */}
        {/* TAB 3: OPPORTUNITIES (WORKPILOT)                               */}
        {/* ============================================================== */}
        {activeTab === 'opportunities' && (
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1 pr-2">
                <Text className="text-[30px] font-bold tracking-tight mb-0.5" style={{ color: theme.text }}>
                  Opportunities
                </Text>
                <Text className="text-[13px]" style={{ color: theme.textSecondary }}>
                  Paid creative briefs, auditions, and live lineups.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsCreateBriefModalOpen(true);
                }}
                activeOpacity={0.85}
                className="bg-[#E91E76] px-3.5 py-2 rounded-full flex-row items-center gap-1"
              >
                <Plus size={14} color="#FFFFFF" />
                <Text className="text-white text-[12px] font-bold">Post brief</Text>
              </TouchableOpacity>
            </View>

            {/* Category Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4 -mx-4 px-4"
              contentContainerStyle={{ gap: 8 }}
            >
              {['All', 'Music', 'Singing', 'Dance', 'Comedy', 'Film'].map((cat) => {
                const isSelected = oppCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setOppCategory(cat);
                    }}
                    activeOpacity={0.8}
                    style={{
                      backgroundColor: isSelected ? '#E91E76' : theme.isDark ? '#1f1f23' : '#FFFFFF',
                      borderColor: isSelected ? '#E91E76' : theme.border,
                      borderWidth: 1,
                    }}
                    className="px-4 py-1.5 rounded-full"
                  >
                    <Text
                      className="text-[12px] font-semibold"
                      style={{ color: isSelected ? '#FFFFFF' : theme.textSecondary }}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Opportunities List */}
            {filteredBriefs.map((brief) => (
              <TouchableOpacity
                key={brief.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedBrief(brief);
                }}
                activeOpacity={0.88}
                style={{
                  backgroundColor: theme.isDark ? '#18181b' : '#FFFFFF',
                  borderColor: theme.border,
                  borderWidth: 1,
                }}
                className="rounded-2xl p-4 mb-3 shadow-sm"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="bg-pink-500/10 border border-pink-500/20 px-2.5 py-0.5 rounded-full">
                    <Text className="text-[#E91E76] text-[10px] font-bold uppercase">{brief.category}</Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <Clock size={12} color={theme.textSecondary} />
                    <Text className="text-[11px]" style={{ color: theme.textSecondary }}>
                      Deadline: {brief.deadline}
                    </Text>
                  </View>
                </View>

                <Text className="text-[17px] font-bold leading-snug mb-1" style={{ color: theme.text }}>
                  {brief.title}
                </Text>

                <Text className="text-[12px] mb-3" style={{ color: theme.textSecondary }}>
                  {brief.organizer} · {brief.city} ({brief.format})
                </Text>

                <View
                  className="p-3 rounded-xl mb-3 border"
                  style={{
                    backgroundColor: theme.isDark ? '#121214' : '#F9FAFB',
                    borderColor: theme.border,
                  }}
                >
                  <Text className="text-[12px] font-medium" style={{ color: theme.text }}>
                    {brief.requirements}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between pt-1">
                  <View>
                    <Text className="text-[10px] uppercase font-bold tracking-wider" style={{ color: theme.textSecondary }}>
                      Compensation
                    </Text>
                    <Text className="text-[16px] font-black text-[#E91E76]">
                      {brief.fee ? `₹${brief.fee.toLocaleString('en-IN')}` : 'Stage slot & credits'}
                    </Text>
                  </View>

                  <View className="bg-[#E91E76] px-4 py-2 rounded-xl flex-row items-center gap-1.5">
                    <Text className="text-white text-[12px] font-bold">Apply now</Text>
                    <ArrowRight size={13} color="#FFFFFF" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ============================================================== */}
        {/* TAB 4: MY ACTIVITY                                             */}
        {/* ============================================================== */}
        {activeTab === 'activity' && (
          <View>
            <View className="mb-4">
              <Text className="text-[30px] font-bold tracking-tight mb-1" style={{ color: theme.text }}>
                My Activity
              </Text>
              <Text className="text-[13px]" style={{ color: theme.textSecondary }}>
                Booked passes, joined clubs, and application status.
              </Text>
            </View>

            {/* Sub-tabs */}
            <View
              className="flex-row items-center p-1 rounded-xl mb-4 border"
              style={{
                backgroundColor: theme.isDark ? '#18181b' : '#F3F4F6',
                borderColor: theme.border,
              }}
            >
              {(
                [
                  { id: 'passes', label: `Passes (${myBookedShows.length})` },
                  { id: 'clubs', label: `Clubs (${myJoinedClubs.length})` },
                  { id: 'applications', label: `Gigs (${myApplications.length})` },
                ] as const
              ).map((sub) => {
                const isSelected = activitySubTab === sub.id;
                return (
                  <TouchableOpacity
                    key={sub.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setActivitySubTab(sub.id);
                    }}
                    style={{
                      backgroundColor: isSelected ? (theme.isDark ? '#27272a' : '#FFFFFF') : 'transparent',
                    }}
                    className="flex-1 py-1.5 rounded-lg items-center justify-center"
                  >
                    <Text
                      style={{
                        color: isSelected ? theme.text : theme.textSecondary,
                        fontSize: 12,
                        fontWeight: isSelected ? '700' : '500',
                      }}
                    >
                      {sub.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Passes View */}
            {activitySubTab === 'passes' && (
              <View>
                {myBookedShows.length === 0 ? (
                  <View className="py-12 items-center justify-center">
                    <Ticket size={40} color={theme.textSecondary} />
                    <Text className="text-[16px] font-bold mt-3" style={{ color: theme.text }}>
                      No passes booked yet
                    </Text>
                    <Text className="text-[13px] text-center mt-1" style={{ color: theme.textSecondary }}>
                      Book entry passes for upcoming live shows in the Shows tab.
                    </Text>
                  </View>
                ) : (
                  myBookedShows.map((show) => (
                    <View
                      key={show.id}
                      style={{
                        backgroundColor: theme.isDark ? '#18181b' : '#FFFFFF',
                        borderColor: theme.border,
                        borderWidth: 1,
                      }}
                      className="rounded-2xl p-4 mb-3 shadow-sm"
                    >
                      <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-1 pr-2">
                          <Text className="text-[17px] font-bold" style={{ color: theme.text }}>
                            {show.title}
                          </Text>
                          <Text className="text-[12px] mt-0.5" style={{ color: theme.textSecondary }}>
                            {show.date} · {show.location}
                          </Text>
                        </View>
                        <View className="bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                          <Text className="text-emerald-500 text-[10px] font-bold">CONFIRMED</Text>
                        </View>
                      </View>

                      <View
                        className="p-3 rounded-xl mb-3 flex-row items-center justify-between border"
                        style={{
                          backgroundColor: theme.isDark ? '#121214' : '#F9FAFB',
                          borderColor: theme.border,
                        }}
                      >
                        <View>
                          <Text className="text-[10px] uppercase font-bold tracking-wider" style={{ color: theme.textSecondary }}>
                            Pass Reference
                          </Text>
                          <Text className="text-[14px] font-mono font-bold" style={{ color: theme.text }}>
                            {show.ticketCode}
                          </Text>
                        </View>
                        <Text className="text-[14px] font-bold text-[#E91E76]">{show.price}</Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setTicketQrShow(show);
                        }}
                        activeOpacity={0.85}
                        className="bg-[#E91E76] py-2.5 rounded-xl flex-row items-center justify-center gap-2"
                      >
                        <QrCode size={16} color="#FFFFFF" />
                        <Text className="text-white text-[13px] font-bold">Show digital QR pass</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* Clubs View */}
            {activitySubTab === 'clubs' && (
              <View>
                {myJoinedClubs.length === 0 ? (
                  <View className="py-12 items-center justify-center">
                    <Users size={40} color={theme.textSecondary} />
                    <Text className="text-[16px] font-bold mt-3" style={{ color: theme.text }}>
                      No clubs joined yet
                    </Text>
                    <Text className="text-[13px] text-center mt-1" style={{ color: theme.textSecondary }}>
                      Browse clubs to practice, exchange material, and perform together.
                    </Text>
                  </View>
                ) : (
                  myJoinedClubs.map((club) => (
                    <View
                      key={club.id}
                      style={{
                        backgroundColor: theme.isDark ? '#18181b' : '#FFFFFF',
                        borderColor: theme.border,
                        borderWidth: 1,
                      }}
                      className="rounded-2xl p-4 mb-3 shadow-sm flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center gap-3 flex-1 pr-2">
                        <View
                          className="w-11 h-11 rounded-full items-center justify-center"
                          style={{ backgroundColor: club.color || '#E91E76' }}
                        >
                          <Text className="text-white text-[15px] font-extrabold">{club.initials}</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-[15px] font-bold" style={{ color: theme.text }}>
                            {club.name}
                          </Text>
                          <Text className="text-[12px]" style={{ color: theme.textSecondary }}>
                            {club.category} · {club.city}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setSelectedClub(club);
                        }}
                        activeOpacity={0.8}
                        className="px-3 py-1.5 rounded-full border"
                        style={{ borderColor: theme.border, backgroundColor: theme.isDark ? '#27272a' : '#F3F4F6' }}
                      >
                        <Text className="text-[12px] font-semibold" style={{ color: theme.text }}>
                          Manage
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* Applications View */}
            {activitySubTab === 'applications' && (
              <View>
                {myApplications.length === 0 ? (
                  <View className="py-12 items-center justify-center">
                    <Briefcase size={40} color={theme.textSecondary} />
                    <Text className="text-[16px] font-bold mt-3" style={{ color: theme.text }}>
                      No applications submitted
                    </Text>
                    <Text className="text-[13px] text-center mt-1" style={{ color: theme.textSecondary }}>
                      Apply to creative briefs and live performance lineup calls in Opportunities.
                    </Text>
                  </View>
                ) : (
                  myApplications.map((app) => (
                    <View
                      key={app.id}
                      style={{
                        backgroundColor: theme.isDark ? '#18181b' : '#FFFFFF',
                        borderColor: theme.border,
                        borderWidth: 1,
                      }}
                      className="rounded-2xl p-4 mb-3 shadow-sm"
                    >
                      <View className="flex-row items-start justify-between mb-2">
                        <View className="flex-1 pr-2">
                          <Text className="text-[16px] font-bold" style={{ color: theme.text }}>
                            {app.performanceTitle}
                          </Text>
                          <Text className="text-[12px] mt-0.5" style={{ color: theme.textSecondary }}>
                            Applicant: {app.name}
                          </Text>
                        </View>
                        <View className="bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                          <Text className="text-blue-500 text-[10px] font-bold uppercase">{app.status}</Text>
                        </View>
                      </View>

                      <View
                        className="p-3 rounded-xl border mb-2"
                        style={{
                          backgroundColor: theme.isDark ? '#121214' : '#F9FAFB',
                          borderColor: theme.border,
                        }}
                      >
                        <Text className="text-[12px]" style={{ color: theme.text }}>
                          "{app.note}"
                        </Text>
                      </View>

                      <View className="flex-row items-center justify-between pt-1">
                        <Text className="text-[11px]" style={{ color: theme.textSecondary }}>
                          Proposed fee: ₹{app.fee.toLocaleString('en-IN')}
                        </Text>
                        <View className="flex-row items-center gap-1">
                          <Check size={13} color="#10B981" />
                          <Text className="text-[11px] font-semibold text-emerald-500">Submitted</Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* ============================================================== */}
      {/* MODAL 1: SHOW DETAILS & BOOKING MODAL                          */}
      {/* ============================================================== */}
      <Modal visible={!!selectedShow} animationType="slide" transparent onRequestClose={() => setSelectedShow(null)}>
        <View className="flex-1 justify-end bg-black/60">
          <View
            className="rounded-t-3xl max-h-[88%] p-5 overflow-hidden"
            style={{ backgroundColor: theme.isDark ? '#18181b' : '#FFFFFF' }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-[20px] font-bold" style={{ color: theme.text }}>
                  Show Details
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectedShow(null)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={20} color={theme.text} />
                </TouchableOpacity>
              </View>

              {selectedShow && (
                <View>
                  <View className="mb-4">
                    <StageVisual
                      category={selectedShow.category}
                      format={selectedShow.isOnline ? 'Online' : 'In person'}
                      size="modal"
                    />
                  </View>

                  <Text className="text-[22px] font-extrabold mb-1" style={{ color: theme.text }}>
                    {selectedShow.title}
                  </Text>
                  <Text className="text-[13px] mb-3" style={{ color: theme.textSecondary }}>
                    {selectedShow.category} · {selectedShow.type}
                  </Text>

                  <View
                    className="p-3.5 rounded-2xl mb-4 border flex-row items-center justify-around"
                    style={{
                      backgroundColor: theme.isDark ? '#121214' : '#F9FAFB',
                      borderColor: theme.border,
                    }}
                  >
                    <View className="items-center">
                      <MapPin size={16} color="#E91E76" />
                      <Text className="text-[12px] font-bold mt-1" style={{ color: theme.text }}>
                        {selectedShow.location}
                      </Text>
                      <Text className="text-[10px]" style={{ color: theme.textSecondary }}>
                        Location
                      </Text>
                    </View>
                    <View className="w-[1px] h-8" style={{ backgroundColor: theme.border }} />
                    <View className="items-center">
                      <Calendar size={16} color="#E91E76" />
                      <Text className="text-[12px] font-bold mt-1" style={{ color: theme.text }}>
                        {selectedShow.date}
                      </Text>
                      <Text className="text-[10px]" style={{ color: theme.textSecondary }}>
                        Date
                      </Text>
                    </View>
                    <View className="w-[1px] h-8" style={{ backgroundColor: theme.border }} />
                    <View className="items-center">
                      <Users size={16} color="#E91E76" />
                      <Text className="text-[12px] font-bold mt-1" style={{ color: theme.text }}>
                        {selectedShow.visiting}
                      </Text>
                      <Text className="text-[10px]" style={{ color: theme.textSecondary }}>
                        Attending
                      </Text>
                    </View>
                  </View>

                  <Text className="text-[14px] leading-relaxed mb-5" style={{ color: theme.textSecondary }}>
                    {selectedShow.description}
                  </Text>

                  <TouchableOpacity
                    onPress={() => handleToggleRSVP(selectedShow)}
                    activeOpacity={0.85}
                    style={{ backgroundColor: selectedShow.isBooked ? '#10B981' : '#E91E76' }}
                    className="w-full py-3.5 rounded-2xl flex-row items-center justify-center gap-2 mb-3"
                  >
                    <Ticket size={18} color="#FFFFFF" />
                    <Text className="text-white text-[15px] font-bold">
                      {selectedShow.isBooked ? 'Pass Booked · Tap to Cancel' : `Book entry pass · ${selectedShow.price}`}
                    </Text>
                  </TouchableOpacity>

                  {selectedShow.isBooked && (
                    <TouchableOpacity
                      onPress={() => {
                        const s = selectedShow;
                        setSelectedShow(null);
                        setTicketQrShow(s);
                      }}
                      activeOpacity={0.8}
                      className="py-2.5 rounded-xl border flex-row items-center justify-center gap-2 mb-2"
                      style={{ borderColor: theme.border }}
                    >
                      <QrCode size={15} color={theme.text} />
                      <Text className="text-[13px] font-semibold" style={{ color: theme.text }}>
                        View digital QR pass
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 2: DIGITAL QR ENTRY PASS MODAL                           */}
      {/* ============================================================== */}
      <Modal visible={!!ticketQrShow} animationType="fade" transparent onRequestClose={() => setTicketQrShow(null)}>
        <View className="flex-1 justify-center items-center bg-black/80 px-6">
          <View
            className="w-full rounded-3xl p-6 items-center border"
            style={{
              backgroundColor: theme.isDark ? '#18181b' : '#FFFFFF',
              borderColor: theme.border,
            }}
          >
            <View className="self-end">
              <TouchableOpacity onPress={() => setTicketQrShow(null)}>
                <X size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View className="w-16 h-16 rounded-full bg-emerald-500/15 items-center justify-center mb-3">
              <ShieldCheck size={32} color="#10B981" />
            </View>

            <Text className="text-[20px] font-extrabold text-center mb-1" style={{ color: theme.text }}>
              Entry Pass Confirmed
            </Text>
            <Text className="text-[13px] text-center mb-4" style={{ color: theme.textSecondary }}>
              {ticketQrShow?.title}
            </Text>

            {/* QR Mockup Canvas Box */}
            <View className="p-4 bg-white rounded-2xl border border-neutral-200 mb-4 items-center justify-center">
              <QrCode size={140} color="#000000" />
            </View>

            <View
              className="w-full p-3 rounded-xl border mb-4 items-center"
              style={{
                backgroundColor: theme.isDark ? '#121214' : '#F9FAFB',
                borderColor: theme.border,
              }}
            >
              <Text className="text-[10px] uppercase font-bold tracking-widest text-[#E91E76]">
                GATE VERIFICATION CODE
              </Text>
              <Text className="text-[18px] font-mono font-black mt-0.5" style={{ color: theme.text }}>
                {ticketQrShow?.ticketCode}
              </Text>
            </View>

            <Text className="text-[11px] text-center leading-relaxed" style={{ color: theme.textSecondary }}>
              Show this pass at venue check-in. Valid for {user?.name || user?.username || 'Talent User'}.
            </Text>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 3: CLUB DETAILS & JOIN FLOW MODAL                        */}
      {/* ============================================================== */}
      <Modal visible={!!selectedClub} animationType="slide" transparent onRequestClose={() => setSelectedClub(null)}>
        <View className="flex-1 justify-end bg-black/60">
          <View
            className="rounded-t-3xl max-h-[85%] p-5"
            style={{ backgroundColor: theme.isDark ? '#18181b' : '#FFFFFF' }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-[20px] font-bold" style={{ color: theme.text }}>
                  Club Profile
                </Text>
                <TouchableOpacity onPress={() => setSelectedClub(null)}>
                  <X size={20} color={theme.text} />
                </TouchableOpacity>
              </View>

              {selectedClub && (
                <View>
                  <View className="flex-row items-center gap-3 mb-4">
                    <View
                      className="w-14 h-14 rounded-full items-center justify-center"
                      style={{ backgroundColor: selectedClub.color || '#E91E76' }}
                    >
                      <Text className="text-white text-[20px] font-black">{selectedClub.initials}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-[20px] font-bold" style={{ color: theme.text }}>
                        {selectedClub.name}
                      </Text>
                      <Text className="text-[13px]" style={{ color: theme.textSecondary }}>
                        {selectedClub.category} · {selectedClub.city}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-[14px] leading-relaxed mb-4" style={{ color: theme.textSecondary }}>
                    {selectedClub.description}
                  </Text>

                  {/* Club Prompt */}
                  <View
                    className="p-3.5 rounded-2xl mb-4 border"
                    style={{
                      backgroundColor: theme.isDark ? '#121214' : '#F9FAFB',
                      borderColor: theme.border,
                    }}
                  >
                    <Text className="text-[11px] font-bold uppercase tracking-wider text-[#E91E76] mb-1">
                      CREATIVE PROMPT
                    </Text>
                    <Text className="text-[13px] font-medium italic" style={{ color: theme.text }}>
                      "{selectedClub.prompt}"
                    </Text>
                  </View>

                  {/* Join Section */}
                  {communityStore.memberships[selectedClub.id] ? (
                    <View className="mb-4">
                      <View className="bg-emerald-500/15 border border-emerald-500/30 p-3 rounded-2xl flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-2">
                          <Check size={16} color="#10B981" />
                          <Text className="text-emerald-500 text-[13px] font-bold">
                            You are a member ({communityStore.memberships[selectedClub.id]})
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleLeaveClub(selectedClub.id)}
                        className="py-2.5 rounded-xl border border-red-500/30 items-center"
                      >
                        <Text className="text-red-500 text-[13px] font-semibold">Leave Club</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View className="mb-4">
                      <Text className="text-[13px] font-bold mb-2" style={{ color: theme.text }}>
                        Join this Club
                      </Text>

                      {/* Role Selector */}
                      <View className="flex-row gap-2 mb-3">
                        {(['Fan', 'Performer'] as const).map((r) => (
                          <TouchableOpacity
                            key={r}
                            onPress={() => setJoinRole(r)}
                            style={{
                              backgroundColor: joinRole === r ? '#E91E76' : theme.isDark ? '#27272a' : '#F3F4F6',
                            }}
                            className="flex-1 py-2 rounded-xl items-center"
                          >
                            <Text
                              style={{
                                color: joinRole === r ? '#FFFFFF' : theme.text,
                                fontWeight: '700',
                                fontSize: 13,
                              }}
                            >
                              Join as {r}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      <TextInput
                        value={joinNote}
                        onChangeText={setJoinNote}
                        placeholder="Tell the host about your craft or what you want to practice..."
                        placeholderTextColor={theme.textSecondary}
                        multiline
                        className="p-3 rounded-xl border text-[13px] mb-3 min-h-[70px]"
                        style={{
                          backgroundColor: theme.isDark ? '#121214' : '#F9FAFB',
                          borderColor: theme.border,
                          color: theme.text,
                        }}
                      />

                      <TouchableOpacity
                        onPress={() => handleJoinClub(selectedClub)}
                        activeOpacity={0.85}
                        className="bg-[#E91E76] py-3.5 rounded-2xl items-center"
                      >
                        <Text className="text-white text-[14px] font-bold">Confirm Membership</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 4: BRIEF DETAIL & APPLY FORM MODAL                       */}
      {/* ============================================================== */}
      <Modal visible={!!selectedBrief} animationType="slide" transparent onRequestClose={() => setSelectedBrief(null)}>
        <View className="flex-1 justify-end bg-black/60">
          <View
            className="rounded-t-3xl max-h-[88%] p-5"
            style={{ backgroundColor: theme.isDark ? '#18181b' : '#FFFFFF' }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-[20px] font-bold" style={{ color: theme.text }}>
                  Opportunity Details
                </Text>
                <TouchableOpacity onPress={() => setSelectedBrief(null)}>
                  <X size={20} color={theme.text} />
                </TouchableOpacity>
              </View>

              {selectedBrief && (
                <View>
                  <Text className="text-[20px] font-black leading-tight mb-1" style={{ color: theme.text }}>
                    {selectedBrief.title}
                  </Text>
                  <Text className="text-[13px] text-[#E91E76] font-semibold mb-3">
                    {selectedBrief.organizer} · {selectedBrief.city} ({selectedBrief.format})
                  </Text>

                  <View
                    className="p-3.5 rounded-2xl border mb-4 flex-row items-center justify-around"
                    style={{
                      backgroundColor: theme.isDark ? '#121214' : '#F9FAFB',
                      borderColor: theme.border,
                    }}
                  >
                    <View className="items-center">
                      <Text className="text-[10px] uppercase font-bold" style={{ color: theme.textSecondary }}>
                        DEADLINE
                      </Text>
                      <Text className="text-[13px] font-bold mt-0.5" style={{ color: theme.text }}>
                        {selectedBrief.deadline}
                      </Text>
                    </View>
                    <View className="w-[1px] h-7" style={{ backgroundColor: theme.border }} />
                    <View className="items-center">
                      <Text className="text-[10px] uppercase font-bold" style={{ color: theme.textSecondary }}>
                        DURATION
                      </Text>
                      <Text className="text-[13px] font-bold mt-0.5" style={{ color: theme.text }}>
                        {selectedBrief.minutes} mins
                      </Text>
                    </View>
                    <View className="w-[1px] h-7" style={{ backgroundColor: theme.border }} />
                    <View className="items-center">
                      <Text className="text-[10px] uppercase font-bold" style={{ color: theme.textSecondary }}>
                        COMPENSATION
                      </Text>
                      <Text className="text-[14px] font-black text-[#E91E76] mt-0.5">
                        ₹{selectedBrief.fee.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-[13px] font-bold mb-1" style={{ color: theme.text }}>
                    Requirements
                  </Text>
                  <Text className="text-[13px] leading-relaxed mb-4" style={{ color: theme.textSecondary }}>
                    {selectedBrief.requirements}
                  </Text>

                  {/* Application Form */}
                  <View
                    className="p-4 rounded-2xl border mb-4"
                    style={{
                      backgroundColor: theme.isDark ? '#121214' : '#F9FAFB',
                      borderColor: theme.border,
                    }}
                  >
                    <Text className="text-[14px] font-bold mb-3 text-[#E91E76]">
                      Submit Your Performance Sample
                    </Text>

                    <Text className="text-[11px] font-semibold mb-1" style={{ color: theme.text }}>
                      Sample Title or URL
                    </Text>
                    <TextInput
                      value={applyPerfTitle}
                      onChangeText={setApplyPerfTitle}
                      placeholder="e.g. Acoustic guitar set excerpt"
                      placeholderTextColor={theme.textSecondary}
                      className="p-2.5 rounded-xl border text-[13px] mb-3"
                      style={{
                        backgroundColor: theme.isDark ? '#18181b' : '#FFFFFF',
                        borderColor: theme.border,
                        color: theme.text,
                      }}
                    />

                    <Text className="text-[11px] font-semibold mb-1" style={{ color: theme.text }}>
                      Pitch Note
                    </Text>
                    <TextInput
                      value={applyNote}
                      onChangeText={setApplyNote}
                      placeholder="Tell the organizer why this opportunity is right for your craft..."
                      placeholderTextColor={theme.textSecondary}
                      multiline
                      className="p-2.5 rounded-xl border text-[13px] mb-3 min-h-[60px]"
                      style={{
                        backgroundColor: theme.isDark ? '#18181b' : '#FFFFFF',
                        borderColor: theme.border,
                        color: theme.text,
                      }}
                    />

                    <Text className="text-[11px] font-semibold mb-1" style={{ color: theme.text }}>
                      Proposed Fee (INR)
                    </Text>
                    <TextInput
                      value={applyFee}
                      onChangeText={setApplyFee}
                      placeholder={`₹${selectedBrief.fee.toLocaleString('en-IN')}`}
                      placeholderTextColor={theme.textSecondary}
                      className="p-2.5 rounded-xl border text-[13px] mb-4"
                      style={{
                        backgroundColor: theme.isDark ? '#18181b' : '#FFFFFF',
                        borderColor: theme.border,
                        color: theme.text,
                      }}
                    />

                    <TouchableOpacity
                      onPress={() => handleApplyBrief(selectedBrief)}
                      activeOpacity={0.85}
                      className="bg-[#E91E76] py-3 rounded-xl items-center"
                    >
                      <Text className="text-white text-[14px] font-bold">Submit Application</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 5: CREATE SHOW MODAL                                     */}
      {/* ============================================================== */}
      <Modal visible={isCreateShowModalOpen} animationType="slide" transparent onRequestClose={() => setIsCreateShowModalOpen(false)}>
        <View className="flex-1 justify-end bg-black/60">
          <View
            className="rounded-t-3xl max-h-[85%] p-5"
            style={{ backgroundColor: theme.isDark ? '#18181b' : '#FFFFFF' }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-[20px] font-bold" style={{ color: theme.text }}>
                  Host a Live Show
                </Text>
                <TouchableOpacity onPress={() => setIsCreateShowModalOpen(false)}>
                  <X size={20} color={theme.text} />
                </TouchableOpacity>
              </View>

              <Text className="text-[12px] font-semibold mb-1" style={{ color: theme.text }}>
                Show Title
              </Text>
              <TextInput
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="e.g. Midnight Jazz & Spoken Word"
                placeholderTextColor={theme.textSecondary}
                className="p-3 rounded-xl border text-[13px] mb-3"
                style={{
                  backgroundColor: theme.isDark ? '#121214' : '#F9FAFB',
                  borderColor: theme.border,
                  color: theme.text,
                }}
              />

              <Text className="text-[12px] font-semibold mb-1" style={{ color: theme.text }}>
                Location / Format
              </Text>
              <TextInput
                value={newLocation}
                onChangeText={setNewLocation}
                placeholder="e.g. Bengaluru or Online"
                placeholderTextColor={theme.textSecondary}
                className="p-3 rounded-xl border text-[13px] mb-3"
                style={{
                  backgroundColor: theme.isDark ? '#121214' : '#F9FAFB',
                  borderColor: theme.border,
                  color: theme.text,
                }}
              />

              <Text className="text-[12px] font-semibold mb-1" style={{ color: theme.text }}>
                Entry Price (INR or Free)
              </Text>
              <TextInput
                value={newPrice}
                onChangeText={setNewPrice}
                placeholder="₹299"
                placeholderTextColor={theme.textSecondary}
                className="p-3 rounded-xl border text-[13px] mb-3"
                style={{
                  backgroundColor: theme.isDark ? '#121214' : '#F9FAFB',
                  borderColor: theme.border,
                  color: theme.text,
                }}
              />

              <Text className="text-[12px] font-semibold mb-1" style={{ color: theme.text }}>
                Performer Slots
              </Text>
              <TextInput
                value={newSlots}
                onChangeText={setNewSlots}
                placeholder="3 performer slots"
                placeholderTextColor={theme.textSecondary}
                className="p-3 rounded-xl border text-[13px] mb-5"
                style={{
                  backgroundColor: theme.isDark ? '#121214' : '#F9FAFB',
                  borderColor: theme.border,
                  color: theme.text,
                }}
              />

              <TouchableOpacity
                onPress={handleCreateShow}
                disabled={creatingShow}
                activeOpacity={0.85}
                className="bg-[#E91E76] py-3.5 rounded-2xl items-center"
              >
                {creatingShow ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="text-white text-[14px] font-bold">Publish Show</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 6: CREATE CLUB MODAL                                     */}
      {/* ============================================================== */}
      <Modal visible={isCreateClubModalOpen} animationType="slide" transparent onRequestClose={() => setIsCreateClubModalOpen(false)}>
        <View className="flex-1 justify-end bg-black/60">
          <View
            className="rounded-t-3xl max-h-[85%] p-5"
            style={{ backgroundColor: theme.isDark ? '#18181b' : '#FFFFFF' }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-[20px] font-bold" style={{ color: theme.text }}>
                  Start a Community Club
                </Text>
                <TouchableOpacity onPress={() => setIsCreateClubModalOpen(false)}>
                  <X size={20} color={theme.text} />
                </TouchableOpacity>
              </View>

              <Text className="text-[12px] font-semibold mb-1" style={{ color: theme.text }}>
                Club Name
              </Text>
              <TextInput
                value={newClubName}
                onChangeText={setNewClubName}
                placeholder="e.g. Acoustic Songwriters Circle"
                placeholderTextColor={theme.textSecondary}
                className="p-3 rounded-xl border text-[13px] mb-3"
                style={{
                  backgroundColor: theme.isDark ? '#121214' : '#F9FAFB',
                  borderColor: theme.border,
                  color: theme.text,
                }}
              />

              <Text className="text-[12px] font-semibold mb-1" style={{ color: theme.text }}>
                Category & City
              </Text>
              <View className="flex-row gap-2 mb-3">
                <TextInput
                  value={newClubCategory}
                  onChangeText={setNewClubCategory}
                  placeholder="Category"
                  placeholderTextColor={theme.textSecondary}
                  className="flex-1 p-3 rounded-xl border text-[13px]"
                  style={{
                    backgroundColor: theme.isDark ? '#121214' : '#F9FAFB',
                    borderColor: theme.border,
                    color: theme.text,
                  }}
                />
                <TextInput
                  value={newClubCity}
                  onChangeText={setNewClubCity}
                  placeholder="City"
                  placeholderTextColor={theme.textSecondary}
                  className="flex-1 p-3 rounded-xl border text-[13px]"
                  style={{
                    backgroundColor: theme.isDark ? '#121214' : '#F9FAFB',
                    borderColor: theme.border,
                    color: theme.text,
                  }}
                />
              </View>

              <Text className="text-[12px] font-semibold mb-1" style={{ color: theme.text }}>
                About the Community
              </Text>
              <TextInput
                value={newClubDesc}
                onChangeText={setNewClubDesc}
                placeholder="What does your club do? How often do you meet?"
                placeholderTextColor={theme.textSecondary}
                multiline
                className="p-3 rounded-xl border text-[13px] mb-3 min-h-[60px]"
                style={{
                  backgroundColor: theme.isDark ? '#121214' : '#F9FAFB',
                  borderColor: theme.border,
                  color: theme.text,
                }}
              />

              <Text className="text-[12px] font-semibold mb-1" style={{ color: theme.text }}>
                Creative Prompt / Mission
              </Text>
              <TextInput
                value={newClubPrompt}
                onChangeText={setNewClubPrompt}
                placeholder="e.g. One rhythm. Your own movement."
                placeholderTextColor={theme.textSecondary}
                className="p-3 rounded-xl border text-[13px] mb-5"
                style={{
                  backgroundColor: theme.isDark ? '#121214' : '#F9FAFB',
                  borderColor: theme.border,
                  color: theme.text,
                }}
              />

              <TouchableOpacity
                onPress={handleCreateClub}
                activeOpacity={0.85}
                className="bg-[#E91E76] py-3.5 rounded-2xl items-center"
              >
                <Text className="text-white text-[14px] font-bold">Create Club</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 7: CREATE BRIEF MODAL                                    */}
      {/* ============================================================== */}
      <Modal visible={isCreateBriefModalOpen} animationType="slide" transparent onRequestClose={() => setIsCreateBriefModalOpen(false)}>
        <View className="flex-1 justify-end bg-black/60">
          <View
            className="rounded-t-3xl max-h-[85%] p-5"
            style={{ backgroundColor: theme.isDark ? '#18181b' : '#FFFFFF' }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-[20px] font-bold" style={{ color: theme.text }}>
                  Post an Opportunity
                </Text>
                <TouchableOpacity onPress={() => setIsCreateBriefModalOpen(false)}>
                  <X size={20} color={theme.text} />
                </TouchableOpacity>
              </View>

              <Text className="text-[12px] font-semibold mb-1" style={{ color: theme.text }}>
                Brief Title
              </Text>
              <TextInput
                value={newBriefTitle}
                onChangeText={setNewBriefTitle}
                placeholder="e.g. Lead vocalist for indie film theme song"
                placeholderTextColor={theme.textSecondary}
                className="p-3 rounded-xl border text-[13px] mb-3"
                style={{
                  backgroundColor: theme.isDark ? '#121214' : '#F9FAFB',
                  borderColor: theme.border,
                  color: theme.text,
                }}
              />

              <Text className="text-[12px] font-semibold mb-1" style={{ color: theme.text }}>
                Category & City
              </Text>
              <View className="flex-row gap-2 mb-3">
                <TextInput
                  value={newBriefCategory}
                  onChangeText={setNewBriefCategory}
                  placeholder="Category"
                  placeholderTextColor={theme.textSecondary}
                  className="flex-1 p-3 rounded-xl border text-[13px]"
                  style={{
                    backgroundColor: theme.isDark ? '#121214' : '#F9FAFB',
                    borderColor: theme.border,
                    color: theme.text,
                  }}
                />
                <TextInput
                  value={newBriefCity}
                  onChangeText={setNewBriefCity}
                  placeholder="City or Online"
                  placeholderTextColor={theme.textSecondary}
                  className="flex-1 p-3 rounded-xl border text-[13px]"
                  style={{
                    backgroundColor: theme.isDark ? '#121214' : '#F9FAFB',
                    borderColor: theme.border,
                    color: theme.text,
                  }}
                />
              </View>

              <Text className="text-[12px] font-semibold mb-1" style={{ color: theme.text }}>
                Budget / Compensation (INR)
              </Text>
              <TextInput
                value={newBriefFee}
                onChangeText={setNewBriefFee}
                placeholder="₹5,000"
                placeholderTextColor={theme.textSecondary}
                className="p-3 rounded-xl border text-[13px] mb-3"
                style={{
                  backgroundColor: theme.isDark ? '#121214' : '#F9FAFB',
                  borderColor: theme.border,
                  color: theme.text,
                }}
              />

              <Text className="text-[12px] font-semibold mb-1" style={{ color: theme.text }}>
                Requirements & Selection Process
              </Text>
              <TextInput
                value={newBriefReqs}
                onChangeText={setNewBriefReqs}
                placeholder="Describe the desired sound, equipment, or portfolio requirements..."
                placeholderTextColor={theme.textSecondary}
                multiline
                className="p-3 rounded-xl border text-[13px] mb-5 min-h-[60px]"
                style={{
                  backgroundColor: theme.isDark ? '#121214' : '#F9FAFB',
                  borderColor: theme.border,
                  color: theme.text,
                }}
              />

              <TouchableOpacity
                onPress={handleCreateBrief}
                activeOpacity={0.85}
                className="bg-[#E91E76] py-3.5 rounded-2xl items-center"
              >
                <Text className="text-white text-[14px] font-bold">Publish Opportunity</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
