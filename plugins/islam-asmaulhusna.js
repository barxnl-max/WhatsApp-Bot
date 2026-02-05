/* Semoga kita semua dalam perlindungan Allah 
-Muhammad Akbar */

const axios = require("axios")

const ayatAsmaul = {
  1: {
    ayat: "الرَّحْمَٰنُ عَلَّمَ الْقُرْآنَ",
    arti: "Yang Maha Pengasih, telah mengajarkan Al-Qur’an.",
    sumber: "QS. Ar-Rahman: 1–2"
  },
  2: {
    ayat: "وَكَانَ بِالْمُؤْمِنِينَ رَحِيمًا",
    arti: "Dan Dia Maha Penyayang kepada orang-orang yang beriman.",
    sumber: "QS. Al-Ahzab: 43"
  },
  3: {
    ayat: "فَتَعَالَى اللَّهُ الْمَلِكُ الْحَقُّ",
    arti: "Maka Maha Tinggi Allah, Raja Yang Sebenarnya.",
    sumber: "QS. Thaha: 114"
  },
  4: {
    ayat: "هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْقُدُّوسُ",
    arti: "Dialah Allah, tidak ada Tuhan selain Dia, Yang Maha Suci.",
    sumber: "QS. Al-Hasyr: 23"
  },
  5: {
    ayat: "هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ السَّلَامُ",
    arti: "Dialah Allah, Yang Maha Sejahtera.",
    sumber: "QS. Al-Hasyr: 23"
  },
  6: {
    ayat: "الْمُؤْمِنُ الْمُهَيْمِنُ",
    arti: "Yang Maha Memberi Keamanan dan Maha Pemelihara.",
    sumber: "QS. Al-Hasyr: 23"
  },
  7: {
    ayat: "الْعَزِيزُ الْجَبَّارُ الْمُتَكَبِّرُ",
    arti: "Yang Maha Perkasa, Maha Kuasa, dan Maha Memiliki Kebesaran.",
    sumber: "QS. Al-Hasyr: 23"
  },
  8: {
    ayat: "هُوَ اللَّهُ الْخَالِقُ الْبَارِئُ الْمُصَوِّرُ",
    arti: "Dialah Allah Yang Maha Pencipta dan Maha Membentuk rupa.",
    sumber: "QS. Al-Hasyr: 24"
  },
  9: {
    ayat: "إِنَّ اللَّهَ كَانَ غَفُورًا رَحِيمًا",
    arti: "Sesungguhnya Allah Maha Pengampun lagi Maha Penyayang.",
    sumber: "QS. An-Nisa: 96"
  },
  10: {
    ayat: "إِنَّ رَبَّكَ وَاسِعُ الْمَغْفِرَةِ",
    arti: "Sesungguhnya Tuhanmu Maha Luas ampunan-Nya.",
    sumber: "QS. An-Najm: 32"
  },
  11: {
    ayat: "إِنَّهُ هُوَ الْقَهَّارُ",
    arti: "Sesungguhnya Dia Maha Perkasa lagi Maha Mengalahkan.",
    sumber: "QS. Az-Zumar: 4"
  },
  12: {
    ayat: "وَاللَّهُ شَدِيدُ الْعِقَابِ",
    arti: "Dan Allah Maha Keras hukuman-Nya.",
    sumber: "QS. Al-Baqarah: 165"
  },
  13: {
    ayat: "وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    arti: "Dan Dia Maha Tinggi lagi Maha Agung.",
    sumber: "QS. Al-Baqarah: 255"
  },
  14: {
    ayat: "إِنَّ اللَّهَ كَانَ عَلِيمًا حَكِيمًا",
    arti: "Sesungguhnya Allah Maha Mengetahui lagi Maha Bijaksana.",
    sumber: "QS. An-Nisa: 11"
  },
  15: {
    ayat: "إِنَّ اللَّهَ سَمِيعٌ بَصِيرٌ",
    arti: "Sesungguhnya Allah Maha Mendengar lagi Maha Melihat.",
    sumber: "QS. Al-Hujurat: 1"
  },
  16: {
    ayat: "إِنَّ اللَّهَ لَطِيفٌ خَبِيرٌ",
    arti: "Sesungguhnya Allah Maha Lembut lagi Maha Mengetahui.",
    sumber: "QS. Al-Hajj: 63"
  },
  17: {
    ayat: "إِنَّ اللَّهَ كَانَ عَلَيْكُمْ رَقِيبًا",
    arti: "Sesungguhnya Allah selalu mengawasi kalian.",
    sumber: "QS. An-Nisa: 1"
  },
  18: {
    ayat: "إِنَّ اللَّهَ هُوَ الرَّزَّاقُ",
    arti: "Sesungguhnya Allah Dialah Maha Pemberi Rezeki.",
    sumber: "QS. Adz-Dzariyat: 58"
  },
  19: {
    ayat: "إِنَّ اللَّهَ قَوِيٌّ عَزِيزٌ",
    arti: "Sesungguhnya Allah Maha Kuat lagi Maha Perkasa.",
    sumber: "QS. Al-Hajj: 40"
  },
  20: {
    ayat: "إِنَّهُ كَانَ حَلِيمًا غَفُورًا",
    arti: "Sesungguhnya Dia Maha Penyantun lagi Maha Pengampun.",
    sumber: "QS. Al-Isra: 44"
  },
  21: {
    ayat: "إِنَّ اللَّهَ كَانَ تَوَّابًا رَحِيمًا",
    arti: "Sesungguhnya Allah Maha Penerima Taubat lagi Maha Penyayang.",
    sumber: "QS. An-Nisa: 64"
  },
  22: {
    ayat: "إِنَّ رَبَّكَ سَرِيعُ الْعِقَابِ وَإِنَّهُ لَغَفُورٌ رَحِيمٌ",
    arti: "Sesungguhnya Tuhanmu cepat siksaan-Nya dan Maha Pengampun lagi Maha Penyayang.",
    sumber: "QS. Al-A'raf: 167"
  },
  23: {
    ayat: "وَاللَّهُ ذُو الْفَضْلِ الْعَظِيمِ",
    arti: "Dan Allah mempunyai karunia yang besar.",
    sumber: "QS. Al-Baqarah: 105"
  },
  24: {
    ayat: "وَاللَّهُ غَنِيٌّ حَمِيدٌ",
    arti: "Dan Allah Maha Kaya lagi Maha Terpuji.",
    sumber: "QS. Al-Baqarah: 267"
  },
  25: {
    ayat: "إِنَّ اللَّهَ كَانَ عَلِيًّا كَبِيرًا",
    arti: "Sesungguhnya Allah Maha Tinggi lagi Maha Besar.",
    sumber: "QS. An-Nisa: 34"
  },
  26: {
    ayat: "إِنَّ اللَّهَ كَانَ حَفِيظًا",
    arti: "Sesungguhnya Allah Maha Menjaga.",
    sumber: "QS. An-Nisa: 1"
  },
  27: {
    ayat: "إِنَّ اللَّهَ كَانَ قَوِيًّا عَزِيزًا",
    arti: "Sesungguhnya Allah Maha Kuat lagi Maha Perkasa.",
    sumber: "QS. An-Nisa: 56"
  },
  28: {
    ayat: "إِنَّ اللَّهَ كَانَ عَلِيمًا حَكِيمًا",
    arti: "Sesungguhnya Allah Maha Mengetahui lagi Maha Bijaksana.",
    sumber: "QS. An-Nisa: 17"
  },
  29: {
    ayat: "إِنَّ اللَّهَ كَانَ خَبِيرًا بَصِيرًا",
    arti: "Sesungguhnya Allah Maha Mengetahui lagi Maha Melihat.",
    sumber: "QS. Al-Isra: 30"
  },
  30: {
    ayat: "إِنَّ اللَّهَ كَانَ عَفُوًّا غَفُورًا",
    arti: "Sesungguhnya Allah Maha Pemaaf lagi Maha Pengampun.",
    sumber: "QS. An-Nisa: 43"
  },
  31: {
    ayat: "وَكَانَ اللَّهُ سَمِيعًا بَصِيرًا",
    arti: "Dan Allah Maha Mendengar lagi Maha Melihat.",
    sumber: "QS. An-Nisa: 134"
  },
  32: {
    ayat: "إِنَّ اللَّهَ كَانَ رَءُوفًا رَحِيمًا",
    arti: "Sesungguhnya Allah Maha Penyantun lagi Maha Penyayang.",
    sumber: "QS. Al-Hajj: 65"
  },
  33: {
    ayat: "إِنَّ اللَّهَ لَقَوِيٌّ عَزِيزٌ",
    arti: "Sesungguhnya Allah Maha Kuat lagi Maha Perkasa.",
    sumber: "QS. Al-Hajj: 74"
  },
  34: {
    ayat: "إِنَّ رَبَّكَ فَعَّالٌ لِمَا يُرِيدُ",
    arti: "Sesungguhnya Tuhanmu Maha Melakukan apa yang Dia kehendaki.",
    sumber: "QS. Hud: 107"
  },
  35: {
    ayat: "إِنَّ اللَّهَ هُوَ الْوَهَّابُ",
    arti: "Sesungguhnya Allah Dialah Maha Pemberi.",
    sumber: "QS. Shad: 9"
  },
  36: {
    ayat: "إِنَّ اللَّهَ كَانَ شَكُورًا حَلِيمًا",
    arti: "Sesungguhnya Allah Maha Mensyukuri lagi Maha Penyantun.",
    sumber: "QS. At-Taghabun: 17"
  },
  37: {
    ayat: "إِنَّ اللَّهَ كَانَ لَطِيفًا خَبِيرًا",
    arti: "Sesungguhnya Allah Maha Lembut lagi Maha Mengetahui.",
    sumber: "QS. Al-Ahzab: 34"
  },
  38: {
    ayat: "إِنَّ اللَّهَ كَانَ تَوَّابًا حَكِيمًا",
    arti: "Sesungguhnya Allah Maha Penerima Taubat lagi Maha Bijaksana.",
    sumber: "QS. An-Nisa: 26"
  },
  39: {
    ayat: "إِنَّ اللَّهَ كَانَ عَلِيمًا قَدِيرًا",
    arti: "Sesungguhnya Allah Maha Mengetahui lagi Maha Kuasa.",
    sumber: "QS. An-Nisa: 17"
  },
  40: {
    ayat: "إِنَّ اللَّهَ كَانَ غَفُورًا وَدُودًا",
    arti: "Sesungguhnya Allah Maha Pengampun lagi Maha Mencintai.",
    sumber: "QS. Al-Buruj: 14"
  },
  41: {
    ayat: "إِنَّ اللَّهَ كَانَ عَلِيًّا كَبِيرًا",
    arti: "Sesungguhnya Allah Maha Tinggi lagi Maha Besar.",
    sumber: "QS. An-Nisa: 34"
  },
  42: {
    ayat: "وَكَانَ اللَّهُ عَزِيزًا حَكِيمًا",
    arti: "Dan Allah Maha Perkasa lagi Maha Bijaksana.",
    sumber: "QS. An-Nisa: 158"
  },
  43: {
    ayat: "إِنَّ اللَّهَ كَانَ سَمِيعًا بَصِيرًا",
    arti: "Sesungguhnya Allah Maha Mendengar lagi Maha Melihat.",
    sumber: "QS. An-Nisa: 58"
  },
  44: {
    ayat: "إِنَّ اللَّهَ كَانَ عَلِيمًا خَبِيرًا",
    arti: "Sesungguhnya Allah Maha Mengetahui lagi Maha Teliti.",
    sumber: "QS. Al-Hujurat: 13"
  },
  45: {
    ayat: "إِنَّ اللَّهَ كَانَ رَقِيبًا",
    arti: "Sesungguhnya Allah Maha Mengawasi.",
    sumber: "QS. An-Nisa: 1"
  },
  46: {
    ayat: "إِنَّ اللَّهَ كَانَ حَسِيبًا",
    arti: "Sesungguhnya Allah Maha Menghitung.",
    sumber: "QS. An-Nisa: 6"
  },
  47: {
    ayat: "إِنَّ اللَّهَ كَانَ لَطِيفًا خَبِيرًا",
    arti: "Sesungguhnya Allah Maha Lembut lagi Maha Mengetahui.",
    sumber: "QS. Al-Hajj: 63"
  },
  48: {
    ayat: "إِنَّ اللَّهَ كَانَ غَفُورًا رَحِيمًا",
    arti: "Sesungguhnya Allah Maha Pengampun lagi Maha Penyayang.",
    sumber: "QS. An-Nisa: 96"
  },
  49: {
    ayat: "إِنَّ اللَّهَ كَانَ عَزِيزًا حَكِيمًا",
    arti: "Sesungguhnya Allah Maha Perkasa lagi Maha Bijaksana.",
    sumber: "QS. Al-Ma'idah: 38"
  },
  50: {
    ayat: "إِنَّ اللَّهَ كَانَ قَوِيًّا شَدِيدَ الْعِقَابِ",
    arti: "Sesungguhnya Allah Maha Kuat lagi sangat keras siksaan-Nya.",
    sumber: "QS. Al-Anfal: 52"
  },
  51: {
    ayat: "إِنَّ اللَّهَ هُوَ الرَّزَّاقُ ذُو الْقُوَّةِ الْمَتِينُ",
    arti: "Sesungguhnya Allah Dialah Maha Pemberi rezeki, Yang Mempunyai Kekuatan lagi Sangat Kokoh.",
    sumber: "QS. Adz-Dzariyat: 58"
  },
  52: {
    ayat: "إِنَّ اللَّهَ كَانَ فَتَّاحًا عَلِيمًا",
    arti: "Sesungguhnya Allah Maha Pemberi keputusan lagi Maha Mengetahui.",
    sumber: "QS. Saba: 26"
  },
  53: {
    ayat: "إِنَّ اللَّهَ كَانَ عَلِيمًا حَلِيمًا",
    arti: "Sesungguhnya Allah Maha Mengetahui lagi Maha Penyantun.",
    sumber: "QS. Al-Ahzab: 51"
  },
  54: {
    ayat: "إِنَّ اللَّهَ كَانَ غَنِيًّا حَمِيدًا",
    arti: "Sesungguhnya Allah Maha Kaya lagi Maha Terpuji.",
    sumber: "QS. Luqman: 26"
  },
  55: {
    ayat: "إِنَّ اللَّهَ كَانَ عَفُوًّا قَدِيرًا",
    arti: "Sesungguhnya Allah Maha Pemaaf lagi Maha Kuasa.",
    sumber: "QS. An-Nisa: 149"
  },
  56: {
    ayat: "إِنَّ اللَّهَ كَانَ تَوَّابًا رَحِيمًا",
    arti: "Sesungguhnya Allah Maha Penerima Taubat lagi Maha Penyayang.",
    sumber: "QS. An-Nisa: 16"
  },
  57: {
    ayat: "إِنَّ اللَّهَ كَانَ عَلِيمًا حَكِيمًا",
    arti: "Sesungguhnya Allah Maha Mengetahui lagi Maha Bijaksana.",
    sumber: "QS. At-Taubah: 28"
  },
  58: {
    ayat: "إِنَّ اللَّهَ كَانَ شَهِيدًا",
    arti: "Sesungguhnya Allah Maha Menyaksikan.",
    sumber: "QS. An-Nisa: 33"
  },
  59: {
    ayat: "إِنَّ اللَّهَ كَانَ وَلِيًّا حَمِيدًا",
    arti: "Sesungguhnya Allah Maha Pelindung lagi Maha Terpuji.",
    sumber: "QS. Asy-Syura: 28"
  },
  60: {
    ayat: "إِنَّ اللَّهَ كَانَ عَلِيًّا كَبِيرًا",
    arti: "Sesungguhnya Allah Maha Tinggi lagi Maha Besar.",
    sumber: "QS. Al-Hajj: 62"
  },
  61: {
    ayat: "وَهُوَ الْقَاهِرُ فَوْقَ عِبَادِهِ",
    arti: "Dan Dialah Yang Maha Mengalahkan di atas hamba-hamba-Nya.",
    sumber: "QS. Al-An'am: 18"
  },
  62: {
    ayat: "اللَّهُ لَطِيفٌ بِعِبَادِهِ",
    arti: "Allah Maha Lembut terhadap hamba-hamba-Nya.",
    sumber: "QS. Asy-Syura: 19"
  },
  63: {
    ayat: "إِنَّ اللَّهَ هُوَ الْعَلِيُّ الْكَبِيرُ",
    arti: "Sesungguhnya Allah Maha Tinggi lagi Maha Besar.",
    sumber: "QS. Luqman: 30"
  },
  64: {
    ayat: "إِنَّ اللَّهَ كَانَ غَفُورًا وَدُودًا",
    arti: "Sesungguhnya Allah Maha Pengampun lagi Maha Pencinta.",
    sumber: "QS. Al-Buruj: 14"
  },
  65: {
    ayat: "ذُو الْعَرْشِ الْمَجِيدُ",
    arti: "Yang mempunyai 'Arsy, lagi Maha Mulia.",
    sumber: "QS. Al-Buruj: 15"
  },
  66: {
    ayat: "فَعَّالٌ لِمَا يُرِيدُ",
    arti: "Maha Kuasa berbuat apa yang Dia kehendaki.",
    sumber: "QS. Al-Buruj: 16"
  },
  67: {
    ayat: "إِنَّ اللَّهَ كَانَ رَءُوفًا رَحِيمًا",
    arti: "Sesungguhnya Allah Maha Penyantun lagi Maha Penyayang.",
    sumber: "QS. Al-Hadid: 9"
  },
  68: {
    ayat: "إِنَّ اللَّهَ كَانَ حَفِيظًا",
    arti: "Sesungguhnya Allah Maha Memelihara.",
    sumber: "QS. Saba: 21"
  },
  69: {
    ayat: "إِنَّ رَبَّكَ لَبِالْمِرْصَادِ",
    arti: "Sesungguhnya Tuhanmu benar-benar mengawasi.",
    sumber: "QS. Al-Fajr: 14"
  },
  70: {
    ayat: "إِنَّ اللَّهَ كَانَ شَكُورًا حَلِيمًا",
    arti: "Sesungguhnya Allah Maha Mensyukuri lagi Maha Penyantun.",
    sumber: "QS. At-Taghabun: 17"
  },
  71: {
    ayat: "وَكَفَىٰ بِاللَّهِ وَكِيلًا",
    arti: "Dan cukuplah Allah sebagai Pelindung.",
    sumber: "QS. An-Nisa: 81"
  },
  72: {
    ayat: "وَكَفَىٰ بِاللَّهِ شَهِيدًا",
    arti: "Dan cukuplah Allah sebagai Saksi.",
    sumber: "QS. An-Nisa: 79"
  },
  73: {
    ayat: "إِنَّ اللَّهَ كَانَ قَوِيًّا عَزِيزًا",
    arti: "Sesungguhnya Allah Maha Kuat lagi Maha Perkasa.",
    sumber: "QS. Al-Hajj: 40"
  },
  74: {
    ayat: "إِنَّ اللَّهَ كَانَ عَلِيمًا حَكِيمًا",
    arti: "Sesungguhnya Allah Maha Mengetahui lagi Maha Bijaksana.",
    sumber: "QS. Al-Fath: 4"
  },
  75: {
    ayat: "وَاللَّهُ غَالِبٌ عَلَىٰ أَمْرِهِ",
    arti: "Dan Allah berkuasa penuh atas urusan-Nya.",
    sumber: "QS. Yusuf: 21"
  },
  76: {
    ayat: "إِنَّ اللَّهَ كَانَ عَلِيًّا حَكِيمًا",
    arti: "Sesungguhnya Allah Maha Tinggi lagi Maha Bijaksana.",
    sumber: "QS. An-Nisa: 34"
  },
  77: {
    ayat: "إِنَّ اللَّهَ كَانَ سَرِيعَ الْحِسَابِ",
    arti: "Sesungguhnya Allah Maha Cepat perhitungan-Nya.",
    sumber: "QS. Ibrahim: 51"
  },
  78: {
    ayat: "وَاللَّهُ خَيْرُ الرَّازِقِينَ",
    arti: "Dan Allah adalah sebaik-baik Pemberi rezeki.",
    sumber: "QS. Al-Jumu'ah: 11"
  },
  79: {
    ayat: "إِنَّ اللَّهَ كَانَ عَلِيمًا قَدِيرًا",
    arti: "Sesungguhnya Allah Maha Mengetahui lagi Maha Kuasa.",
    sumber: "QS. Al-Fath: 21"
  },
  80: {
    ayat: "إِنَّ اللَّهَ كَانَ تَوَّابًا حَكِيمًا",
    arti: "Sesungguhnya Allah Maha Penerima taubat lagi Maha Bijaksana.",
    sumber: "QS. An-Nur: 10"
  },
  81: {
    ayat: "إِنَّ اللَّهَ كَانَ سَمِيعًا عَلِيمًا",
    arti: "Sesungguhnya Allah Maha Mendengar lagi Maha Mengetahui.",
    sumber: "QS. Al-Baqarah: 256"
  },
  82: {
    ayat: "إِنَّ اللَّهَ كَانَ غَفُورًا حَلِيمًا",
    arti: "Sesungguhnya Allah Maha Pengampun lagi Maha Penyantun.",
    sumber: "QS. An-Nisa: 12"
  },
  83: {
    ayat: "إِنَّ اللَّهَ كَانَ رَحِيمًا",
    arti: "Sesungguhnya Allah Maha Penyayang.",
    sumber: "QS. Al-Baqarah: 37"
  },
  84: {
    ayat: "إِنَّ اللَّهَ كَانَ عَلِيمًا خَبِيرًا",
    arti: "Sesungguhnya Allah Maha Mengetahui lagi Maha Teliti.",
    sumber: "QS. Al-Hujurat: 13"
  },
  85: {
    ayat: "وَاللَّهُ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    arti: "Dan Allah Maha Kuasa atas segala sesuatu.",
    sumber: "QS. Al-Baqarah: 20"
  },
  86: {
    ayat: "وَاللَّهُ أَعْلَمُ بِمَا تَعْمَلُونَ",
    arti: "Dan Allah Maha Mengetahui apa yang kamu kerjakan.",
    sumber: "QS. Al-Baqarah: 237"
  },
  87: {
    ayat: "إِنَّ اللَّهَ كَانَ لَطِيفًا خَبِيرًا",
    arti: "Sesungguhnya Allah Maha Lembut lagi Maha Mengetahui.",
    sumber: "QS. Al-Ahzab: 34"
  },
  88: {
    ayat: "إِنَّ اللَّهَ كَانَ عَلِيًّا كَبِيرًا",
    arti: "Sesungguhnya Allah Maha Tinggi lagi Maha Besar.",
    sumber: "QS. Al-Hajj: 62"
  },
  89: {
    ayat: "إِنَّ اللَّهَ كَانَ حَكِيمًا عَلِيمًا",
    arti: "Sesungguhnya Allah Maha Bijaksana lagi Maha Mengetahui.",
    sumber: "QS. Al-Anfal: 67"
  },
  90: {
    ayat: "وَاللَّهُ سَمِيعٌ بَصِيرٌ",
    arti: "Dan Allah Maha Mendengar lagi Maha Melihat.",
    sumber: "QS. Al-Hajj: 61"
  },
  91: {
    ayat: "إِنَّ اللَّهَ كَانَ غَفُورًا رَحِيمًا",
    arti: "Sesungguhnya Allah Maha Pengampun lagi Maha Penyayang.",
    sumber: "QS. Al-Fath: 14"
  },
  92: {
    ayat: "إِنَّ اللَّهَ كَانَ قَرِيبًا مُجِيبًا",
    arti: "Sesungguhnya Allah Maha Dekat lagi Maha Mengabulkan.",
    sumber: "QS. Hud: 61"
  },
  93: {
    ayat: "إِنَّ اللَّهَ كَانَ شَدِيدَ الْعِقَابِ",
    arti: "Sesungguhnya Allah sangat keras siksa-Nya.",
    sumber: "QS. Ali Imran: 11"
  },
  94: {
    ayat: "وَاللَّهُ خَيْرُ الْحَافِظِينَ",
    arti: "Dan Allah adalah sebaik-baik Penjaga.",
    sumber: "QS. Yusuf: 64"
  },
  95: {
    ayat: "وَهُوَ أَرْحَمُ الرَّاحِمِينَ",
    arti: "Dan Dia Maha Penyayang di antara para penyayang.",
    sumber: "QS. Yusuf: 92"
  },
  96: {
    ayat: "إِنَّ اللَّهَ كَانَ عَزِيزًا ذَا انْتِقَامٍ",
    arti: "Sesungguhnya Allah Maha Perkasa lagi mempunyai balasan siksa.",
    sumber: "QS. Ali Imran: 4"
  },
  97: {
    ayat: "إِنَّ اللَّهَ كَانَ عَلِيمًا قَدِيرًا",
    arti: "Sesungguhnya Allah Maha Mengetahui lagi Maha Kuasa.",
    sumber: "QS. Al-Ahzab: 40"
  },
  98: {
    ayat: "وَاللَّهُ غَفُورٌ رَحِيمٌ",
    arti: "Dan Allah Maha Pengampun lagi Maha Penyayang.",
    sumber: "QS. Al-Baqarah: 173"
  },
  99: {
    ayat: "تَبَارَكَ اسْمُ رَبِّكَ ذِي الْجَلَالِ وَالْإِكْرَامِ",
    arti: "Maha Agung nama Tuhanmu yang mempunyai kebesaran dan kemuliaan.",
    sumber: "QS. Ar-Rahman: 78"
  }
}

module.exports = {
  name: "asmaul",
  command: ["asmaul", "asmaulhusna"],
  tags: ["islam"],
  limit: false,

  async handler({ m, args }) {
    const { data } = await axios.get(
      "https://koncodoa.vercel.app/data/asmaulhusna/asmaulhusna.json"
    )

    let item

    if (!args.length || args[0] === "husna") {
      item = data[Math.floor(Math.random() * data.length)]
    } else if (!isNaN(args[0])) {
      item = data.find(v => v.number === Number(args[0]))
    } else if (args[0] === "husna" && !isNaN(args[1])) {
      item = data.find(v => v.number === Number(args[1]))
    }

    if (!item) return m.reply("Asmaul Husna tidak ditemukan")

    const ayat = ayatAsmaul[item.number]

    let teks =
      `📿 *${item.latin}*\n\n` +
      `🕌 *Arab:*\n${item.arabic}\n\n` +
      `📖 *Arti (ID):*\n${item.id_translation}\n\n` +
      `🌍 *English:*\n${item.en_translation}`

    if (ayat) {
      teks +=
        `\n\n📜 *Ayat Terkait:*\n${ayat.ayat}\n\n` +
        `📝 *Makna Ayat:*\n${ayat.arti}\n` +
        `📚 *${ayat.sumber}*`
    }

    m.reply(teks)
  }
  }
