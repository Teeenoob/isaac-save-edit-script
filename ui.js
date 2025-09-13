// Simple tab logic
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.tab').forEach(tab => tab.hidden = true);
    document.querySelector('.tab.' + btn.dataset.tab).hidden = false;
  };
});

// File open/save logic
const fileInput = document.getElementById('fileInput');
const saveBtn = document.getElementById('saveBtn');
let rawSaveData = null;

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const arrayBuffer = await file.arrayBuffer();
  rawSaveData = new Uint8Array(arrayBuffer);
  IsaacSave.load(rawSaveData);
  saveBtn.disabled = false;
});

saveBtn.addEventListener('click', () => {
  if (!rawSaveData) return;
  IsaacSave.updateFromUI();
  const blob = new Blob([IsaacSave.save()], { type: 'application/octet-stream' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'persistentgamedata1.dat';
  a.click();
});

// UI hooks for Misc fields
['winStreak', 'edenTokens', 'donationMachine', 'greedMachine'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    IsaacSave.updateFromUI();
  });
});