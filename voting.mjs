import inquirer from 'inquirer';

const pollings = new Map(); // Menyimpan polling dalam memori

// Fungsi untuk membuat polling baru
// 1. API: Penggunaan 'inquirer' untuk mendapatkan input dari pengguna
async function buatPolling() {
  const { title, options, contributor } = await inquirer.prompt([
    { name: 'title', message: 'Judul Polling:' },
    { name: 'options', message: 'Opsi pilihan (pisahkan dengan koma):' },
    { name: 'contributor', message: 'Siapa yang membuat polling ini?' } // Nama pembuat polling
  ]);

  const polling = {
    contributor,  // Nama pengkontribusi sebagai pengganti ID
    title,
    options: options.split(',').map(o => o.trim()),
    votes: new Map(),
    isClosed: false,
  };

  pollings.set(contributor, polling);  // Menggunakan nama contributor sebagai key
  console.log(`✅ Polling berhasil dibuat oleh ${contributor}!\n`);
}

// Fungsi untuk ikut voting
// 2. API: Penggunaan 'inquirer' untuk mendapatkan input dari pengguna
async function ikutVoting() {
  if (pollings.size === 0) return console.log('❌ Belum ada polling.\n');

  console.log('\n📋 Daftar Polling:');
  for (const [contributor, poll] of pollings) {
    if (!poll.isClosed) {
      console.log(`🗳️ Dibuat oleh: ${contributor} | Judul: ${poll.title}`);
    }
  }

  const { contributor } = await inquirer.prompt([
    { name: 'contributor', message: 'Masukkan nama pembuat polling yang ingin diikuti:' }
  ]);

  const polling = pollings.get(contributor);
  if (!polling || polling.isClosed) return console.log('❌ Polling tidak valid.');

  const { name } = await inquirer.prompt([
    { name: 'name', message: 'Masukkan nama Anda:' }
  ]);

  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: `Pilih opsi untuk "${polling.title}":`,
      choices: polling.options
    }
  ]);

  polling.votes.set(name, choice);
  console.log('✅ Voting berhasil disimpan!\n');
}

// Fungsi untuk melihat hasil voting
// 3. Table Driven Construction: Menyimpan polling dalam Map (tabel) yang menghubungkan contributor dengan polling mereka
function lihatHasil() {
  if (pollings.size === 0) return console.log('❌ Belum ada polling.\n');

  for (const poll of pollings.values()) {
    console.log(`\n📊 Hasil: ${poll.title}`);
    const hasil = {};
    poll.options.forEach(opt => hasil[opt] = 0);

    for (const vote of poll.votes.values()) {
      hasil[vote]++;
    }

    for (const [opt, count] of Object.entries(hasil)) {
      console.log(`🔹 ${opt}: ${count} suara`);
    }
  }
  console.log('');
}

// Fungsi untuk melihat statistik voting
// 4. Table Driven Construction: Menyimpan polling dalam Map (tabel) yang menghubungkan contributor dengan polling mereka
function statistikVoting() {
  if (pollings.size === 0) return console.log('❌ Belum ada polling.\n');

  for (const poll of pollings.values()) {
    console.log(`\n📈 Statistik: ${poll.title}`);
    const hasil = {};
    poll.options.forEach(opt => hasil[opt] = 0);

    for (const vote of poll.votes.values()) {
      hasil[vote]++;
    }

    const totalVotes = poll.votes.size;
    for (const [opt, count] of Object.entries(hasil)) {
      const persen = ((count / totalVotes) * 100).toFixed(2);
      console.log(`🔸 ${opt}: ${count} suara (${persen}%)`);
    }
  }
  console.log('');
}

// Fungsi untuk mengedit polling
// 5. Code Reuse/Library: Menggunakan kembali fungsi 'inquirer' untuk mengumpulkan input yang dibutuhkan
async function editPolling() {
  const aktif = [...pollings.values()].filter(p => !p.isClosed);
  if (aktif.length === 0) return console.log('❌ Tidak ada polling yang bisa diedit.\n');

  console.log('\n✏️ Polling Aktif:');
  aktif.forEach(p => console.log(`Dibuat oleh: ${p.contributor} | ${p.title}`));

  const { contributor } = await inquirer.prompt([
    { name: 'contributor', message: 'Masukkan nama pembuat polling yang ingin diedit:' }
  ]);

  const poll = pollings.get(contributor);
  if (!poll || poll.isClosed) return console.log('❌ Tidak dapat mengedit polling ini.\n');

  const { newTitle, newOptions } = await inquirer.prompt([
    { name: 'newTitle', message: 'Judul baru:' },
    { name: 'newOptions', message: 'Opsi baru (pisahkan dengan koma):' }
  ]);

  poll.title = newTitle;
  poll.options = newOptions.split(',').map(o => o.trim());
  poll.votes.clear(); // reset voting karena opsi berubah

  console.log('✅ Polling berhasil diedit.\n');
}

// Fungsi untuk menghapus polling
// 6. Runtime Configuration: Pengguna dapat menghapus polling saat aplikasi berjalan
async function hapusPolling() {
  if (pollings.size === 0) return console.log('❌ Tidak ada polling untuk dihapus.\n');

  const { contributor } = await inquirer.prompt([
    { name: 'contributor', message: 'Masukkan nama pembuat polling yang ingin dihapus:' }
  ]);

  if (pollings.has(contributor)) {
    pollings.delete(contributor);
    console.log('🗑️ Polling berhasil dihapus.\n');
  } else {
    console.log('❌ Polling tidak ditemukan.\n');
  }
}

// Fungsi utama untuk menu
// 7. Automata: Pengelolaan alur interaksi berbasis pilihan (state machine)
async function main() {
  while (true) {
    const { menu } = await inquirer.prompt([
      {
        type: 'list',
        name: 'menu',
        message: '🗳️ MENU UTAMA:',
        choices: [
          'Buat Polling', 'Ikut Voting', 'Lihat Hasil',
          'Statistik Voting', 'Edit Polling', 'Hapus Polling',
          'Keluar'
        ]
      }
    ]);

    // Berdasarkan pilihan pengguna, program bertransisi ke bagian yang sesuai
    if (menu === 'Buat Polling') await buatPolling();
    else if (menu === 'Ikut Voting') await ikutVoting();
    else if (menu === 'Lihat Hasil') lihatHasil();
    else if (menu === 'Statistik Voting') statistikVoting();
    else if (menu === 'Edit Polling') await editPolling();
    else if (menu === 'Hapus Polling') await hapusPolling();
    else break;
  }
}

main();
