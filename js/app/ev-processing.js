/*
  ev-processing.js — Event processing and monitoring (Step 5B extraction from _SA.js)
  processEV, updateEvent, EV_usage_PROCESS, EV_usage_sub_CREATE, EQ_Emu
  ~700 lines — monolithic processEV switch deferred further split
*/

var EQ_Emu = {
   bands_norm:[]
  ,bands:[]
  ,shuffle_count: 0
  ,v:-1
  ,v_last:-1

  ,update: function (v) {
if (v == null)
  v = EV_usage_float

this.v_last = this.v
this.v = v

if ((--this.shuffle_count <= 0) || (this.v_last < 1)) {
  var min = 40 * v/100
  var max = 80 * v/100
  for (var i = 0; i < 16; i++)
    this.bands_norm[i] = Math.random() * (max-min) + min

  this.shuffle_count = (random(10) + 10) * 10/PC_count_max
}
else {
  for (var i = 0; i < 16; i++)
    this.bands_norm[i] *= v / this.v_last
}

var range = 40 * v/100
if (range > 25)
  range = 25
for (var i = 0; i < 16; i++) {
  var b = this.bands_norm[i] + Math.random() * (range*2) - range
  if (b > 100)
    b = 100

  this.bands[i] = b
}

return this.bands
  }
}


// [LEGACY REMOVED 1B] ActiveXObject initialization removed (Shell.Application, FSO, WScript.Shell)
var oShell
var Shell_OBJ, FSO_OBJ

var regRoot = (returnBoolean("SwapRegistryCheck")) ? ["HKCU", "HKLM"] : ["HKLM", "HKCU"]
//if (returnBoolean("SwapRegistryCheck")) alert(regRoot)
var axDllClass = (Vista_or_above) ? "WASAPIlib.WASAPImain" : "EQGadget.EQ";

var AT_bass_band = 1

function EV_usage_sub_CREATE(uu, obj_name, length) {
  if (!uu)
    uu = {}

  uu[obj_name] = []

  for (var i = 0; i < length; i++) {
    var obj = {
 usage:0
,EV_usage:-1
,EV_usage_float:-1
,EV_usage_last:-1
,EV_usage_last_float:-1

//misc
,filter_u_last:0
    };

    uu[obj_name][i] = obj
  }

  return uu
}

function EV_usage_PROCESS(obj, usage) {
  if (usage < 0)
    usage = 0
  else if (usage > 100)
    usage = 100

  var pow = (obj && obj._MonitorSensitivity_) || ((!obj && use_2nd_monitor) ? Settings.Monitor2Sensitivity : Settings.MonitorSensitivity)
  if (pow != 1)
    usage = Math.pow(usage/100, pow) * 100

  if (Settings.ReverseAnimation)
    usage = 100 - usage

  if (obj) {
    obj.EV_usage_last_float = obj.EV_usage_float
    obj.EV_usage_last = obj.EV_usage

    obj.EV_usage_float = usage
    obj.EV_usage = usage = parseInt(usage)
  }
  return usage
}

var EV_object = [
  {
    EV_parser: function () { return parseEventToMonitor(this.EV_string); }
   ,EV_string:"EventToMonitor"
  }

 ,{
    EV_parser: function () { return (use_2nd_monitor) ? parseEventToMonitor(this.EV_string) : ""; }
   ,EV_string:"EventToMonitorVF"
  }
]

function processEV(num, always_update_event) {
  var ev_obj = EV_object[num]

  var ev = ev_obj.EV_parser()
  if (EV_sync_update.allow_update_between_frames && !num && !always_update_event && (ev != "SOUND")) {
    return -1
  }

  var usage = 0

  var WMI_ev_obj = ev_obj.WMI_ev_obj

  switch (ev) {
case "CPU":
  var max_core = System.Machine.CPUs.count
  var max = (Settings.CCPU == 1) ? max_core : Settings.CCPU
  var core_per_meter = max_core / max

  var ccore = []
  var CPU_meter = []
  for (var i = 0; i < max; i++) {
    var cpm = core_per_meter * i
    var c = parseInt(cpm)
    var scale = 1 - (cpm - c)
    if (scale > core_per_meter)
      scale = core_per_meter

    var u = 0
    var meter_count = core_per_meter
    while (true) {
      var v = ccore[c] = ccore[c] || System.Machine.CPUs.item(c).usagePercentage + 1
      u += v * scale

      meter_count -= scale
      if (meter_count <= 0.01)
        break

      if ((cpm - c) + scale > 0.99)
        c++
      scale = (meter_count > 1) ? 1 : meter_count
    }
    u /= core_per_meter

    CPU_meter[i] = u
    usage += u
  }

  if ((EventToMonitor_para1 == -2) && (CPU_meter.length > 1)) {
    for (var i = 0, i_max = CPU_meter.length; i < i_max; i++) {
      if (!EV_usage_list[i])
        EV_usage_list[i] = {usage:0,EV_usage:-1,EV_usage_float:-1,EV_usage_last:-1,EV_usage_last_float:-1, _MonitorSensitivity_:1}
      EV_usage_PROCESS(EV_usage_list[i], CPU_meter[i]-1)
    }
  }

  usage = (CPU_meter[EventToMonitor_para1]) ? CPU_meter[EventToMonitor_para1] : usage/max
  usage -= 1

//for (var i = 0; i < CPU_meter.length; i++) CPU_meter[i] = parseInt(CPU_meter[i])-1
//DEBUG_show(max+'\n'+CPU_meter)

// To prevent the animation from looking choppy when the usage is low and the meter sensitivity is set to "high/very high"
  if (usage <= 0.1)
    usage = 0.1
  break

case "RAM":
  usage = (1 - System.Machine.availableMemory / System.Machine.totalMemory) * 100
  break

case "HDD":

try {
  WMI_ev_obj.update()

  var dd = WMI_ev_obj.collection
  for (var d = 0; d < dd.length; d++) {
    var drive = dd[d]
    var l = drive.Name.charAt(0).toUpperCase()
    if (l != ev_obj.drive_letter_default)
      continue

    usage = parseInt(drive.PercentDiskTime)
    break
  }
}
catch (err) {}
  break

case "HDD_ALL":

try {
  WMI_ev_obj.update()

  var dd = WMI_ev_obj.collection
  var d_total = 0
  for (var i = 0, i_max = dd.length; i < i_max; i++) {
    if (dd[i].Name == "_Total") {
      d_total = i
      break
    }
  }
  usage = parseInt(dd[d_total].PercentDiskTime)

  if ((EventToMonitor_para1 == -2) && (dd.length > 2)) {
    var d_counter = 0
    for (var i = 0, i_max = dd.length; i < i_max; i++) {
      var d = dd[i]
      if (!/^\w\:$/.test(d.Name))
        continue

      if (!EV_usage_list[d_counter])
        EV_usage_list[d_counter] = {usage:0,EV_usage:-1,EV_usage_float:-1,EV_usage_last:-1,EV_usage_last_float:-1}
      EV_usage_PROCESS(EV_usage_list[d_counter], parseInt(d.PercentDiskTime))
      d_counter++
    }
  }
/*
var _list = []
dd.forEach(function(c){_list.push(c.Name)})
DEBUG_show(_list)
*/
}
catch (err) {}
  break

case "NET":

try {
  var o = WMI_ev_obj.update()
  var dl = 0
  var ul = 0
  for (var n = 0, n_max = o.length; n < n_max; n++) {
    dl = Math.max(dl, parseInt(o[n].BytesReceivedPerSec))
    ul = Math.max(ul, parseInt(o[n].BytesSentPerSec))
  }
  var dl_ul = dl + ul

  var obj = ev_obj.NET
  if (obj.download_peak < dl)
    obj.download_peak = dl
  if (obj.upload_peak < ul)
    obj.upload_peak = ul

  var dl_ratio = dl / obj.download_peak
  var ul_ratio = ul / obj.upload_peak

  if (dl_ul)
    usage = (dl_ratio * (dl / dl_ul) + ul_ratio * (ul / dl_ul)) * 100

  if (EventToMonitor_para1 == -2) {
    if (!EV_usage_list[1])
      EV_usage_list[1] = {usage:0,EV_usage:-1,EV_usage_float:-1,EV_usage_last:-1,EV_usage_last_float:-1}

    EV_usage_PROCESS(EV_usage_list[0], dl_ratio*100)
    EV_usage_PROCESS(EV_usage_list[1], ul_ratio*100)
  }
}
catch (err) {}
  break

case "GPU_ENGINE":

try {
  var o = WMI_ev_obj.update()
  for (var n = 0, n_max = o.length; n < n_max; n++) {
    usage += Math.max(parseInt(o[n].UtilizationPercentage), 0)
  }
//DEBUG_show(usage+'/'+Date.now())
}
catch (err) {}
  break

case "SOUND":
  if (!oShell)
    break

var EQBand, BD, EQBand32

var rHost = (is_SA_child_animation) ? parent : self
EQBand = rHost._rEQBand
BD = rHost._rBD
EQBand32 = rHost._rEQBand32

//DEBUG_show(BD)
//EV_sync_update.timer_stop()

if (!webkit_mode && ((EQBand == null) || (BD == null))) {
  if (Sound_classRoot) {
    try {
      EQBand = oShell.RegRead(Sound_classRoot + "EQBand\\");
      BD     = oShell.RegRead(Sound_classRoot + "BD\\");
    } catch (err) {}
  }
  else {
    for (var i = 0; i < regRoot.length; i++) {
      var classRoot = regRoot[i] + "\\Software\\Classes\\" + axDllClass + "\\";

      try {
        EQBand = oShell.RegRead(classRoot + "EQBand\\");
        BD     = oShell.RegRead(classRoot + "BD\\");
      } catch (err) {}

      if (EQBand) {
        Sound_classRoot = classRoot
        break
      }
    }
  }
}
//else DEBUG_show(EQBand)

  if (!EQBand) {
    Sound_classRoot = null
    EQBand = "[0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0]"
  }
  if (!BD)
    BD = ""

// sync update
//if ((EV_sync_update._EQBand_and_BD != EQBand + BD)) EV_sync_update.fps_count_func()
if (EV_sync_update.enabled && !num && !always_update_event && (EV_sync_update._EQBand_and_BD == EQBand + BD)) {
  return -1
}
EV_sync_update._EQBand_and_BD = EQBand + BD
// END

// "eval" causes MEMORY LEAK (IE9 RC only?). Use another workaround here.
if (ie9_mode) {
  try {
    EQBand = JSON.parse(EQBand)
  }
  catch (err) {
    EQBand = [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0]
  }
}
else {
  EQBand = EQBand.replace(/[^\d\,]/g, "").split(",")
  for (var z=0, z_max=EQBand.length; z < z_max; z++) { EQBand[z] = parseInt(EQBand[z]) }
}

var BD_obj
if (BD && (Settings.BDSpectrumToBeat || Settings.EnableBeatDetection)) {
  if (ie9_mode) {
    try {
      BD_obj = JSON.parse(BD)
    }
    catch (err) {}
  }
  else
    eval('BD_obj = ' + BD)
}
if (BD_obj) {
  BD_obj.EQBand = EQBand

  if (Settings.BDSpectrumToBeat) {
    var EQBeat = []
    for (var z=0, z_max=EQBand.length; z < z_max; z++) {
      var beat = BD_obj.vu_levels[z] / Sound_EQBand_mod
      EQBeat[z] = (Settings.BDSpectrumToBeat == 2) ? beat : (EQBand[z] + beat) / 2
    }
    EQBand = EQBeat
  }
}


  var spectrum = Sound_Spectrum[Settings[ev_obj.EV_string]]

  var EQ_total = 0
  for (var i = spectrum.EQ_ini; i <= spectrum.EQ_end; i++)
    EQ_total += EQBand[i] * ((spectrum.EQ_factor) ? spectrum.EQ_factor[i - spectrum.EQ_ini] : 1)

  EQ_total /= spectrum.EQ_divider

  usage = EQ_total

var EV_usage_sub = ev_obj.EV_usage_sub
if (EV_usage_sub) {
  if (BD_obj && Settings.EnableBeatDetection) {
    EV_usage_sub.BD = BD_obj

    var vu_factor = BD_obj.EQBand[AT_bass_band] * Sound_EQBand_mod / 100 * 2
    if (vu_factor > 1)
      vu_factor = 1
    var vu_beat = BD_obj.vu_levels[AT_bass_band] / 100 * vu_factor

    var beat
    beat = ((Settings.BDBassKick == 2) && !BD_obj.bass_kicked) ? 0 : ((Settings.BDBassKick) ? ((BD_obj.bass_kicked) ? Math.pow(vu_beat, 0.5) : vu_beat*0.75) : vu_beat)
    if (beat < 0.2)
      beat = 0
    BD_obj.beat = beat
//EV_sync_update.fps_count_func()
    for (var m = 1; m <= 2; m++) {
      var mod = (use_full_fps) ? ((RAF_animation_frame_unlimited)?1:2)/(m*EV_sync_update.count_to_10fps_) : 1/m;
      mod *= (Settings.BDDecay == 2) ? 1 : ((Settings.BDDecay == 1) ? 0.5 : 0.25);
      var beat_last = EV_sync_update["_beat_last"+m];
      BD_obj["beat"+m] = EV_sync_update["_beat_last"+m] = (beat < beat_last - mod) ? beat_last - mod : beat;
    }
  }
  else
    EV_usage_sub.BD = null

  var ss_type = ['SOUND_LOW', 'SOUND_MID', 'SOUND_HIGH']
  for (var k = 0; k < 3; k++) {
    var ss = ss_type[k]
    var obj = EV_usage_sub.sound[k]
    if (ss == Settings[ev_obj.EV_string]) {
      obj.usage = usage
      continue
    }

    var spectrum = Sound_Spectrum[ss]

    var EQ_total = 0
    for (var i = spectrum.EQ_ini; i <= spectrum.EQ_end; i++)
      EQ_total += EQBand[i] * ((spectrum.EQ_factor) ? spectrum.EQ_factor[i - spectrum.EQ_ini] : 1)

    EQ_total /= spectrum.EQ_divider

    obj.usage = EQ_total
  }

  if (!EV_usage_sub.sound_raw)
    EV_usage_sub_CREATE(EV_usage_sub, "sound_raw", EQBand.length)
  for (var i = 0, i_max = EQBand.length; i < i_max; i++) {
    EV_usage_sub.sound_raw[i].usage_raw = EQBand[i]
  }

  if (Settings.Use32BandSpectrum) {
    if (EQBand32) {
      try {
        EQBand32 = JSON.parse(EQBand32)
      }
      catch (err) {
        EQBand32 = null
      }
    }
    if (!EQBand32) {
      EQBand32 = []
      for (var i = 0, i_max = EQBand.length; i < i_max; i++) {
        var v = EQBand[i]
        EQBand32.push(v,v)
      }
    }

    if (!EV_usage_sub.sound_raw32)
      EV_usage_sub_CREATE(EV_usage_sub, "sound_raw32", EQBand32.length)
    for (var i = 0, i_max = EQBand32.length; i < i_max; i++) {
      EV_usage_sub.sound_raw32[i].usage_raw = EQBand32[i]
    }
  }
}
  break

case "BATTERY_CHARGE":
  ev_obj.usage_markermode = 1
  usage = System.Machine.PowerStatus.batteryPercentRemaining
  break

case "BATTERY_REMAINING":
  ev_obj.usage_markermode = 1
  usage = 100 - System.Machine.PowerStatus.batteryPercentRemaining
  break

case "BATTERY_STATE":
  ev_obj.usage_markermode = 1
  if (System.Machine.PowerStatus.isPowerLineConnected) {
	if (System.Machine.PowerStatus.isBatteryCharging)
		usage = 50
	else
		usage = 0
  }
  else
	usage = 100
  break

case "BATTERY_STATE_CHARGE":
  ev_obj.usage_markermode = 1
  if (System.Machine.PowerStatus.isPowerLineConnected)
	usage = 100
  else
  	usage = System.Machine.PowerStatus.batteryPercentRemaining
  break

case "BATTERY_STATE_REMAINING":
  ev_obj.usage_markermode = 1
  if (System.Machine.PowerStatus.isPowerLineConnected)
  	usage = 0
  else
  	usage = 100 - System.Machine.PowerStatus.batteryPercentRemaining
  break

case "TIMER_60_SECONDS":
  var time = new Date()
  var seconds = time.getSeconds()
  usage = seconds/60 * 100
  break

case "TIMER_60_MINUTES":
  var time = new Date()
  var minutes = time.getMinutes()
  var seconds = time.getSeconds()
  usage = (minutes + seconds/60)/60 * 100
  break

case "TIMER_24_HOURS":
  var time = new Date()
  var hours = time.getHours()
  var minutes = time.getMinutes()
  usage = (hours + minutes/60)/24 * 100
  break

case "FIXED_VALUE_0":
  usage = 0
  break

case "FIXED_VALUE_50":
  usage = 50
  break

case "FIXED_VALUE_100":
  usage = 100
  break

case "RANDOM_VALUE":
  usage = ev_obj.Random_u = ((ev_obj.Random_u_last == -1) || (PC_count_absolute % 20 == 1)) ? random(101) : ev_obj.Random_u

  if (ev_obj.Random_u_last == -1)
    ev_obj.Random_u_last = 0

  var inc = 100 * (PC_count_max * 1) / 10
  if (usage > ev_obj.Random_u_last) {
    if (usage > ev_obj.Random_u_last + inc)
      usage = ev_obj.Random_u_last + inc
  }
  else {
    if (usage < ev_obj.Random_u_last - inc)
      usage = ev_obj.Random_u_last - inc
  }
  ev_obj.Random_u_last = usage
  break

  }

  return usage
}


function updateEvent(always_update_event) {
  var usage = processEV(0, always_update_event)
  if (usage == -1)
    return false

  var usagevf = processEV(1)

  var usage_pagein = 0
  var usage_pageout = 0

//  var usage_markermode = 0
//  var usage_onbattery = 0
//  var usage_batterycharging = 0

// Moved here and changed the behaviour to allow for using markers with battery.
// If Primary Monitor is a Battery Monitor, markers will indicate charging and power loss events 

  if (MacFace_mode && Settings.UseMarkers) {
     if (EV_object[0].usage_markermode == 1) {
        if (!System.Machine.PowerStatus.isPowerLineConnected)
          usage_pagein = 1 
        if (System.Machine.PowerStatus.isBatteryCharging)
          usage_pageout = 1
     }
     else {
       try {
          var p = WMI_ev_obj_pages.update()[0]
          usage_pagein  = parseInt(p.PagesInputPerSec)
          usage_pageout = parseInt(p.PagesOutputPerSec)
          //usage_pagein = parseInt(p.PagesReadPerSec)
          //usage_pageout = parseInt(p.PagesWritePerSec)
//DEBUG_show([usage_pagein,usage_pageout])
       }
       catch (err) {}
     }
  }


// main

  usage   = EV_usage_PROCESS(self, usage)
  usagevf = EV_usage_PROCESS(null, usagevf)

  var EV_usage_sub = EV_object[0].EV_usage_sub
  if (EV_usage_sub) {

// Emulate the sound EQ object for non-sound activity - START
if (parseEventToMonitor() != "SOUND") {

  var EQBand = []
if (parseEventToMonitor() == "RANDOM_VALUE") {
//DEBUG_show(EV_usage_float)
  EQBand = EQ_Emu.update()
}
else {
  var min = (self.EQP_EQ_min != null) ? EQP_EQ_min : 0
  var max = (self.EQP_EQ_max != null) ? EQP_EQ_max : 15

  var EQ_u = usage
  // Restore the animation order
  if (Settings.ReverseAnimation)
    EQ_u = 100 - EQ_u
  EQ_u *= (max - min + 1)

  for (var i = 0; i < 16; i++) {
    if ((i < min) || (i > max))
      EQBand[i] = usage
    else {
      var u = EQ_u
      if (u > 100)
        u = 100
      else if (u < 0)
        u = 0
      EQBand[i] = u
      EQ_u -= 100
    }
  }
}

  var ss_type = ['SOUND_LOW', 'SOUND_MID', 'SOUND_HIGH']
  for (var k = 0; k < 3; k++) {
    var ss = ss_type[k]
    var obj = EV_usage_sub.sound[k]

    var spectrum = Sound_Spectrum[ss]

    var EQ_total = 0
    for (var i = spectrum.EQ_ini; i <= spectrum.EQ_end; i++)
      EQ_total += EQBand[i] * ((spectrum.EQ_factor) ? spectrum.EQ_factor[i - spectrum.EQ_ini] : 1)

    EQ_total /= spectrum.EQ_divider

    obj.usage = EQ_total
  }

  if (!EV_usage_sub.sound_raw)
    EV_usage_sub_CREATE(EV_usage_sub, "sound_raw", EQBand.length)

  for (var i = 0; i < EQBand.length; i++)
    EV_usage_sub.sound_raw[i].usage_raw = EQBand[i] / Sound_EQBand_mod
}
// END

    for (var i = 0; i < EV_usage_sub.sound.length; i++) {
      var obj = EV_usage_sub.sound[i]
      EV_usage_PROCESS(obj, obj.usage)
    }
    if (EV_usage_sub.sound_raw) {
      for (var i = 0; i < EV_usage_sub.sound_raw.length; i++) {
        var obj = EV_usage_sub.sound_raw[i]
        EV_usage_PROCESS(obj, obj.usage_raw)
      }
    }
  }

  var EV_usage_subVF = EV_object[1].EV_usage_subVF
  if (EV_usage_subVF) {
    for (var i = 0; i < EV_usage_subVF.sound.length; i++) {
      var obj = EV_usage_subVF.sound[i]
      EV_usage_PROCESS(obj, obj.usage)
    }
    if (EV_usage_subVF.sound_raw) {
      for (var i = 0; i < EV_usage_subVF.sound_raw.length; i++) {
        var obj = EV_usage_subVF.sound_raw[i]
        EV_usage_PROCESS(obj, obj.usage_raw)
      }
    }
  }


  if (MacFace_mode) {
    var usemarker1 = false
    var usemarker2 = false

    if (Settings.UseMarkers) {
       if (usage_pagein > 0)
          usemarker1 = true
       if (usage_pageout > 0)
          usemarker2 = true
    }

    if (!EV_object[1].EV_parser()) 
       usagevf = usage

    VistaFace.switchPattern(parseInt(usage/9.5),parseInt(usagevf/33.4), usemarker1, usemarker2)
  }
  else if (self.EV_adjust_timer) {
    var ms = SEQ_CalculateFPS(true)

    var ms_final = EV_AdjustTimer(ms, EV_ms_last, true)

    if (ms_final >= 0) {
      clearTimeout(EV_timerID)
      EV_timerID = setTimeout(EV_frame, ms_final)
    }
  }

  if (!gallery.length)
    return

  if (use_full_fps && !EV_sync_update.frame_changed("AnimateFrame"))
    return

// Draw pic
  if (SEQ_mode) {
    var ms = SEQ_CalculateFPS() * Seq_speed_delay

    var s = Seq.item("SEQ")
    var ms_final = EV_AdjustTimer(ms, s.interval_current)

//ms_final=-1
    if (ms_final >= 0) {
      s.Pause()
      s.timerID = setTimeout(function () { try { clearTimeout(seq_items["SEQ"].timerID) } catch (err) {}; seq_items["SEQ"].timerID=null; seq_items["SEQ"].Play(); }, ms_final)
    }
    s.interval = ms

    return
  }


if (self.EV_gallery_always_1_fps) {
  if (PC_count_absolute % 10 != 1)
    return
}

  var pic
  for (var i = gallery.length-1; i >= 0; i--) {
    var obj = gallery[i]
    var f = obj.frame
    if (f >= usage)
      continue

    pic = obj
    break
  }
  if (!pic)
    pic = gallery[0]

  AnimateFrame(pic)
}

