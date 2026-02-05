/* Semoga kita semua dalam perlindungan Allah 
-Muhammad Akbar */
const sholatData = {
  urutan: [
    "Niat",
    "Takbiratul Ihram",
    "Doa Iftitah",
    "Berdiri Membaca Al-Fatihah",
    "Membaca Surat Pendek",
    "Rukuk",
    "I'tidal",
    "Sujud Pertama",
    "Duduk di Antara Dua Sujud",
    "Sujud Kedua",
    "Berdiri Rakaat Berikutnya",
    "Tahiyat Awal",
    "Tahiyat Akhir",
    "Salam"
  ],
niat: {
  subuh: {
    judul: "Niat Sholat Subuh",
    arab: "أُصَلِّي فَرْضَ الصُّبْحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى",
    latin: "Ushallī farḍaṣ-ṣubḥi rak‘ataini mustaqbilal-qiblati adā’an lillāhi ta‘ālā",
    arti: "Aku niat sholat fardhu Subuh dua rakaat menghadap kiblat karena Allah Ta‘ala"
  },

  dzuhur: {
    judul: "Niat Sholat Dzuhur",
    arab: "أُصَلِّي فَرْضَ الظُّهْرِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى",
    latin: "Ushallī farḍaẓ-ẓuhrī arba‘a rak‘ātin mustaqbilal-qiblati adā’an lillāhi ta‘ālā",
    arti: "Aku niat sholat fardhu Dzuhur empat rakaat menghadap kiblat karena Allah Ta‘ala"
  },

  ashar: {
    judul: "Niat Sholat Ashar",
    arab: "أُصَلِّي فَرْضَ الْعَصْرِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى",
    latin: "Ushallī farḍal-‘aṣri arba‘a rak‘ātin mustaqbilal-qiblati adā’an lillāhi ta‘ālā",
    arti: "Aku niat sholat fardhu Ashar empat rakaat menghadap kiblat karena Allah Ta‘ala"
  },

  maghrib: {
    judul: "Niat Sholat Maghrib",
    arab: "أُصَلِّي فَرْضَ الْمَغْرِبِ ثَلَاثَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى",
    latin: "Ushallī farḍal-maghribi ṡalāṡa rak‘ātin mustaqbilal-qiblati adā’an lillāhi ta‘ālā",
    arti: "Aku niat sholat fardhu Maghrib tiga rakaat menghadap kiblat karena Allah Ta‘ala"
  },

  isya: {
    judul: "Niat Sholat Isya",
    arab: "أُصَلِّي فَرْضَ الْعِشَاءِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى",
    latin: "Ushallī farḍal-‘isyā’i arba‘a rak‘ātin mustaqbilal-qiblati adā’an lillāhi ta‘ālā",
    arti: "Aku niat sholat fardhu Isya empat rakaat menghadap kiblat karena Allah Ta‘ala"
  },

  jumat: {
    judul: "Niat Sholat Jumat",
    arab: "أُصَلِّي فَرْضَ الْجُمُعَةِ رَكْعَتَيْنِ إِمَامًا/مَأْمُومًا مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى",
    latin: "Ushallī farḍal-jumu‘ati rak‘ataini imāman/ma’mūman mustaqbilal-qiblati adā’an lillāhi ta‘ālā",
    arti: "Aku niat sholat Jumat dua rakaat sebagai imam/makmum karena Allah Ta‘ala"
  },

  sunnahRawatib: {
    judul: "Niat Sholat Sunnah Rawatib",
    arab: "أُصَلِّي سُنَّةَ الصَّلَاةِ رَكْعَتَيْنِ لِلَّهِ تَعَالَى",
    latin: "Ushallī sunnataṣ-ṣalāti rak‘ataini lillāhi ta‘ālā",
    arti: "Aku niat sholat sunnah dua rakaat karena Allah Ta‘ala"
  },

  witir: {
    judul: "Niat Sholat Witir",
    arab: "أُصَلِّي سُنَّةَ الْوِتْرِ رَكْعَةً لِلَّهِ تَعَالَى",
    latin: "Ushallī sunnatal-witri rak‘atan lillāhi ta‘ālā",
    arti: "Aku niat sholat sunnah witir satu rakaat karena Allah Ta‘ala"
  },

  tahajud: {
    judul: "Niat Sholat Tahajud",
    arab: "أُصَلِّي سُنَّةَ التَّهَجُّدِ رَكْعَتَيْنِ لِلَّهِ تَعَالَى",
    latin: "Ushallī sunnatat-tahajjudi rak‘ataini lillāhi ta‘ālā",
    arti: "Aku niat sholat sunnah tahajud dua rakaat karena Allah Ta‘ala"
  },

  dhuha: {
    judul: "Niat Sholat Dhuha",
    arab: "أُصَلِّي سُنَّةَ الضُّحَىٰ رَكْعَتَيْنِ لِلَّهِ تَعَالَى",
    latin: "Ushallī sunnataḍ-ḍuḥā rak‘ataini lillāhi ta‘ālā",
    arti: "Aku niat sholat sunnah dhuha dua rakaat karena Allah Ta‘ala"
  }
},
takbirPerpindahan: {
  judul: "Takbir Perpindahan",
  arab: "اللَّهُ أَكْبَرُ",
  latin: "Allāhu akbar",
  arti: "Allah Maha Besar",
  keterangan: "Dibaca setiap perpindahan gerakan kecuali saat bangkit dari rukuk"
} ,
dudukIstirahat: {
  judul: "Duduk Istirahat",
  tutorial: {
    posisi: "Duduk sejenak setelah sujud kedua sebelum berdiri",
    keterangan: "Sunnah menurut sebagian ulama, dilakukan dengan singkat"
  }
},

  takbir: {
    judul: "Takbiratul Ihram",
    arab: "اللَّهُ أَكْبَرُ",
    latin: "Allāhu akbar",
    arti: "Allah Maha Besar",
    tutorial: {
      posisi: "Berdiri tegak menghadap kiblat",
      tangan: "Angkat kedua tangan sejajar telinga atau bahu",
      pandangan: "Ke tempat sujud",
      keterangan: "Takbir ini mengharamkan semua perbuatan di luar sholat"
    }
  },

  iftitah: {
    judul: "Doa Iftitah",
    arab: "اللَّهُمَّ بَاعِدْ بَيْنِي وَبَيْنَ خَطَايَايَ كَمَا بَاعَدْتَ بَيْنَ الْمَشْرِقِ وَالْمَغْرِبِ، اللَّهُمَّ نَقِّنِي مِنْ خَطَايَايَ كَمَا يُنَقَّى الثَّوْبُ الْأَبْيَضُ مِنَ الدَّنَسِ، اللَّهُمَّ اغْسِلْنِي مِنْ خَطَايَايَ بِالثَّلْجِ وَالْمَاءِ وَالْبَرَدِ",
    latin: "Allāhumma bā‘id bainī wa baina khaṭāyāya kamā bā‘adta bainal-masyriqi wal-maghrib...",
    arti: "Ya Allah, jauhkanlah aku dari kesalahanku sebagaimana Engkau menjauhkan timur dan barat",
    tutorial: {
      posisi: "Berdiri setelah takbir",
      keterangan: "Sunnah, dibaca sebelum Al-Fatihah"
    }
  },

  berdiri: {
    judul: "Membaca Al-Fatihah",
    arab: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    latin: "Al-ḥamdu lillāhi rabbil ‘ālamīn",
    arti: "Segala puji bagi Allah Tuhan seluruh alam",
    tutorial: {
      posisi: "Berdiri tegak",
      tangan: "Bersedekap di dada",
      keterangan: "Wajib membaca Al-Fatihah pada setiap rakaat"
    }
  },

  suratPendek: {
    judul: "Membaca Surat Pendek",
    arab: "قُلْ هُوَ اللَّهُ أَحَدٌ",
    latin: "Qul huwallāhu aḥad",
    arti: "Katakanlah Dialah Allah Yang Maha Esa",
    tutorial: {
      posisi: "Masih berdiri",
      keterangan: "Sunnah membaca surat setelah Al-Fatihah pada dua rakaat pertama"
    }
  },

  rukuk: {
    judul: "Rukuk",
    arab: "سُبْحَانَ رَبِّيَ الْعَظِيمِ وَبِحَمْدِهِ",
    latin: "Subḥāna rabbiyal ‘aẓīmi wa biḥamdih",
    arti: "Maha Suci Tuhanku Yang Maha Agung dan dengan memuji-Nya",
    tutorial: {
      posisi: "Membungkuk hingga punggung rata",
      tangan: "Memegang lutut",
      pandangan: "Ke bawah",
      keterangan: "Tumakninah dan membaca minimal 3 kali"
    }
  },

  itidal: {
    judul: "I'tidal",
    arab: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ رَبَّنَا وَلَكَ الْحَمْدُ",
    latin: "Sami‘allāhu liman ḥamidah rabbana wa lakal-ḥamd",
    arti: "Allah mendengar orang yang memuji-Nya",
    tutorial: {
      posisi: "Berdiri kembali dari rukuk",
      keterangan: "Wajib berdiri tegak dengan tumakninah"
    }
  },

  sujudPertama: {
    judul: "Sujud Pertama",
    arab: "سُبْحَانَ رَبِّيَ الْأَعْلَى وَبِحَمْدِهِ",
    latin: "Subḥāna rabbiyal a‘lā wa biḥamdih",
    arti: "Maha Suci Tuhanku Yang Maha Tinggi",
    tutorial: {
      anggota: "Dahi, hidung, dua tangan, dua lutut, ujung kaki",
      keterangan: "Posisi paling dekat hamba dengan Allah"
    }
  },

  duduk: {
    judul: "Duduk di Antara Dua Sujud",
    arab: "رَبِّ اغْفِرْ لِي وَارْحَمْنِي وَاجْبُرْنِي وَارْفَعْنِي وَارْزُقْنِي وَاهْدِنِي وَعَافِنِي وَاعْفُ عَنِّي",
    latin: "Rabbighfir lī warḥamnī wajburnī warfa‘nī warzuqnī wahdinī wa ‘āfinī wa‘fu ‘annī",
    arti: "Ya Allah, ampunilah aku dan rahmatilah aku",
    tutorial: {
      posisi: "Duduk iftirasy",
      keterangan: "Dibaca dengan tumakninah"
    }
  },

  sujudKedua: {
    judul: "Sujud Kedua",
    arab: "سُبْحَانَ رَبِّيَ الْأَعْلَى وَبِحَمْدِهِ",
    latin: "Subḥāna rabbiyal a‘lā wa biḥamdih",
    arti: "Maha Suci Tuhanku Yang Maha Tinggi",
    tutorial: {
      keterangan: "Sama seperti sujud pertama"
    }
  },

  tahiyatAwal: {
    judul: "Tahiyat Awal",
    arab: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ...",
    latin: "At-taḥiyyātu lillāhi waṣ-ṣalawātu waṭ-ṭayyibāt",
    arti: "Segala penghormatan hanya milik Allah",
    tutorial: {
      posisi: "Duduk iftirasy",
      keterangan: "Sunnah muakkad"
    }
  },

  tahiyatAkhir: {
    judul: "Tahiyat Akhir",
    arab: "اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ",
    latin: "Allāhumma ṣalli ‘alā Muḥammad",
    arti: "Ya Allah limpahkanlah shalawat kepada Nabi Muhammad",
    tutorial: {
      posisi: "Duduk tawarruk",
      keterangan: "Wajib sebelum salam"
    }
  },

  salam: {
    judul: "Salam",
    arab: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
    latin: "Assalāmu ‘alaikum wa raḥmatullāh",
    arti: "Semoga keselamatan dan rahmat Allah tercurah kepada kalian",
    tutorial: {
      gerakan: "Menoleh ke kanan lalu ke kiri",
      keterangan: "Menandai berakhirnya sholat"
    }
  },

  qunut: {
    judul: "Doa Qunut",
    arab: "اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ وَعَافِنِي فِيمَنْ عَافَيْتَ",
    latin: "Allāhummahdinī fīman hadait",
    arti: "Ya Allah, berilah aku petunjuk",
    tutorial: {
      keterangan: "Dibaca pada sholat Subuh rakaat kedua menurut sebagian mazhab"
    }
  }
}

module.exports = {
  name: "sholat",
  command: ["sholat"],
  tags: ["islam"],
  limit: false,

  async handler({ m, args, prefix }) {
    const q = args.join(" ").toLowerCase().trim()

    const keyMap = {
      takbir: "takbir",
      "takbiratul ihram": "takbir",

      rukuk: "rukuk",
      sujud: "sujudPertama",
      "sujud kedua": "sujudKedua",

      iftitah: "iftitah",
      berdiri: "berdiri",

      surat: "suratPendek",
      "surat pendek": "suratPendek",

      "tahiyat awal": "tahiyatAwal",
      "tahiyat akhir": "tahiyatAkhir",

      salam: "salam",
      qunut: "qunut",

      "takbir perpindahan": "takbirPerpindahan",
      "duduk istirahat": "dudukIstirahat"
    }

    if (!q) {
      return m.reply(
        `🕌 *FITUR SHOLAT*\n\n` +
        `📌 *Urutan & Umum*\n` +
        `• ${prefix}sholat urutan\n\n` +
        `📌 *Niat Sholat*\n` +
        `• ${prefix}sholat niat subuh\n` +
        `• ${prefix}sholat niat dzuhur\n` +
        `• ${prefix}sholat niat ashar\n` +
        `• ${prefix}sholat niat maghrib\n` +
        `• ${prefix}sholat niat isya\n` +
        `• ${prefix}sholat niat jumat\n` +
        `• ${prefix}sholat niat dhuha\n` +
        `• ${prefix}sholat niat tahajud\n` +
        `• ${prefix}sholat niat witir\n\n` +
        `📌 *Bacaan & Gerakan*\n` +
        `• ${prefix}sholat takbir\n` +
        `• ${prefix}sholat iftitah\n` +
        `• ${prefix}sholat berdiri\n` +
        `• ${prefix}sholat surat\n` +
        `• ${prefix}sholat rukuk\n` +
        `• ${prefix}sholat itidal\n` +
        `• ${prefix}sholat sujud\n` +
        `• ${prefix}sholat sujud kedua\n` +
        `• ${prefix}sholat duduk istirahat\n` +
        `• ${prefix}sholat tahiyat awal\n` +
        `• ${prefix}sholat tahiyat akhir\n` +
        `• ${prefix}sholat qunut\n` +
        `• ${prefix}sholat salam`
      )
    }

    if (q === "urutan") {
      return m.reply(
        `🧭 *URUTAN SHOLAT*\n\n` +
        sholatData.urutan.map((v, i) => `${i + 1}. ${v}`).join("\n")
      )
    }

    if (q.startsWith("niat")) {
      const jenis = q.split(" ")[1]
      const data = sholatData.niat?.[jenis]

      if (!data) {
        return m.reply("❌ Niat sholat tidak ditemukan")
      }

      return m.reply(
        `🕌 *${data.judul}*\n\n` +
        `📖 Arab:\n${data.arab}\n\n` +
        `🔤 Latin:\n${data.latin}\n\n` +
        `📘 Arti:\n${data.arti}`
      )
    }

    const key = keyMap[q]
    const data = sholatData[key]

    if (!key || !data) {
      return m.reply("❌ Bacaan atau gerakan sholat tidak ditemukan")
    }

    let text =
      `🕌 *${data.judul || "Bacaan Sholat"}*\n\n` +
      `📖 Arab:\n${data.arab || "-"}\n\n` +
      `🔤 Latin:\n${data.latin || "-"}\n\n` +
      `📘 Arti:\n${data.arti || "-"}`

    if (data.tutorial) {
      text += `\n\n📌 *Petunjuk:*\n`
      for (const k in data.tutorial) {
        text += `• ${k}: ${data.tutorial[k]}\n`
      }
    }

    return m.reply(text.trim())
  }
}
