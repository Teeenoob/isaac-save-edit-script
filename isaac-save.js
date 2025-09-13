// This file will implement the save file logic in JS.
// ---
// Port core logic from script.py (Python) to JavaScript here.
// This is a stub for the most basic "Misc" fields. You will need to expand
// this to handle all unlocks, items, challenges, etc.

window.IsaacSave = {
  data: null,

  // Load save file (Uint8Array)
  load(data) {
    this.data = new Uint8Array(data);
    // Example: read win streak (offset logic from script.py)
    document.getElementById('winStreak').value = this._getInt(this.data, 0x3A4); // Example offset, adjust!
    document.getElementById('edenTokens').value = this._getInt(this.data, 0x3A0); // Example offset, adjust!
    document.getElementById('donationMachine').value = this._getInt(this.data, 0x3A8); // Example offset, adjust!
    document.getElementById('greedMachine').value = this._getInt(this.data, 0x3B0); // Example offset, adjust!
  },

  // Save file, return Uint8Array
  save() {
    // Before saving, update the data from the UI
    this.data = this._setInt(this.data, 0x3A4, parseInt(document.getElementById('winStreak').value) || 0);
    this.data = this._setInt(this.data, 0x3A0, parseInt(document.getElementById('edenTokens').value) || 0);
    this.data = this._setInt(this.data, 0x3A8, parseInt(document.getElementById('donationMachine').value) || 0);
    this.data = this._setInt(this.data, 0x3B0, parseInt(document.getElementById('greedMachine').value) || 0);
    // TODO: recalculate checksum, update other sections
    return this.data;
  },

  // Called when UI fields are changed
  updateFromUI() {
    // For a real implementation, update all fields from UI controls
  },

  // Utility to get a 4-byte int (little endian)
  _getInt(data, offset) {
    return data[offset] | (data[offset+1]<<8) | (data[offset+2]<<16) | (data[offset+3]<<24);
  },

  // Utility to set a 4-byte int (little endian)
  _setInt(data, offset, value) {
    data[offset] = value & 0xFF;
    data[offset+1] = (value >> 8) & 0xFF;
    data[offset+2] = (value >> 16) & 0xFF;
    data[offset+3] = (value >> 24) & 0xFF;
    return data;
  }
};