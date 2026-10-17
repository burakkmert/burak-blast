// Every user-facing text lives here, so adding a language only means swapping this object.
// Entries that depend on data are functions.

export const STRINGS = {
  app: {
    nameLead: 'Burak',
    nameAccent: 'Blast',
    tagline: 'Blokları yerleştir, çizgileri patlat.',
    version: (v) => `Sürüm ${v}`,
  },

  common: {
    back: 'Geri',
    yes: 'Evet',
    ok: 'Tamam',
    cancel: 'Vazgeç',
    save: 'Kaydet',
    delete: 'Sil',
    reset: 'Sıfırla',
  },

  topbar: {
    best: 'En iyi skor',
    score: 'SKOR',
  },

  menu: {
    title: 'Menü',
    close: 'Kapat',
    resume: 'Devam Et',
    newGame: 'Yeni Oyun',
    blocks: 'Bloklarım / Kendi Bloğunu Tasarla',
    appearance: 'Blok Görünümü',
    settings: 'Ayarlar',
    howTo: 'Nasıl Oynanır',
    about: 'Hakkında',
    confirmNewGame: 'Mevcut oyun silinecek, emin misin?',
  },

  gameOver: {
    title: 'Oyun Bitti',
    score: 'Skor',
    newRecord: 'Yeni Rekor!',
    best: 'En İyi:',
    playAgain: 'Tekrar Oyna',
  },

  banner: {
    combo: (n) => `Kombo x${n}!`,
    boardClear: (bonus) => `Tahta Temiz! +${bonus}`,
  },

  settings: {
    title: 'Ayarlar',
    volume: 'Ses seviyesi',
    rows: {
      sound: { label: 'Ses', description: 'Oyun sesleri' },
      vibration: { label: 'Titreşim', description: 'Dokunsal geri bildirim' },
      reduceMotion: { label: 'Animasyonları azalt', description: 'Sarsıntı, parçacık ve hareketleri kapatır' },
      fairSpawn: { label: 'Adil parça üretimi', description: 'Yeni parçalardan en az biri her zaman sığar' },
    },
  },

  howTo: {
    title: 'Nasıl Oynanır',
    steps: [
      'Alttaki parçaları sürükleyip tahtaya bırak.',
      'Bir satırı veya sütunu tamamen doldurursan patlar ve puan kazanırsın.',
      'Art arda satır/sütun patlatarak kombo yap; kombo puanı büyütür.',
      'Birden çok çizgiyi aynı anda patlatmak çok daha fazla puan verir.',
      'Parçalar döndürülemez. Hiçbir parça tahtaya sığmayınca oyun biter.',
    ],
  },

  about: {
    title: 'Hakkında',
  },

  rarity: {
    rare: 'Nadir',
    normal: 'Normal',
    frequent: 'Sık',
  },

  blocks: {
    title: 'Bloklarım',
    design: '+ Kendi Bloğunu Tasarla',
    enabledCount: (on, total) => `${on} / ${total} blok açık`,
    restoreDefaults: 'Varsayılanlara Dön',
    on: 'Açık',
    off: 'Kapalı',
    edit: 'Düzenle',
    confirmDelete: (name) => `"${name}" silinsin mi?`,
    confirmRestore: 'Varsayılan blokların açık/kapalı ve sıklık ayarları sıfırlansın mı? Kendi bloklarına dokunulmaz.',
    restored: 'Varsayılanlar geri yüklendi',
    warnings: {
      'no-small-piece': 'Açık parçalar arasında 1-2 hücrelik küçük parça yok. Oyun çok zorlaşabilir.',
    },
    reasons: {
      'not-found': 'Parça bulunamadı.',
      'min-enabled': (min) => `En az ${min} parça açık kalmalı.`,
      'min-enabled-delete': (min) => `Silmeden önce başka bir parçayı aç (en az ${min} parça açık kalmalı).`,
    },
  },

  editor: {
    titleNew: 'Yeni Blok',
    titleEdit: 'Bloğu Düzenle',
    hint: 'Hücrelere dokun veya parmağını sürükle.',
    gridLabel: 'Çizim ızgarası',
    clear: 'Temizle',
    rotate: '90° Döndür',
    flip: 'Yatay Çevir',
    pickColor: 'Renk seç',
    nameLabel: 'İsim (isteğe bağlı)',
    nameAria: 'Blok adı',
    defaultName: (n) => `Bloğum ${n}`,
    frequency: 'Sıklık',
    preview: 'Oyundaki görünümü',
    previewEmpty: 'Önizleme',
    ready: 'Hazır. Kaydedebilirsin.',
    errors: {
      empty: 'En az 1 hücreyi doldurmalısın.',
      disconnected: 'Tüm hücreler birbirine kenardan bağlı olmalı (köşeden değmesi yetmez).',
      duplicate: (name) => `Bu şekil zaten var (${name}).`,
    },
    added: 'Blok eklendi',
    updated: 'Blok güncellendi',
  },

  appearance: {
    title: 'Blok Görünümü',
    themes: {
      jelly: 'Jelibon',
      flat: 'Düz',
      neon: 'Neon',
      pastel: 'Pastel',
      photo: 'Fotoğraf',
    },
    pickPhotoHint: 'Fotoğraf seç',
    photoSection: 'Fotoğraf teması',
    pickPhoto: 'Galeriden Fotoğraf Seç',
    tone: 'Renk tonu',
    removePhoto: 'Fotoğrafı Kaldır',
    photoRemoved: 'Fotoğraf kaldırıldı, Jelibon teması',
  },

  crop: {
    title: 'Fotoğrafı Kırp',
    hint: 'Sürükleyerek konumlandır, iki parmakla veya kaydırıcıyla yakınlaştır.',
    zoom: 'Yakınlaştır',
    apply: 'Uygula',
    applied: 'Fotoğraf uygulandı',
    openFailed: 'Bu fotoğraf açılamadı. Başka bir görsel dene.',
    saveFailed: 'Fotoğraf kaydedilemedi: cihaz depolaması dolu ya da kapalı olabilir.',
  },

  pieces: {
    single: 'Tek Kare',
    'line-h': (size) => `Yatay ${size}'lü`,
    'line-v': (size) => `Dikey ${size}'lü`,
    square: (size) => `${size}x${size} Kare`,
    'big-l': 'Büyük L',
    'small-l': 'Küçük L',
    t: 'T',
    s: 'S',
    z: 'Z',
  },
};

/** Display name of a piece: custom pieces carry their own, built-ins are named by kind. */
export function pieceName(piece) {
  if (piece.custom) return piece.name;
  const base = STRINGS.pieces[piece.kind];
  const name = typeof base === 'function' ? base(piece.size) : base;
  return piece.variant ? `${name} ${piece.variant}` : name;
}
