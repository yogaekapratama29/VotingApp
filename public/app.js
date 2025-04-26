async function createPolling() {
    const contributor = document.getElementById('contributor').value;
    const title = document.getElementById('title').value;
    const options = document.getElementById('options').value.split(',').map(o => o.trim());
  
    await fetch('/pollings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contributor, title, options })
    });
  
    loadPollings();
  }
  
  async function loadPollings() {
    const res = await fetch('/pollings');
    const pollings = await res.json();
    const container = document.getElementById('pollings');
    container.innerHTML = '';
  
    pollings.forEach(poll => {
      const div = document.createElement('div');
      div.innerHTML = `
        <h3>${poll.title}</h3>
        <p>Dibuat oleh: ${poll.contributor}</p>
        <select id="choice-${poll.contributor}">
          ${poll.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
        </select>
        <input type="text" id="voter-${poll.contributor}" placeholder="Nama Anda">
        <button onclick="vote('${poll.contributor}')">Vote</button>
        <button onclick="showResults('${poll.contributor}')">Lihat Hasil</button>
        <div id="result-${poll.contributor}"></div>
        <hr>
      `;
      container.appendChild(div);
    });
  }
  
  async function vote(contributor) {
    const voterName = document.getElementById(`voter-${contributor}`).value;
    const choice = document.getElementById(`choice-${contributor}`).value;
  
    await fetch(`/pollings/${contributor}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voterName, choice })
    });
  
    alert('Vote berhasil!');
  }
  
  async function showResults(contributor) {
    const res = await fetch(`/pollings/${contributor}/results`);
    const results = await res.json();
    const container = document.getElementById(`result-${contributor}`);
    container.innerHTML = '';
  
    for (const [option, count] of Object.entries(results)) {
      container.innerHTML += `<p>${option}: ${count} suara</p>`;
    }
  }
  
  loadPollings();
  