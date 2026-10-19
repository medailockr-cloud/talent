const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const SAMPLE_PERFORMANCES = [
  {
    title: 'Contemporary Flow in Rain',
    description: 'An emotional contemporary routine exploring resilience and freedom. Recorded live in Kochi. #dance #contemporary #art',
    category: 'Dance',
    subCategory: 'Contemporary',
    purpose: 'Get Discovered',
    location: 'Kochi, India',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    authorUsername: 'kiara_nair',
    authorName: 'Kiara Nair',
    authorTitle: 'Contemporary Dancer',
    authorLocation: 'Kochi, India',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    tags: ['dance', 'contemporary', 'kerala', 'stage']
  },
  {
    title: 'Midnight Fingerstyle Groove',
    description: 'Original acoustic guitar composition tuned in DADGAD. Let me know what you think of the harmonic bridge! #music #guitar #fingerstyle',
    category: 'Music',
    subCategory: 'Acoustic Guitar',
    purpose: 'Audition Ready',
    location: 'Mumbai, India',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    authorUsername: 'rohan_sen',
    authorName: 'Rohan Sen',
    authorTitle: 'Guitarist & Composer',
    authorLocation: 'Mumbai, India',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    tags: ['music', 'guitar', 'fingerstyle', 'acoustic']
  },
  {
    title: 'Urban Hip-Hop Cypher Take',
    description: 'Freestyle session with sharp isolations and polyrhythmic footwork. Straight energy! #dance #hiphop #freestyle',
    category: 'Dance',
    subCategory: 'Hip-Hop',
    purpose: 'Get Discovered',
    location: 'Bengaluru, India',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    authorUsername: 'maya_lin',
    authorName: 'Maya Lin',
    authorTitle: 'Street Dancer & Choreographer',
    authorLocation: 'Bengaluru, India',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
    tags: ['dance', 'hiphop', 'streetdance', 'bengaluru']
  },
  {
    title: 'The Solitary Monologue',
    description: 'Dramatic monologue from Act II: confronting unspoken truths under stage lights. #acting #theatre #monologue',
    category: 'Acting',
    subCategory: 'Dramatic',
    purpose: 'Audition Ready',
    location: 'New Delhi, India',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    authorUsername: 'david_kim',
    authorName: 'David Kim',
    authorTitle: 'Theatre & Screen Actor',
    authorLocation: 'New Delhi, India',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    tags: ['acting', 'theatre', 'drama', 'audition']
  },
  {
    title: 'Coffee Shop Crowd Work',
    description: 'Improvised set about city traffic and modern dating. Live reaction never lies! 😂 #comedy #standup #funny',
    category: 'Comedy',
    subCategory: 'Stand-Up',
    purpose: 'Get Discovered',
    location: 'Pune, India',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    authorUsername: 'samira_khan',
    authorName: 'Samira Khan',
    authorTitle: 'Stand-Up Comic',
    authorLocation: 'Pune, India',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    tags: ['comedy', 'standup', 'live', 'pune']
  },
  {
    title: 'Golden Hour Cinematic Reel',
    description: 'Anamorphic lens test capturing the coastal sunsets and authentic moments. Shot in 4K 60fps. #film #cinematography #reels',
    category: 'Film',
    subCategory: 'Cinematography',
    purpose: 'Collaborate',
    location: 'Goa, India',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    authorUsername: 'leo_vance',
    authorName: 'Leo Vance',
    authorTitle: 'Cinematographer & Director',
    authorLocation: 'Goa, India',
    authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
    tags: ['film', 'cinematography', 'goa', 'director']
  },
  {
    title: 'Soul & Jazz Vocal Improvisation',
    description: 'Pure acoustic vocal layering with live looping and jazz scales. Headphone listening recommended! 🎧 #voice #jazz #soul',
    category: 'Voice',
    subCategory: 'Jazz Vocals',
    purpose: 'Get Discovered',
    location: 'Kolkata, India',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    authorUsername: 'aisha_roy',
    authorName: 'Aisha Roy',
    authorTitle: 'Jazz & Soul Vocalist',
    authorLocation: 'Kolkata, India',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
    tags: ['voice', 'jazz', 'soul', 'vocals']
  },
  {
    title: 'Palette Knife Portrait in 60s',
    description: 'Heavy textured oil painting on raw linen canvas. Exploring depth and contrast with bold strokes. #art #painting #canvas',
    category: 'Art',
    subCategory: 'Live Painting',
    purpose: 'Build Following',
    location: 'Chennai, India',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    authorUsername: 'elena_rostova',
    authorName: 'Elena Rostova',
    authorTitle: 'Visual Artist & Painter',
    authorLocation: 'Chennai, India',
    authorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80',
    tags: ['art', 'painting', 'creative', 'speedart']
  },
  {
    title: 'Acrobatic Flow & Balance',
    description: 'Hand balance sequencing with calisthenics flow. Pushing physical limits every single morning. #other #acrobatics #fitness',
    category: 'Other',
    subCategory: 'Acrobatics',
    purpose: 'Get Discovered',
    location: 'Hyderabad, India',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    authorUsername: 'marcus_cole',
    authorName: 'Marcus Cole',
    authorTitle: 'Movement & Flow Artist',
    authorLocation: 'Hyderabad, India',
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
    tags: ['other', 'flow', 'movement', 'balance']
  },
  {
    title: 'Classical Kathak Footwork (Tatkar)',
    description: 'Traditional tatkar variations and swift chakkars in Teentaal (16 beats). Dedicated to my Guru. #dance #classical #kathak',
    category: 'Dance',
    subCategory: 'Classical',
    purpose: 'Audition Ready',
    location: 'Jaipur, India',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    authorUsername: 'priya_sharma',
    authorName: 'Priya Sharma',
    authorTitle: 'Classical Kathak Exponent',
    authorLocation: 'Jaipur, India',
    authorAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80',
    tags: ['dance', 'classical', 'kathak', 'tradition']
  }
];

async function seed() {
  console.log('Seeding fresh video performances...');
  const passwordHash = await bcrypt.hash('TestPass123!', 10);

  for (const item of SAMPLE_PERFORMANCES) {
    // Upsert Author
    const author = await prisma.user.upsert({
      where: { username: item.authorUsername },
      update: {
        name: item.authorName,
        title: item.authorTitle,
        location: item.authorLocation,
        avatarUrl: item.authorAvatar,
      },
      create: {
        username: item.authorUsername,
        password: passwordHash,
        name: item.authorName,
        title: item.authorTitle,
        location: item.authorLocation,
        avatarUrl: item.authorAvatar,
      }
    });

    // Check if video already exists
    const existing = await prisma.video.findFirst({
      where: {
        title: item.title,
        authorId: author.id
      }
    });

    if (!existing) {
      const created = await prisma.video.create({
        data: {
          title: item.title,
          description: item.description,
          url: item.url,
          category: item.category,
          subCategory: item.subCategory,
          purpose: item.purpose,
          location: item.location,
          allowJudging: true,
          authorId: author.id,
          views: Math.floor(Math.random() * 250) + 20,
          hashtags: {
            connectOrCreate: item.tags.map(tag => ({
              where: { name: tag },
              create: { name: tag }
            }))
          }
        }
      });
      console.log(`Created video: "${created.title}" (ID: ${created.id}) by ${author.name}`);
    } else {
      console.log(`Video already exists: "${item.title}"`);
    }
  }

  const count = await prisma.video.count();
  console.log(`\nSeed completed! Total videos in database now: ${count}`);
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
