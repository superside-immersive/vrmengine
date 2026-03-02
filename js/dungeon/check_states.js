// check_states.js — extracted from dungeon.js (Step 6B)
// State-checking IIFE for dungeon game logic

MMD_SA_options.Dungeon.check_states = (function () {
    function check_hp(c) {
if (c.hp == 0) {
  let d = MMD_SA_options.Dungeon
  let motion_id = d.motion_id_by_filename[MMD_SA.MMD.motionManager.filename] || ""
  if (!/^(PC combat hit down|PC down)$/.test(motion_id)) {
    MMD_SA_options.motion_shuffle_list_default = [MMD_SA_options.motion_index_by_name[d.motion["PC down"].name]]
    MMD_SA._force_motion_shuffle = true
    return true
  }
}
    }

    return function () {
var s = this._states
var t = Date.now()
if (s.auto_damage && !s.dialogue_mode) {
  var damage = Math.min((s.auto_damage.t||t) - t, 100) / 1000 * s.auto_damage.damage
  s.auto_damage.t = t
  this.character.hp_add(damage, check_hp)
  return (this.character.hp == 0)
}

for (let name in this.character.states) {
  let state = this.character.states[name]
  if (state.action) {
    state.action()
  }
}
    };
})();
