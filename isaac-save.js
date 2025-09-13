// Isaac save editor logic, full port from script.py (Python)

window.IsaacSave = {
  data: null,
  offsets: [],
  characters: [
    "Isaac", "Maggy", "Cain", "Judas", "???", "Eve", "Samson", "Azazel",
    "Lazarus", "Eden", "The Lost", "Lilith", "Keeper", "Apollyon", "Forgotten", "Bethany",
    "Jacob & Esau", "T Isaac", "T Maggy", "T Cain", "T Judas", "T ???", "T Eve", "T Samson", "T Azazel",
    "T Lazarus", "T Eden", "T Lost", "T Lilith", "T Keeper", "T Apollyon", "T Forgotten", "T Bethany", "T Jacob"
  ],
  checklist_order: [
    "Isaac's Heart", "Isaac", "Satan", "Boss Rush", "Chest", "Dark Room", 
    "Mega Satan", "Hush", "Greed", "Delirium", "Mother", "Beast"
  ],
  _bad_items: [43,59,61,235,587,613,620,630,648,656,662,666,718],

  // UI data mirrors
  completionData: [],
  secretsData: [],
  itemsData: [],
  challengesData: [],
  currentChar: 0,

  load(data) {
    this.data = new Uint8Array(data);
    this.offsets = this.getSectionOffsets(this.data);

    // Misc fields
    document.getElementById('winStreak').value = this.getInt(this.data, this.offsets[1] + 0x4 + 0x54);
    document.getElementById('edenTokens').value = this.getInt(this.data, this.offsets[1] + 0x4 + 0x50);
    document.getElementById('donationMachine').value = this.getInt(this.data, this.offsets[1] + 0x4 + 0x4C);
    document.getElementById('greedMachine').value = this.getInt(this.data, this.offsets[1] + 0x4 + 0x1B0);

    // Completion marks
    let sel = document.getElementById('completionChar');
    sel.innerHTML = "";
    this.characters.forEach((c, i) => {
      let opt = document.createElement('option');
      opt.value = i; opt.textContent = c;
      sel.appendChild(opt);
    });
    this.currentChar = 0;
    sel.value = 0;

    // Fill all UI
    this.populateCompletionUI();
    this.populateSecretsUI();
    this.populateItemsUI();
    this.populateChallengesUI();
  },

  updateFromUI() {
    // Misc
    this.data = this.alterInt(this.data, this.offsets[1] + 0x4 + 0x54, parseInt(document.getElementById('winStreak').value) || 0);
    this.data = this.alterInt(this.data, this.offsets[1] + 0x4 + 0x50, parseInt(document.getElementById('edenTokens').value) || 0);
    this.data = this.alterInt(this.data, this.offsets[1] + 0x4 + 0x4C, parseInt(document.getElementById('donationMachine').value) || 0);
    this.data = this.alterInt(this.data, this.offsets[1] + 0x4 + 0x1B0, parseInt(document.getElementById('greedMachine').value) || 0);

    // Completion marks
    let checked = [];
    document.querySelectorAll('#completionMarksArea input[type=checkbox]').forEach((cb, i) => 
      checked[i] = cb.checked ? 2 : 0
    );
    this.data = this.updateCheckListUnlocks(this.data, this.currentChar, checked);

    // Secrets
    let checkedSecrets = [];
    document.querySelectorAll('#secretsArea input[type=checkbox]').forEach((cb, i) => 
      cb.checked && checkedSecrets.push(i+1)
    );
    this.data = this.updateSecrets(this.data, checkedSecrets);

    // Items
    let checkedItems = [];
    document.querySelectorAll('#itemsArea input[type=checkbox]').forEach((cb, i) => {
      if (!this._bad_items.includes(i+1) && cb.checked) checkedItems.push(i+1);
    });
    this.data = this.updateItems(this.data, checkedItems);

    // Challenges
    let checkedChals = [];
    document.querySelectorAll('#challengesArea input[type=checkbox]').forEach((cb, i) => 
      cb.checked && checkedChals.push(i+1)
    );
    this.data = this.updateChallenges(this.data, checkedChals);
  },

  save() {
    // Save all UI to data
    this.updateFromUI();
    // Update checksum
    this.data = this.updateChecksum(this.data);
    return this.data;
  },

  // ======================== COMPLETION MARKS ========================
  populateCompletionUI() {
    let charIdx = parseInt(document.getElementById('completionChar').value);
    this.currentChar = charIdx;
    let unlocks = this.getChecklistUnlocks(this.data, charIdx);
    let area = document.getElementById('completionMarksArea');
    area.innerHTML = "";
    this.checklist_order.forEach((name, i) => {
      let lbl = document.createElement('label');
      let cb = document.createElement('input');
      cb.type = "checkbox";
      cb.checked = (unlocks[i] === 2);
      cb.onchange = () => this.updateFromUI();
      lbl.appendChild(cb);
      lbl.append(" " + name);
      area.appendChild(lbl);
      area.appendChild(document.createElement('br'));
    });
  },
  unlockAllCompletion() {
    let marks = Array(12).fill(2);
    this.data = this.updateCheckListUnlocks(this.data, this.currentChar, marks);
    this.populateCompletionUI();
  },

  // ======================== SECRETS ========================
  populateSecretsUI() {
    let area = document.getElementById('secretsArea');
    let values = this.getSecrets(this.data);
    area.innerHTML = "";
    for(let i=0; i<641; ++i){
      let lbl = document.createElement('label');
      let cb = document.createElement('input');
      cb.type = "checkbox";
      cb.checked = !!values[i];
      cb.onchange = () => this.updateFromUI();
      lbl.appendChild(cb);
      lbl.append(" " + (i+1));
      area.appendChild(lbl);
      if((i+1)%6==0) area.appendChild(document.createElement('br'));
    }
  },
  unlockAllSecrets() {
    let all = [];
    for(let i=1;i<=641;++i) all.push(i);
    this.data = this.updateSecrets(this.data, all);
    this.populateSecretsUI();
  },

  // ======================== ITEMS ========================
  populateItemsUI() {
    let area = document.getElementById('itemsArea');
    let values = this.getItems(this.data);
    area.innerHTML = "";
    for(let i=0; i<732; ++i){
      if(this._bad_items.includes(i+1)) continue;
      let lbl = document.createElement('label');
      let cb = document.createElement('input');
      cb.type = "checkbox";
      cb.checked = !!values[i];
      cb.onchange = () => this.updateFromUI();
      lbl.appendChild(cb);
      lbl.append(" " + (i+1));
      area.appendChild(lbl);
      if((i+1)%10==0) area.appendChild(document.createElement('br'));
    }
  },
  unlockAllItems() {
    let all = [];
    for(let i=1;i<=732;++i) if(!this._bad_items.includes(i)) all.push(i);
    this.data = this.updateItems(this.data, all);
    this.populateItemsUI();
  },

  // ======================== CHALLENGES ========================
  populateChallengesUI() {
    let area = document.getElementById('challengesArea');
    let values = this.getChallenges(this.data);
    area.innerHTML = "";
    for(let i=0;i<45;++i){
      let lbl = document.createElement('label');
      let cb = document.createElement('input');
      cb.type = "checkbox";
      cb.checked = !!values[i];
      cb.onchange = () => this.updateFromUI();
      lbl.appendChild(cb);
      lbl.append(" " + (i+1));
      area.appendChild(lbl);
      if((i+1)%8==0) area.appendChild(document.createElement('br'));
    }
  },
  unlockAllChallenges() {
    let all = [];
    for(let i=1;i<=45;++i) all.push(i);
    this.data = this.updateChallenges(this.data, all);
    this.populateChallengesUI();
  },

  // ======================== SCRIPT.PY LOGIC ========================
  rshift(val, n) {
    return val >= 0 ? val >> n : (val + 0x100000000) >> n;
  },

  getSectionOffsets(data) {
    let ofs = 0x14;
    let sectData = [-1, -1, -1];
    let entryLens = [1,4,4,1,1,1,1,4,4,1];
    let sectionOffsets = Array(10).fill(0);
    for(let i=0;i<entryLens.length;i++){
      for(let j=0;j<3;j++){
        sectData[j] = data[ofs] + (data[ofs+1]<<8);
        ofs += 4;
      }
      if(sectionOffsets[i]===0) sectionOffsets[i]=ofs;
      for(let j=0;j<sectData[2];j++)
        ofs += entryLens[i];
    }
    return sectionOffsets;
  },

  alterInt(data, offset, newVal, numBytes=4) {
    let arr = new Uint8Array(data);
    for(let i=0;i<numBytes;i++)
      arr[offset+i] = (newVal >> (8*i)) & 0xFF;
    return arr;
  },
  getInt(data, offset, numBytes=4) {
    let v = 0;
    for(let i=0;i<numBytes;i++)
      v |= data[offset+i]<<(8*i);
    return v;
  },

  // --- COMPLETION MARKS LOGIC ---
  updateCheckListUnlocks(data, char_index, new_checklist_data) {
    let arr = new Uint8Array(data);
    if(char_index === 14){
      let clu_ofs = this.offsets[1] + 0x32C;
      for(let i=0;i<new_checklist_data.length;i++){
        let curr_ofs = clu_ofs + i*4;
        arr = this.alterInt(arr, curr_ofs, new_checklist_data[i]);
        if(i===8) clu_ofs += 0x4;
        if(i===9) clu_ofs += 0x37C;
        if(i===10) clu_ofs += 0x84;
      }
    }else if(char_index > 14){
      let clu_ofs = this.offsets[1] + 0x31C;
      for(let i=0;i<new_checklist_data.length;i++){
        let curr_ofs = clu_ofs + char_index*4 + i*19*4;
        arr = this.alterInt(arr, curr_ofs, new_checklist_data[i]);
        if(i===8) clu_ofs += 0x4C;
        if(i===9) clu_ofs += 0x3C;
        if(i===10) clu_ofs += 0x3C;
      }
    }else{
      let clu_ofs = this.offsets[1] + 0x6C;
      for(let i=0;i<new_checklist_data.length;i++){
        let curr_ofs = clu_ofs + char_index*4 + i*14*4;
        arr = this.alterInt(arr, curr_ofs, new_checklist_data[i]);
        if(i===5) clu_ofs += 0x14;
        if(i===8) clu_ofs += 0x3C;
        if(i===9) clu_ofs += 0x3B0;
        if(i===10) clu_ofs += 0x50;
      }
    }
    return arr;
  },
  getChecklistUnlocks(data, char_index) {
    let checklist_data = [];
    if(char_index === 14){
      let clu_ofs = this.offsets[1] + 0x32C;
      for(let i=0;i<12;i++){
        let curr_ofs = clu_ofs + i*4;
        checklist_data.push(this.getInt(data, curr_ofs));
        if(i===8) clu_ofs += 0x4;
        if(i===9) clu_ofs += 0x37C;
        if(i===10) clu_ofs += 0x84;
      }
    }else if(char_index > 14){
      let clu_ofs = this.offsets[1] + 0x31C;
      for(let i=0;i<12;i++){
        let curr_ofs = clu_ofs + char_index*4 + i*19*4;
        checklist_data.push(this.getInt(data, curr_ofs));
        if(i===8) clu_ofs += 0x4C;
        if(i===9) clu_ofs += 0x3C;
        if(i===10) clu_ofs += 0x3C;
      }
    }else{
      let clu_ofs = this.offsets[1] + 0x6C;
      for(let i=0;i<12;i++){
        let curr_ofs = clu_ofs + char_index*4 + i*14*4;
        checklist_data.push(this.getInt(data, curr_ofs));
        if(i===5) clu_ofs += 0x14;
        if(i===8) clu_ofs += 0x3C;
        if(i===9) clu_ofs += 0x3B0;
        if(i===10) clu_ofs += 0x50;
      }
    }
    return checklist_data;
  },

  // --- ITEMS LOGIC ---
  getItems(data) {
    let item_data = [];
    let offs = this.offsets[3];
    for(let i=1;i<=732;i++)
      item_data.push(this.getInt(data, offs+i, 1));
    return item_data;
  },
  updateItems(data, item_list) {
    let arr = new Uint8Array(data);
    for(let i=1;i<=732;i++){
      if(this._bad_items.includes(i)) continue;
      arr = this.alterItem(arr, i, false);
    }
    for(let i of item_list)
      arr = this.alterItem(arr, i, true);
    return arr;
  },
  alterItem(data, idx, unlock=true) {
    return this.alterInt(data, this.offsets[3]+idx, unlock?1:0, 1);
  },

  // --- CHALLENGES LOGIC ---
  getChallenges(data) {
    let challenge_data = [];
    let offs = this.offsets[6];
    for(let i=1;i<=45;i++)
      challenge_data.push(this.getInt(data, offs+i, 1));
    return challenge_data;
  },
  updateChallenges(data, challenge_list) {
    let arr = new Uint8Array(data);
    for(let i=1;i<=45;i++)
      arr = this.alterChallenge(arr, i, false);
    for(let i of challenge_list)
      arr = this.alterChallenge(arr, i, true);
    return arr;
  },
  alterChallenge(data, idx, unlock=true) {
    return this.alterInt(data, this.offsets[6]+idx, unlock?1:0, 1);
  },

  // --- SECRETS LOGIC ---
  getSecrets(data) {
    let secrets_data = [];
    let offs = this.offsets[0];
    for(let i=1;i<=641;i++)
      secrets_data.push(this.getInt(data, offs+i, 1));
    return secrets_data;
  },
  updateSecrets(data, secret_list) {
    let arr = new Uint8Array(data);
    for(let i=1;i<=641;i++)
      arr = this.alterSecret(arr, i, false);
    for(let i of secret_list)
      arr = this.alterSecret(arr, i, true);
    return arr;
  },
  alterSecret(data, idx, unlock=true) {
    let offs = this.offsets[0];
    let v = unlock ? 1 : 0;
    return this.alterInt(data, offs+idx, v, 1);
  },

  // --- CHECKSUM LOGIC ---
  updateChecksum(data) {
    let offset = 0x10;
    let length = data.length - offset - 4;
    let cs = this.calcAfterbirthChecksum(data, offset, length);
    let arr = new Uint8Array(data);
    let bytes = [];
    for(let i=0;i<4;++i) bytes.push((cs>>(8*i))&0xFF);
    arr.set(bytes, offset+length);
    return arr;
  },
  calcAfterbirthChecksum(data, ofs, length) {
    // Ported CRC32 table
    let CrcTable = [
      0x00000000, 0x09073096, 0x120E612C, 0x1B0951BA, 0xFF6DC419, 0xF66AF48F, 0xED63A535, 0xE46495A3,
      0xFEDB8832, 0xF7DCB8A4, 0xECD5E91E, 0xE5D2D988, 0x01B64C2B, 0x08B17CBD, 0x13B82D07, 0x1ABF1D91,
      0xFDB71064, 0xF4B020F2, 0xEFB97148, 0xE6BE41DE, 0x02DAD47D, 0x0BDDE4EB, 0x10D4B551, 0x19D385C7,
      0x036C9856, 0x0A6BA8C0, 0x1162F97A, 0x1865C9EC, 0xFC015C4F, 0xF5066CD9, 0xEE0F3D63, 0xE7080DF5,
      0xFB6E20C8, 0xF269105E, 0xE96041E4, 0xE0677172, 0x0403E4D1, 0x0D04D447, 0x160D85FD, 0x1F0AB56B,
      0x05B5A8FA, 0x0CB2986C, 0x17BBC9D6, 0x1EBCF940, 0xFAD86CE3, 0xF3DF5C75, 0xE8D60DCF, 0xE1D13D59,
      0x06D930AC, 0x0FDE003A, 0x14D75180, 0x1DD06116, 0xF9B4F4B5, 0xF0B3C423, 0xEBBA9599, 0xE2BDA50F,
      0xF802B89E, 0xF1058808, 0xEA0CD9B2, 0xE30BE924, 0x076F7C87, 0x0E684C11, 0x15611DAB, 0x1C662D3D,
      0xF6DC4190, 0xFFDB7106, 0xE4D220BC, 0xEDD5102A, 0x09B18589, 0x00B6B51F, 0x1BBFE4A5, 0x12B8D433,
      0x0807C9A2, 0x0100F934, 0x1A09A88E, 0x130E9818, 0xF76A0DBB, 0xFE6D3D2D, 0xE5646C97, 0xEC635C01,
      0x0B6B51F4, 0x026C6162, 0x196530D8, 0x1062004E, 0xF40695ED, 0xFD01A57B, 0xE608F4C1, 0xEF0FC457,
      0xF5B0D9C6, 0xFCB7E950, 0xE7BEB8EA, 0xEEB9887C, 0x0ADD1DDF, 0x03DA2D49, 0x18D37CF3, 0x11D44C65,
      0x0DB26158, 0x04B551CE, 0x1FBC0074, 0x16BB30E2, 0xF2DFA541, 0xFBD895D7, 0xE0D1C46D, 0xE9D6F4FB,
      0xF369E96A, 0xFA6ED9FC, 0xE1678846, 0xE860B8D0, 0x0C042D73, 0x05031DE5, 0x1E0A4C5F, 0x170D7CC9,
      0xF005713C, 0xF90241AA, 0xE20B1010, 0xEB0C2086, 0x0F68B525, 0x066F85B3, 0x1D66D409, 0x1461E49F,
      0x0EDEF90E, 0x07D9C998, 0x1CD09822, 0x15D7A8B4, 0xF1B33D17, 0xF8B40D81, 0xE3BD5C3B, 0xEABA6CAD,
      0xEDB88320, 0xE4BFB3B6, 0xFFB6E20C, 0xF6B1D29A, 0x12D54739, 0x1BD277AF, 0x00DB2615, 0x09DC1683,
      0x13630B12, 0x1A643B84, 0x016D6A3E, 0x086A5AA8, 0xEC0ECF0B, 0xE509FF9D, 0xFE00AE27, 0xF7079EB1,
      0x100F9344, 0x1908A3D2, 0x0201F268, 0x0B06C2FE, 0xEF62575D, 0xE66567CB, 0xFD6C3671, 0xF46B06E7,
      0xEED41B76, 0xE7D32BE0, 0xFCDA7A5A, 0xF5DD4ACC, 0x11B9DF6F, 0x18BEEFF9, 0x03B7BE43, 0x0AB08ED5,
      0x16D6A3E8, 0x1FD1937E, 0x04D8C2C4, 0x0DDFF252, 0xE9BB67F1, 0xE0BC5767, 0xFBB506DD, 0xF2B2364B,
      0xE80D2BDA, 0xE10A1B4C, 0xFA034AF6, 0xF3047A60, 0x1760EFC3, 0x1E67DF55, 0x056E8EEF, 0x0C69BE79,
      0xEB61B38C, 0xE266831A, 0xF96FD2A0, 0xF068E236, 0x140C7795, 0x1D0B4703, 0x060216B9, 0x0F05262F,
      0x15BA3BBE, 0x1CBD0B28, 0x07B45A92, 0x0EB36A04, 0xEAD7FFA7, 0xE3D0CF31, 0xF8D99E8B, 0xF1DEAE1D,
      0x1B64C2B0, 0x1263F226, 0x096AA39C, 0x006D930A, 0xE40906A9, 0xED0E363F, 0xF6076785, 0xFF005713,
      0xE5BF4A82, 0xECB87A14, 0xF7B12BAE, 0xFEB61B38, 0x1AD28E9B, 0x13D5BE0D, 0x08DCEFB7, 0x01DBDF21,
      0xE6D3D2D4, 0xEFD4E242, 0xF4DDB3F8, 0xFDDA836E, 0x19BE16CD, 0x10B9265B, 0x0BB077E1, 0x02B74777,
      0x18085AE6, 0x110F6A70, 0x0A063BCA, 0x03010B5C, 0xE7659EFF, 0xEE62AE69, 0xF56BFFD3, 0xFC6CCF45,
      0xE00AE278, 0xE90DD2EE, 0xF2048354, 0xFB03B3C2, 0x1F672661, 0x166016F7, 0x0D69474D, 0x046E77DB,
      0x1ED16A4A, 0x17D65ADC, 0x0CDF0B66, 0x05D83BF0, 0xE1BCAE53, 0xE8BB9EC5, 0xF3B2CF7F, 0xFAB5FFE9,
      0x1DBDF21C, 0x14BAC28A, 0x0FB39330, 0x06B4A3A6, 0xE2D03605, 0xEBD70693, 0xF0DE5729, 0xF9D967BF,
      0xE3667A2E, 0xEA614AB8, 0xF1681B02, 0xF86F2B94, 0x1C0BBE37, 0x150C8EA1, 0x0E05DF1B, 0x0702EF8D
    ];
    let checksum = 0xFEDCBA76;
    checksum = ~checksum;
    for(let i=ofs;i<ofs+length;i++)
      checksum = CrcTable[((checksum&0xFF)^data[i])] ^ this.rshift(checksum,8);
    return (~checksum + 2**32) >>> 0;
  }
};
