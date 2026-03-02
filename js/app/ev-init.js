/*
  ev-init.js — Event monitoring initialization (Step 5B extraction from _SA.js)
  parseEventToMonitor, Sound_Spectrum data, initEV
*/

var EventToMonitor_para1

function parseEventToMonitor(str) {
  if (!str)
    str = EV_object[0].EV_string

  var ev = Settings[str]
  if (/CPU/.test(ev)) {
    EventToMonitor_para1 = (/(\d+)/.test(ev)) ? parseInt(RegExp.$1) : -1

    if (EventToMonitor_para1 == 999)
      EventToMonitor_para1 = -2

    ev = 'CPU'
  }
  else if (/NET/.test(ev)) {
    EventToMonitor_para1 = (/(\d+)/.test(ev)) ? -2 : 0
    ev = 'NET'
  }
  else if (/HDD_ALL/.test(ev)) {
    EventToMonitor_para1 = (/(\d+)/.test(ev)) ? -2 : 0
    ev = 'HDD_ALL'
  }
  else if (/SOUND/.test(ev))
    ev = 'CPU'

  return ev
}

var EV_usage_list = [{usage:0,EV_usage:-1,EV_usage_float:-1,EV_usage_last:-1,EV_usage_last_float:-1}]

var EV_usage_sub
var Sound_EQBand_mod = 0.7
var Sound_Spectrum, Sound_classRoot

Sound_Spectrum = {
  SOUND_ALL: {
    EQ_ini:0,
    EQ_end:15,
    EQ_divider:16*1
  },

  SOUND_LOW: {
    EQ_ini:0,
    EQ_end:3,
    EQ_divider:2+4+3+1,
    EQ_factor:[2,4,3,1]
  },

  SOUND_MID: {
    EQ_ini:4,
    EQ_end:11,
    EQ_divider:1+2+3+4+4+3+2+1,
    EQ_factor:[1,2,3,4,4,3,2,1]
  },

  SOUND_HIGH: {
    EQ_ini:12,
    EQ_end:15,
    EQ_divider:1+3+4+2,
    EQ_factor:[1,3,4,2]
  }
}


function initEV(num) {
  var ev_obj = EV_object[num]

  var t = ""

  switch (ev_obj.EV_parser()) {
case "CPU":
  t = 'CPU usage (' + ((EventToMonitor_para1 > -1) ? 'core ' + (EventToMonitor_para1+1) : 'general') + ')'
  break

case "RAM":
  t = 'RAM usage'
  break

case "HDD":
case "HDD_ALL":
try {
  if ((num > 0) && /HDD/.test(EV_object[0].EV_parser()))
    ev_obj.WMI_ev_obj = EV_object[0].WMI_ev_obj
  else {
    ev_obj.WMI_ev_obj = new WMI_Refresher("Win32_PerfFormattedData_PerfDisk_LogicalDisk", "EV")
    ev_obj.WMI_ev_obj.init()
  }
}
catch (err) {}

  if (ev_obj.EV_parser() == "HDD") {
    ev_obj.drive_letter_default = ev_obj.drive_letter_system = (windows_mode) ? System.Environment.getEnvironmentVariable("SystemRoot").charAt(0).toUpperCase() : "C"
    t = 'Drive activity (' + ev_obj.drive_letter_default + ':)'
  }
  else
    t = 'Drive activity (all drives total)'
  break

case "NET":
try {
  if ((num > 0) && /NET/.test(EV_object[0].EV_parser()))
    ev_obj.WMI_ev_obj = EV_object[0].WMI_ev_obj
  else {
    ev_obj.WMI_ev_obj = new WMI_Refresher("Win32_PerfFormattedData_Tcpip_NetworkInterface", "EV")
    ev_obj.WMI_ev_obj.init()
  }
}
catch (err) {}

  ev_obj.NET = {
// assumed 10Mb/s default bandwidth
    download_peak: 1000*1000*10/8,
    upload_peak: 1000*1000*10/8
  }
  t = 'Network usage (general)'
  break

case "GPU_ENGINE":

try {
  if ((num > 0) && /GPU_ENGINE/.test(EV_object[0].EV_parser()))
    ev_obj.WMI_ev_obj = EV_object[0].WMI_ev_obj
  else {
    ev_obj.WMI_ev_obj = new WMI_Refresher("Win32_PerfFormattedData_GPUPerformanceCounters_GPUEngine", "EV")
    ev_obj.WMI_ev_obj.init()
  }
}
catch (err) {}

  t = 'GPU engine 3D usage (general)'
  break

case "SOUND":
  if (use_full_spectrum) {
    ev_obj.EV_usage_sub = EV_usage_sub_CREATE(null, "sound", 3)
    if (num == 0)
      EV_usage_sub = ev_obj.EV_usage_sub
  }

  t = "Sound output ("
  switch (Settings[ev_obj.EV_string]) {
case "SOUND_ALL":
  t += "all frequencies"
  break
case "SOUND_LOW":
  t += "bass"
  break
case "SOUND_MID":
  t += "mid-tones"
  break
case "SOUND_HIGH":
  t += "treble"
  break
  }

  t += ")"
  break

case "BATTERY_CHARGE":
  t = 'Battery Charge'
  break

case "BATTERY_REMAINING":
  t = 'Battery Charge Remaining'
  break

case "BATTERY_STATE":
  t = 'Battery State'
  break

case "BATTERY_STATE_CHARGE":
  t = 'Battery State and Charge level'
  break

case "BATTERY_STATE_REMAINING":
  t = 'Battery State and Charge remaining'
  break

case "TIMER_60_SECONDS":
  t = 'Timer (60 seconds)'
  break

case "TIMER_60_MINUTES":
  t = 'Timer (60 minutes)'
  break

case "TIMER_24_HOURS":
  t = 'Timer (24 hours)'
  break

case "FIXED_VALUE_0":
  t = 'Fixed value (0%)'
  break

case "FIXED_VALUE_50":
  t = 'Fixed value (50%)'
  break

case "FIXED_VALUE_100":
  t = 'Fixed value (100%)'
  break

case "RANDOM_VALUE":
  t = 'Random value (0-100%)'
  break
  }

  return t
}
