import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Modal,
  Share,
  Alert,
  Platform,
  Image,
} from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Search,
  Play,
  Pause,
  Settings,
  Share2,
  ArrowLeft,
  CheckCircle,
  Edit3,
  Trash2,
  Save,
  PenLine,
  X,
  LogOut,
  ChevronRight,
  BookOpen,
} from "lucide-react-native";

// --- 1. TYPE DEFINITIONS ---

interface ThemeColors {
  primary: string;
  light: string;
  bg: string;
  text: string;
  highlight: string; // Warna untuk highlight ayat aktif
}

type ThemeKey = "emerald" | "pink" | "blue";

interface SurahData {
  number: number;
  name: string;
  nameAr: string;
  meaning: string;
  verses: number;
  type: string;
}

interface VerseData {
  number: number;
  text: string;
  translation: string;
  audio: string;
}

interface AyahItemProps extends VerseData {
  isPlaying: boolean;
  isActive: boolean; // Prop baru untuk status aktif
  onPlay: (url: string) => void;
  theme: ThemeColors;
}

// --- 2. DATA & CONFIG ---

const THEMES: Record<ThemeKey, ThemeColors> = {
  emerald: {
    primary: "#059669",
    light: "#d1fae5",
    bg: "#ecfdf5",
    text: "#064e3b",
    highlight: "#f0fdf4",
  },
  pink: {
    primary: "#db2777",
    light: "#fce7f3",
    bg: "#fdf2f8",
    text: "#831843",
    highlight: "#fdf2f8",
  },
  blue: {
    primary: "#2563eb",
    light: "#dbeafe",
    bg: "#eff6ff",
    text: "#1e3a8a",
    highlight: "#eff6ff",
  },
};

const surahList: SurahData[] = [
  {
    number: 78,
    name: "An-Naba'",
    nameAr: "النبأ",
    meaning: "Berita Besar",
    verses: 40,
    type: "Mecca",
  },
  {
    number: 79,
    name: "An-Nazi'at",
    nameAr: "النازعات",
    meaning: "Malaikat Pencabut",
    verses: 46,
    type: "Mecca",
  },
  {
    number: 80,
    name: "'Abasa",
    nameAr: "عبس",
    meaning: "Ia Bermuka Masam",
    verses: 42,
    type: "Mecca",
  },
  {
    number: 81,
    name: "At-Takwir",
    nameAr: "التكوير",
    meaning: "Menggulung",
    verses: 29,
    type: "Mecca",
  },
  {
    number: 82,
    name: "Al-Infitar",
    nameAr: "الإنفطار",
    meaning: "Terbelah",
    verses: 19,
    type: "Mecca",
  },
  {
    number: 83,
    name: "Al-Mutaffifin",
    nameAr: "المطففين",
    meaning: "Orang Curang",
    verses: 36,
    type: "Mecca",
  },
  {
    number: 84,
    name: "Al-Insyiqaq",
    nameAr: "الإنشقاق",
    meaning: "Terbelah",
    verses: 25,
    type: "Mecca",
  },
  {
    number: 85,
    name: "Al-Buruj",
    nameAr: "البروج",
    meaning: "Gugusan Bintang",
    verses: 22,
    type: "Mecca",
  },
  {
    number: 86,
    name: "At-Tariq",
    nameAr: "الطارق",
    meaning: "Yang Datang di Malam Hari",
    verses: 17,
    type: "Mecca",
  },
  {
    number: 87,
    name: "Al-A'la",
    nameAr: "الأعلى",
    meaning: "Yang Paling Tinggi",
    verses: 19,
    type: "Mecca",
  },
  {
    number: 88,
    name: "Al-Ghasyiyah",
    nameAr: "الغاشية",
    meaning: "Hari Pembalasan",
    verses: 26,
    type: "Mecca",
  },
  {
    number: 89,
    name: "Al-Fajr",
    nameAr: "الفجر",
    meaning: "Fajar",
    verses: 30,
    type: "Mecca",
  },
  {
    number: 90,
    name: "Al-Balad",
    nameAr: "البلد",
    meaning: "Negeri",
    verses: 20,
    type: "Mecca",
  },
  {
    number: 91,
    name: "Asy-Syams",
    nameAr: "الشمس",
    meaning: "Matahari",
    verses: 15,
    type: "Mecca",
  },
  {
    number: 92,
    name: "Al-Lail",
    nameAr: "الليل",
    meaning: "Malam",
    verses: 21,
    type: "Mecca",
  },
  {
    number: 93,
    name: "Ad-Duha",
    nameAr: "الضحى",
    meaning: "Waktu Duha",
    verses: 11,
    type: "Mecca",
  },
  {
    number: 94,
    name: "Al-Insyirah",
    nameAr: "الشرح",
    meaning: "Kelapangan",
    verses: 8,
    type: "Mecca",
  },
  {
    number: 95,
    name: "At-Tin",
    nameAr: "التين",
    meaning: "Buah Tin",
    verses: 8,
    type: "Mecca",
  },
  {
    number: 96,
    name: "Al-'Alaq",
    nameAr: "العلق",
    meaning: "Segumpal Darah",
    verses: 19,
    type: "Mecca",
  },
  {
    number: 97,
    name: "Al-Qadr",
    nameAr: "القدر",
    meaning: "Kemuliaan",
    verses: 5,
    type: "Mecca",
  },
  {
    number: 98,
    name: "Al-Bayyinah",
    nameAr: "البينة",
    meaning: "Bukti",
    verses: 8,
    type: "Medina",
  },
  {
    number: 99,
    name: "Az-Zalzalah",
    nameAr: "الزلزلة",
    meaning: "Kegoncangan",
    verses: 8,
    type: "Medina",
  },
  {
    number: 100,
    name: "Al-'Adiyat",
    nameAr: "العاديات",
    meaning: "Kuda Perang",
    verses: 11,
    type: "Mecca",
  },
  {
    number: 101,
    name: "Al-Qari'ah",
    nameAr: "القارعة",
    meaning: "Hari Kiamat",
    verses: 11,
    type: "Mecca",
  },
  {
    number: 102,
    name: "At-Takatsur",
    nameAr: "التكاثر",
    meaning: "Bermegah-megahan",
    verses: 8,
    type: "Mecca",
  },
  {
    number: 103,
    name: "Al-'Asr",
    nameAr: "العصر",
    meaning: "Masa",
    verses: 3,
    type: "Mecca",
  },
  {
    number: 104,
    name: "Al-Humazah",
    nameAr: "الهمزة",
    meaning: "Pengumpat",
    verses: 9,
    type: "Mecca",
  },
  {
    number: 105,
    name: "Al-Fil",
    nameAr: "الفيل",
    meaning: "Gajah",
    verses: 5,
    type: "Mecca",
  },
  {
    number: 106,
    name: "Quraisy",
    nameAr: "قريش",
    meaning: "Suku Quraisy",
    verses: 4,
    type: "Mecca",
  },
  {
    number: 107,
    name: "Al-Ma'un",
    nameAr: "الماعون",
    meaning: "Barang-barang Berguna",
    verses: 7,
    type: "Mecca",
  },
  {
    number: 108,
    name: "Al-Kautsar",
    nameAr: "الكوثر",
    meaning: "Nikmat Berlimpah",
    verses: 3,
    type: "Mecca",
  },
  {
    number: 109,
    name: "Al-Kafirun",
    nameAr: "الكافرون",
    meaning: "Orang-orang Kafir",
    verses: 6,
    type: "Mecca",
  },
  {
    number: 110,
    name: "An-Nasr",
    nameAr: "النصر",
    meaning: "Pertolongan",
    verses: 3,
    type: "Medina",
  },
  {
    number: 111,
    name: "Al-Lahab",
    nameAr: "المسد",
    meaning: "Gejolak Api",
    verses: 5,
    type: "Mecca",
  },
  {
    number: 112,
    name: "Al-Ikhlas",
    nameAr: "الإخلاص",
    meaning: "Ikhlas",
    verses: 4,
    type: "Mecca",
  },
  {
    number: 113,
    name: "Al-Falaq",
    nameAr: "الفلق",
    meaning: "Waktu Subuh",
    verses: 5,
    type: "Mecca",
  },
  {
    number: 114,
    name: "An-Nas",
    nameAr: "الناس",
    meaning: "Manusia",
    verses: 6,
    type: "Mecca",
  },
];

// --- 3. SUB-COMPONENTS ---

const AyahItem: React.FC<AyahItemProps> = ({
  number,
  text,
  translation,
  audio,
  isPlaying,
  isActive,
  onPlay,
  theme,
}) => {
  return (
    <View
      style={[
        styles.ayahContainer,
        // FITUR HIGHLIGHT: Ubah warna background & border jika ayat sedang aktif
        isActive
          ? {
              backgroundColor: theme.highlight,
              borderColor: theme.primary,
              borderWidth: 1.5,
            }
          : { borderColor: "#F3F4F6" },
      ]}
    >
      <View
        style={[
          styles.ayahHeader,
          isActive && { backgroundColor: "rgba(255,255,255,0.5)" },
        ]}
      >
        <View style={styles.ayahHeaderLeft}>
          <View
            style={[styles.numberBadge, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.numberText}>{number}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.playButton,
              (isPlaying || isActive) && { backgroundColor: theme.light },
            ]}
            onPress={() => onPlay(audio)}
          >
            {isPlaying ? (
              <Pause size={16} color={theme.primary} />
            ) : (
              <Play size={16} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.arabicText}>{text}</Text>
      <Text style={styles.translationText}>{translation}</Text>
    </View>
  );
};

// --- 4. WELCOME SCREEN (Halaman Awal dengan Logo Image) ---

const WelcomeScreen = ({ onEnter }: { onEnter: () => void }) => {
  return (
    // TIPS: GANTI KODE WARNA DI BAWAH INI ('#059669') AGAR SAMA DENGAN WARNA BACKGROUND LOGO ANDA
    <View style={[styles.authContainer, { backgroundColor: "#059669" }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.welcomeContent}>
        {/* CONTAINER LOGO (TRANSPARAN) */}
        <View style={styles.logoContainer}>
          <Image
            // Pastikan Anda sudah menaruh file adaptive-icon.png di folder assets!
            source={require("./assets/adaptive-icon.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.welcomeTitle}>Juz Amma Pro</Text>
        <Text style={styles.welcomeSubtitle}>
          Baca, Hafal, dan Tadabbur Al-Quran di mana saja.
        </Text>
      </View>
      <View style={styles.bottomAuthCard}>
        <Text style={styles.authCardTitle}>Selamat Datang</Text>
        <Text style={styles.authCardDesc}>
          Mari mulai perjalanan menghafal Juz 30 dengan mudah dan nyaman.
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={onEnter}>
          <Text style={styles.primaryBtnText}>Mulai Sekarang</Text>
          <ChevronRight size={20} color="white" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- 5. MAIN APP COMPONENT ---

const MainApp = ({ onExit }: { onExit: () => void }) => {
  const [view, setView] = useState<"list" | "detail">("list");
  const [activeTab, setActiveTab] = useState<"all" | "memorized">("all");
  const [selectedSurah, setSelectedSurah] = useState<SurahData | null>(null);
  const [verses, setVerses] = useState<VerseData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  // FITUR AUTO-SCROLL: Ref untuk FlatList
  const flatListRef = useRef<FlatList>(null);

  const [memorizedSurahs, setMemorizedSurahs] = useState<number[]>([]);
  const [surahNotes, setSurahNotes] = useState<Record<number, string>>({});
  const [themeName, setThemeName] = useState<ThemeKey>("emerald");
  const theme = THEMES[themeName];

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [tempNoteInput, setTempNoteInput] = useState<string>("");
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);

  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  // FITUR AUTO-SCROLL: Effect untuk scroll saat audio berubah
  useEffect(() => {
    if (currentAudioUrl && verses.length > 0 && view === "detail") {
      const index = verses.findIndex((v) => v.audio === currentAudioUrl);
      if (index !== -1) {
        // Scroll ke index ayat tersebut
        // viewPosition: 0 (atas), 0.5 (tengah), 1 (bawah)
        flatListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.2,
        });
      }
    }
  }, [currentAudioUrl, verses]);

  useEffect(() => {
    loadStorage();
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });
    return () => {
      if (soundRef.current) soundRef.current.unloadAsync();
    };
  }, []);

  const loadStorage = async () => {
    try {
      const storedMemorized = await AsyncStorage.getItem("memorized");
      const storedNotes = await AsyncStorage.getItem("notes");
      const storedTheme = await AsyncStorage.getItem("theme");
      if (storedMemorized) setMemorizedSurahs(JSON.parse(storedMemorized));
      if (storedNotes) setSurahNotes(JSON.parse(storedNotes));
      if (storedTheme) setThemeName(storedTheme as ThemeKey);
    } catch (e) {
      console.error(e);
    }
  };

  const playAudio = async (url: string) => {
    try {
      if (currentAudioUrl === url && isPlaying && sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
        return;
      }
      if (currentAudioUrl === url && !isPlaying && sound) {
        await sound.playAsync();
        setIsPlaying(true);
        return;
      }
      if (sound) await sound.unloadAsync();

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );
      setSound(newSound);
      setCurrentAudioUrl(url);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate(async (status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          const currentIndex = verses.findIndex((v) => v.audio === url);
          if (currentIndex !== -1 && currentIndex < verses.length - 1) {
            playAudio(verses[currentIndex + 1].audio);
          }
        }
      });
    } catch (error) {
      Alert.alert("Error", "Gagal memutar audio.");
    }
  };

  const openSurah = async (surah: SurahData) => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
    setSelectedSurah(surah);
    setView("detail");
    setLoading(true);
    setVerses([]);
    setIsEditingNote(false);
    setTempNoteInput(surahNotes[surah.number] || "");

    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/surah/${surah.number}/editions/quran-uthmani,id.indonesian,ar.alafasy`
      );
      const data = await response.json();
      const arabicData = data.data[0];
      const indoData = data.data[1];
      const audioData = data.data[2];
      const versesData = arabicData.ayahs.map((ayah: any, index: number) => ({
        number: ayah.numberInSurah,
        text: ayah.text,
        translation: indoData.ayahs[index].text,
        audio: audioData.ayahs[index].audio,
      }));
      setVerses(versesData);
    } catch (error) {
      Alert.alert("Error", "Gagal memuat surat.");
    } finally {
      setLoading(false);
    }
  };

  const goHome = async () => {
    setView("list");
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  const toggleMemorized = async (id: number) => {
    let newMemorized = memorizedSurahs.includes(id)
      ? memorizedSurahs.filter((item) => item !== id)
      : [...memorizedSurahs, id];
    setMemorizedSurahs(newMemorized);
    await AsyncStorage.setItem("memorized", JSON.stringify(newMemorized));
  };

  const saveNote = async () => {
    if (!selectedSurah) return;
    const newNotes = { ...surahNotes, [selectedSurah.number]: tempNoteInput };
    setSurahNotes(newNotes);
    await AsyncStorage.setItem("notes", JSON.stringify(newNotes));
    setIsEditingNote(false);
  };

  const deleteNote = async () => {
    if (!selectedSurah) return;
    const newNotes = { ...surahNotes };
    delete newNotes[selectedSurah.number];
    setSurahNotes(newNotes);
    await AsyncStorage.setItem("notes", JSON.stringify(newNotes));
    setTempNoteInput("");
    setIsEditingNote(false);
  };

  const changeTheme = async (color: ThemeKey) => {
    setThemeName(color);
    await AsyncStorage.setItem("theme", color);
    setShowSettings(false);
  };

  const filteredSurahs = surahList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.number.toString().includes(searchQuery);
    return activeTab === "memorized"
      ? matchesSearch && memorizedSurahs.includes(s.number)
      : matchesSearch;
  });

  if (view === "list") {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
        <View style={[styles.headerHome, { backgroundColor: theme.primary }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.appTitle}>Assalamu'alaikum</Text>
              <Text style={styles.appSubtitle}>
                Sudahkah kamu mengaji hari ini?
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowSettings(true)}
              style={styles.iconBtn}
            >
              <Settings color="white" size={24} />
            </TouchableOpacity>
          </View>
          <View style={styles.searchBar}>
            <Search color="#9CA3AF" size={20} style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Cari surat..."
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              onPress={() => setActiveTab("all")}
              style={[
                styles.tabButton,
                activeTab === "all" ? styles.tabActive : null,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "all" ? { color: theme.primary } : null,
                ]}
              >
                Semua
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("memorized")}
              style={[
                styles.tabButton,
                activeTab === "memorized" ? styles.tabActive : null,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "memorized" ? { color: theme.primary } : null,
                ]}
              >
                Hafalan
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={filteredSurahs}
          keyExtractor={(item) => item.number.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          renderItem={({ item }) => {
            const isMemorized = memorizedSurahs.includes(item.number);
            const hasNote = surahNotes[item.number];
            return (
              <TouchableOpacity
                style={[
                  styles.surahCard,
                  { borderColor: isMemorized ? theme.primary : "#F3F4F6" },
                ]}
                onPress={() => openSurah(item)}
              >
                <View style={styles.cardBadgeContainer}>
                  {hasNote && (
                    <View
                      style={[styles.dotBadge, { backgroundColor: "#60A5FA" }]}
                    />
                  )}
                  {isMemorized && (
                    <View
                      style={[
                        styles.dotBadge,
                        { backgroundColor: theme.primary },
                      ]}
                    />
                  )}
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={[
                      styles.numberCircle,
                      isMemorized ? { backgroundColor: theme.light } : null,
                    ]}
                  >
                    {isMemorized ? (
                      <CheckCircle size={20} color={theme.primary} />
                    ) : (
                      <Text style={{ fontWeight: "bold", color: "#6B7280" }}>
                        {item.number}
                      </Text>
                    )}
                  </View>
                  <View style={{ marginLeft: 12, marginTop: 6 }}>
                    <Text style={styles.surahName}>{item.name}</Text>
                    <Text style={styles.surahMeta}>
                      {item.type} • {item.verses} Ayat
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: "flex-end", marginTop: 6 }}>
                  <Text style={[styles.surahNameAr, { color: theme.primary }]}>
                    {item.nameAr}
                  </Text>
                  <Text style={styles.surahMeaning}>{item.meaning}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />

        <Modal visible={showSettings} animationType="slide" transparent={true}>
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setShowSettings(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Pengaturan</Text>
                <TouchableOpacity onPress={() => setShowSettings(false)}>
                  <X size={24} color="#374151" />
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionHeader}>Tema Aplikasi</Text>
              {(["emerald", "pink", "blue"] as ThemeKey[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => changeTheme(t)}
                  style={styles.themeOption}
                >
                  <View
                    style={[
                      styles.colorCircle,
                      { backgroundColor: THEMES[t].primary },
                    ]}
                  />
                  <Text style={styles.themeText}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                  {themeName === t && (
                    <CheckCircle size={20} color={THEMES[t].primary} />
                  )}
                </TouchableOpacity>
              ))}
              <View style={styles.divider} />
              <TouchableOpacity onPress={onExit} style={styles.logoutBtn}>
                <LogOut size={20} color="#EF4444" />
                <Text style={styles.logoutText}>Kembali ke Awal</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.headerDetail}>
        <TouchableOpacity onPress={goHome} style={{ padding: 8 }}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.detailTitle}>{selectedSurah?.name}</Text>
          <Text style={styles.detailSubtitle}>{selectedSurah?.meaning}</Text>
        </View>
        <TouchableOpacity style={{ padding: 8 }}>
          <Share2 size={24} color="#374151" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ marginTop: 10, color: "#6B7280" }}>
            Memuat ayat...
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef} // FITUR AUTO-SCROLL: Hubungkan Ref ke FlatList
          data={verses}
          keyExtractor={(item) => item.number.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
          // Tangani jika scroll gagal (biasanya karena layout belum siap)
          onScrollToIndexFailed={(info) => {
            const wait = new Promise((resolve) => setTimeout(resolve, 500));
            wait.then(() => {
              flatListRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
              });
            });
          }}
          ListHeaderComponent={
            <View>
              {selectedSurah && (
                <TouchableOpacity
                  onPress={() => toggleMemorized(selectedSurah.number)}
                  style={[
                    styles.memorizeBtn,
                    memorizedSurahs.includes(selectedSurah.number)
                      ? {
                          backgroundColor: theme.light,
                          borderColor: theme.light,
                        }
                      : { borderColor: "#E5E7EB" },
                  ]}
                >
                  <CheckCircle
                    size={20}
                    color={
                      memorizedSurahs.includes(selectedSurah.number)
                        ? theme.primary
                        : "#6B7280"
                    }
                  />
                  <Text
                    style={{
                      marginLeft: 8,
                      fontWeight: "600",
                      color: memorizedSurahs.includes(selectedSurah.number)
                        ? theme.primary
                        : "#6B7280",
                    }}
                  >
                    {memorizedSurahs.includes(selectedSurah.number)
                      ? "Sudah Hafal"
                      : "Tandai Sudah Hafal"}
                  </Text>
                </TouchableOpacity>
              )}
              <View style={{ alignItems: "center", marginVertical: 20 }}>
                <Text style={[styles.bismillahText, { color: theme.primary }]}>
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </Text>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <AyahItem
              {...item}
              theme={theme}
              isPlaying={currentAudioUrl === item.audio && isPlaying}
              // FITUR HIGHLIGHT: Cek apakah audio ayat ini sama dengan yang sedang diputar
              isActive={currentAudioUrl === item.audio}
              onPlay={playAudio}
            />
          )}
          ListFooterComponent={
            <View style={styles.notesSection}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <PenLine size={18} color="#3B82F6" />
                <Text
                  style={{ fontWeight: "bold", marginLeft: 8, fontSize: 16 }}
                >
                  Catatan
                </Text>
              </View>
              {isEditingNote ? (
                <View style={styles.editNoteContainer}>
                  <TextInput
                    style={styles.noteInput}
                    multiline
                    placeholder="Tulis catatan..."
                    value={tempNoteInput}
                    onChangeText={setTempNoteInput}
                  />
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      marginTop: 8,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setIsEditingNote(false)}
                      style={{ padding: 8, marginRight: 8 }}
                    >
                      <Text style={{ color: "#6B7280" }}>Batal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={saveNote} style={styles.saveBtn}>
                      <Save size={16} color="white" />
                      <Text
                        style={{
                          color: "white",
                          marginLeft: 4,
                          fontWeight: "600",
                        }}
                      >
                        Simpan
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.noteCard}>
                  {selectedSurah && surahNotes[selectedSurah.number] ? (
                    <View>
                      <Text style={{ color: "#374151", lineHeight: 22 }}>
                        {surahNotes[selectedSurah.number]}
                      </Text>
                      <View style={styles.noteActions}>
                        <TouchableOpacity
                          onPress={() => setIsEditingNote(true)}
                          style={styles.actionBtn}
                        >
                          <Edit3 size={14} color="#2563EB" />
                          <Text
                            style={{
                              color: "#2563EB",
                              fontSize: 12,
                              marginLeft: 4,
                            }}
                          >
                            Edit
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={deleteNote}
                          style={styles.actionBtn}
                        >
                          <Trash2 size={14} color="#EF4444" />
                          <Text
                            style={{
                              color: "#EF4444",
                              fontSize: 12,
                              marginLeft: 4,
                            }}
                          >
                            Hapus
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={{ alignItems: "center", padding: 10 }}>
                      <Text
                        style={{
                          color: "#9CA3AF",
                          fontSize: 12,
                          marginBottom: 8,
                        }}
                      >
                        Belum ada catatan.
                      </Text>
                      <TouchableOpacity
                        onPress={() => setIsEditingNote(true)}
                        style={styles.createNoteBtn}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color: "#4B5563",
                          }}
                        >
                          + Buat Catatan
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

// --- 6. ROOT COMPONENT (YANG WAJIB ADA & DIEKSPOR DEFAULT) ---
export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  if (showWelcome) {
    return <WelcomeScreen onEnter={() => setShowWelcome(false)} />;
  }

  return <MainApp onExit={() => setShowWelcome(true)} />;
}

// --- 7. STYLES ---

const styles = StyleSheet.create({
  // Root
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Auth Screens
  authContainer: { flex: 1, backgroundColor: "#FFFFFF" },
  welcomeContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  // LOGO CONTAINER (Sudah Transparan)
  logoContainer: {
    width: 300,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  logoImage: { width: 280, height: 280 }, // Ukuran gambar logo
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#D1FAE5",
    textAlign: "center",
    lineHeight: 24,
  },
  bottomAuthCard: {
    backgroundColor: "white",
    padding: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  authCardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  authCardDesc: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
    lineHeight: 22,
  },
  primaryBtn: {
    backgroundColor: "#059669",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  primaryBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },

  // App Header
  headerHome: {
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  appTitle: { fontSize: 24, fontWeight: "bold", color: "white" },
  appSubtitle: { fontSize: 14, color: "#D1FAE5" },
  iconBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20,
  },
  searchInput: { flex: 1, fontSize: 16, color: "#1F2937" },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 10,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  tabActive: { backgroundColor: "white", shadowOpacity: 0.1, elevation: 2 },
  tabText: { fontWeight: "600", fontSize: 13, color: "rgba(255,255,255,0.8)" },

  // Surah List
  surahCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
  },
  cardBadgeContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    gap: 4,
  },
  dotBadge: { width: 8, height: 8, borderRadius: 4 },
  numberCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  surahName: { fontSize: 16, fontWeight: "bold", color: "#1F2937" },
  surahMeta: { fontSize: 12, color: "#9CA3AF" },
  surahNameAr: { fontSize: 18, fontWeight: "bold" },
  surahMeaning: { fontSize: 12, color: "#9CA3AF" },

  // Detail
  headerDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
  },
  detailTitle: { fontSize: 18, fontWeight: "bold", color: "#1F2937" },
  detailSubtitle: { fontSize: 12, color: "#6B7280" },
  memorizeBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderRadius: 30,
    borderWidth: 1,
    marginVertical: 10,
  },
  bismillahText: {
    fontSize: 28,
    fontFamily: Platform.OS === "ios" ? "System" : "serif",
  },

  // Ayah
  ayahContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
    paddingBottom: 20,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  ayahHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    backgroundColor: "#F9FAFB",
    padding: 8,
    borderRadius: 8,
  },
  ayahHeaderLeft: { flexDirection: "row", alignItems: "center" },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  numberText: { color: "white", fontWeight: "bold", fontSize: 12 },
  playButton: { padding: 6, borderRadius: 20, backgroundColor: "#E5E7EB" },
  arabicText: {
    fontSize: 26,
    textAlign: "right",
    marginBottom: 16,
    lineHeight: 45,
    color: "#1F2937",
    fontFamily: Platform.OS === "ios" ? "System" : "serif",
  },
  translationText: { fontSize: 14, color: "#4B5563", lineHeight: 22 },

  // Notes
  notesSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
  },
  noteCard: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  createNoteBtn: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  editNoteContainer: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#93C5FD",
  },
  noteInput: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
  },
  saveBtn: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  noteActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    paddingTop: 8,
    gap: 12,
  },
  actionBtn: { flexDirection: "row", alignItems: "center" },

  // Settings
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    width: "85%",
    borderRadius: 20,
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#1F2937" },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
    marginTop: 10,
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
  },
  colorCircle: { width: 24, height: 24, borderRadius: 12, marginRight: 12 },
  themeText: { flex: 1, fontSize: 16, color: "#374151" },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 16 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
  },
  logoutText: { color: "#EF4444", fontWeight: "bold", marginLeft: 8 },
});
