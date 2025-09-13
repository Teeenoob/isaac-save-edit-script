// Tab logic
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.tab').forEach(tab => tab.hidden = true);
    document.querySelector('.tab.' + btn.dataset.tab).hidden = false;
  };
});

// File open/save
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

// Misc UI hooks
['winStreak', 'edenTokens', 'donationMachine', 'greedMachine'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => IsaacSave.updateFromUI());
});

// Completion marks UI
document.getElementById('unlockAllCompletion').onclick = () => {
  IsaacSave.unlockAllCompletion();
  IsaacSave.populateCompletionUI();
};
document.getElementById('completionChar').onchange = () => IsaacSave.populateCompletionUI();
document.getElementById('completionMarksArea').onchange = (e) => IsaacSave.updateFromUI();

// Secrets UI
document.getElementById('unlockAllSecrets').onclick = () => {
  IsaacSave.unlockAllSecrets();
  IsaacSave.populateSecretsUI();
};
document.getElementById('secretsArea').onchange = (e) => IsaacSave.updateFromUI();

// Items UI
document.getElementById('unlockAllItems').onclick = () => {
  IsaacSave.unlockAllItems();
  IsaacSave.populateItemsUI();
};
document.getElementById('itemsArea').onchange = (e) => IsaacSave.updateFromUI();

// Challenges UI
document.getElementById('unlockAllChallenges').onclick = () => {
  IsaacSave.unlockAllChallenges();
  IsaacSave.populateChallengesUI();
};
document.getElementById('challengesArea').onchange = (e) => IsaacSave.updateFromUI();