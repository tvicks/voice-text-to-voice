import { LanguageInfo } from '../types';

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    code: 'en-US',
    name: 'English (US)',
    nativeName: 'English (United States)',
    flag: '🇺🇸',
    defaultSample:
      'Welcome to Vocalis Studio. Experience next-generation voice synthesis with customizable pitch, cadence, and human-like emotional depth.',
  },
  {
    code: 'en-GB',
    name: 'English (UK)',
    nativeName: 'English (United Kingdom)',
    flag: '🇬🇧',
    defaultSample:
      'Good afternoon. The weather today remains delightfully crisp, with a gentle breeze across the valley and evening tea awaiting by the fire.',
  },
  {
    code: 'es-ES',
    name: 'Spanish (Spain)',
    nativeName: 'Español (España)',
    flag: '🇪🇸',
    defaultSample:
      'Bienvenidos al estudio de voz. Transforma cualquier texto en un discurso natural, fluido y lleno de expresividad en cuestión de segundos.',
  },
  {
    code: 'es-MX',
    name: 'Spanish (Mexico)',
    nativeName: 'Español (México)',
    flag: '🇲🇽',
    defaultSample:
      'Hola a todos. Descubre cómo la tecnología de audio y el poder de la síntesis vocal pueden dar vida a tus historias y proyectos.',
  },
  {
    code: 'fr-FR',
    name: 'French (France)',
    nativeName: 'Français (France)',
    flag: '🇫🇷',
    defaultSample:
      'Bienvenue dans le studio vocal. Écoutez la clarté et l’élégance d’une synthèse vocale sophistiquée, adaptée à tous vos projets littéraires.',
  },
  {
    code: 'de-DE',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    defaultSample:
      'Guten Tag! Willkommen in der Zukunft der Sprachsynthese. Gestalten Sie Klangfarbe, Tonhöhe und Sprechgeschwindigkeit ganz nach Ihren Wünschen.',
  },
  {
    code: 'it-IT',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    defaultSample:
      'Benvenuti nello studio vocale. La bellezza della voce umana incontra la precisione della sintesi moderna in un’armonia sonora senza precedenti.',
  },
  {
    code: 'pt-BR',
    name: 'Portuguese (Brazil)',
    nativeName: 'Português (Brasil)',
    flag: '🇧🇷',
    defaultSample:
      'Olá! Bem-vindo ao estúdio de voz inteligente. Dê vida às suas ideias com entonações calorosas, ritmo envolvente e pronúncia impecável.',
  },
  {
    code: 'ja-JP',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    defaultSample:
      'ヴォーカリス・スタジオへようこそ。自然で表現力豊かな音声合成技術により、文章が命を吹き込まれたかのように響き渡ります。',
  },
  {
    code: 'zh-CN',
    name: 'Chinese (Mandarin)',
    nativeName: '中文 (普通话)',
    flag: '🇨🇳',
    defaultSample:
      '欢迎使用智能多语言语音工作室。在这里，您可以自由调整音调、语速和情感风格，享受身临其境的听觉盛宴。',
  },
  {
    code: 'ko-KR',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    defaultSample:
      '안녕하세요! 다국어 텍스트 음성 변환 스튜디오에 오신 것을 환영합니다. 자연스러운 억양과 풍부한 감정으로 텍스트를 음성으로 전환해보세요.',
  },
  {
    code: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    defaultSample:
      'वोकैलिस स्टूडियो में आपका स्वागत है। अपनी भाषा में स्वाभाविक और स्पष्ट आवाज़ का अनुभव करें और अपने विचारों को स्वर दें।',
  },
  {
    code: 'ta-IN',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    defaultSample:
      'வோகலிஸ் வாய்ஸ் ஸ்டுடியோவிற்கு தங்களை அன்புடன் வரவேற்கிறோம். தெளிவான உச்சரிப்பு, இயல்பான தொனி மற்றும் துல்லியமான குரல் அமைப்புகளுடன் உங்கள் உரையை உயிர்ப்பிக்கவும்.',
  },
  {
    code: 'ar-SA',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    defaultSample:
      'مرحباً بكم في استوديو الصوت المتقدم. اختبر قوة تحويل النص إلى كلام بنبرة واقعية ولغة فصيحة تناسب كافة احتياجاتك.',
  },
  {
    code: 'ru-RU',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    defaultSample:
      'Добро пожаловать в студию синтеза речи. Настраивайте темп, высоту голоса и эмоциональную окраску для безупречного звучания ваших текстов.',
  },
  {
    code: 'nl-NL',
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
    defaultSample:
      'Welkom bij Vocalis. Luister naar levensechte stemmen met vloeiende articulatie en aanpasbare toonhoogte voor elk type gesproken tekst.',
  },
  {
    code: 'tr-TR',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    defaultSample:
      'Metin seslendirme stüdyosuna hoş geldiniz. Gerçekçi tonlamalar, akıcı konuşma ve esnek ses ayarları ile kelimelerinize can verin.',
  },
  {
    code: 'pl-PL',
    name: 'Polish',
    nativeName: 'Polski',
    flag: '🇵🇱',
    defaultSample:
      'Witaj w Vocalis Studio. Odkryj nowoczesną syntezę mowy z bogatą dynamiką głosu i krystalicznie czystą wymową.',
  },
  {
    code: 'sv-SE',
    name: 'Swedish',
    nativeName: 'Svenska',
    flag: '🇸🇪',
    defaultSample:
      'Välkommen till talstudion. Skapa fängslande ljudberättelser med naturlig betoning och anpassad röstkaraktär.',
  },
];

export const CATEGORIZED_SAMPLES = [
  {
    id: 'news',
    label: 'Breaking News Anchor',
    category: 'Commercial & Broadcast',
    text: 'Good evening. Scientists have officially confirmed the discovery of an ancient subterranean aquifer system beneath the high plateaus, potentially revolutionizing regional water conservation for generations to come.',
  },
  {
    id: 'story',
    label: 'Bedtime Fantasy Story',
    category: 'Narrative & Creative',
    text: 'Far beyond the slumbering mountains, nestled within a grove of whispering silver willows, slept an enchanted lantern whose gentle golden beam guided nocturnal travelers safely through the mist.',
  },
  {
    id: 'keynote',
    label: 'Tech Keynote Presentation',
    category: 'Professional & Business',
    text: 'Today marks a defining milestone in human-computer interaction. When we merge state-of-the-art neural architecture with intuitive acoustic design, digital voices cease to sound artificial—they become heartfelt expressions.',
  },
  {
    id: 'meditation',
    label: 'Mindfulness & Meditation',
    category: 'Wellness & Calm',
    text: 'Take a slow, deep breath in through your nose... hold it gently for three seconds... and slowly exhale all tension. Feel the ground beneath you supporting your weight completely.',
  },
  {
    id: 'dialogue',
    label: 'Audiobook Dialogue',
    category: 'Narrative & Creative',
    text: '“Wait,” Eleanor whispered, clutching the brass compass tightly against her chest. “Do you hear that? The bells haven’t rung from the abandoned chapel in nearly forty years.”',
  },
  {
    id: 'tutor',
    label: 'Language Tutor Drill',
    category: 'Education & Learning',
    text: 'Repeat after me with clear enunciation: The quick brown fox jumps gracefully over the lazy dog. Pay close attention to the open vowel sounds and clean consonant releases.',
  },
  {
    id: 'tamil_literature',
    label: 'Tamil Literary Prose (தமிழ் இலக்கியம்)',
    category: 'Literature & Culture',
    text: 'யாதும் ஊரே யாவரும் கேளிர்; தீதும் நன்றும் பிறர்தர வாரா. அன்பும் அறனும் உடைத்தாயின் இல்வாழ்க்கை பண்பும் பயனும் அது. தமிழ் மொழியின் இனிமையை உங்கள் குரலில் கேட்டு மகிழுங்கள்.',
  },
  {
    id: 'tamil_broadcast',
    label: 'Tamil News Broadcast (செய்தி அறிக்கை)',
    category: 'Commercial & Broadcast',
    text: 'வணக்கம், இன்றைய முக்கிய செய்திகள். அறிவியல் மற்றும் விண்வெளி ஆய்வில் புதிய சாதனையாக, தொலைதூரக் கோள்களின் சூழல் குறித்த ஆய்வு முடிவுகள் இன்று வெளியிடப்பட்டுள்ளன.',
  },
];
