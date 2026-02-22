#!/usr/bin/env python3
"""Paso 1: Cut audio script loads + add stubs"""
import os
os.chdir(os.path.join(os.path.dirname(__file__), '..', '..'))

changes = {}

# --- 1.1  _SA.js: remove audio.js and sfx.js loadScriptSync ---
f = 'redux/js/_SA.js'
txt = open(f).read()
old = "    SA.loader.loadScriptSync('js/mmd/audio.js')\n    SA.loader.loadScriptSync('js/mmd/sfx.js')\n    SA.loader.loadScriptSync('js/mmd/speech-bubble.js')"
new = "    // [AUDIO REMOVED] audio.js and sfx.js no longer loaded\n    SA.loader.loadScriptSync('js/mmd/speech-bubble.js')"
assert old in txt, "1.1 NOT FOUND in " + f
txt = txt.replace(old, new)
open(f,'w').write(txt)
changes[f] = True
print('OK ' + f)

# --- 1.2 + 1.3  _SA2.js ---
f = 'redux/js/_SA2.js'
txt = open(f).read()

old2 = '  Settings.UseAudioFFT = (webkit_mode && (returnBoolean("UseAudioFFT") || (self.MMD_SA_options && MMD_SA_options.use_CircularSpectrum)/* || returnBoolean("AutoItWinampMode")*/)) // [9E] xul_version always 0\n  Settings.UseAudioFFTLiveInput = Settings.UseAudioFFT && (returnBoolean("UseAudioFFTLiveInput") || returnBoolean("AutoItWinampMode"))\n  if (Settings.UseAudioFFT)\n    document.write(\'<script language="JavaScript" src="js/audio_fft.js"></scr\'+\'ipt>\')'
new2 = '  // [AUDIO REMOVED] AudioFFT disabled\n  Settings.UseAudioFFT = false\n  Settings.UseAudioFFTLiveInput = false'
assert old2 in txt, "1.2 NOT FOUND in " + f
txt = txt.replace(old2, new2)

old3 = "ipcRenderer.on('audio_BPM_detection_finished', function (event, message) {\n  var data_all = JSON.parse(message)\n  var win = (data_all.window_id == -1) ? self : document.getElementById(\"Ichild_animation\" + data_all.window_id).contentWindow\n  win.Audio_BPM.vo._audio_BPM_detection_finished(data_all.data)\n});"
new3 = "// [AUDIO REMOVED] audio_BPM_detection_finished IPC handler removed"
assert old3 in txt, "1.3 NOT FOUND in " + f
txt = txt.replace(old3, new3)
open(f,'w').write(txt)
changes[f] = True
print('OK ' + f)

# --- 1.4 + 1.5  MMD_SA.js ---
f = 'redux/MMD.js/MMD_SA.js'
txt = open(f).read()

old4 = "// audio \xe2\x80\x94 loaded from js/mmd/audio.js\nvar _audio_result = MMD_SA_initAudio();\nvar sender = _audio_result.sender;\nvar vo = _audio_result.vo;\n// audio END (delegate)"
new4 = """// [AUDIO REMOVED] \u2014 stubs for sender and vo
var sender = { playbackRate: 1 };
var vo = {
  BPM_mode: false,
  motion_by_song_name_mode: false,
  beat_reference: 0,
  audio_obj: null,
  playbackRate_scale: 1,
  audio_onended: function() {},
  _audio_BPM_detection_finished: function() {}
};
self.Audio_BPM = { audio_obj: null, vo: vo };"""
assert old4 in txt, "1.4 NOT FOUND in " + f
txt = txt.replace(old4, new4)

old5 = "// Audio3D \xe2\x80\x94 loaded from js/mmd/sfx.js\nMMD_SA.Audio3D = MMD_SA_createAudio3D();"
new5 = "// [AUDIO REMOVED] \u2014 Audio3D stub\nMMD_SA.Audio3D = { audio_object_by_name: {} };"
assert old5 in txt, "1.5 NOT FOUND in " + f
txt = txt.replace(old5, new5)
open(f,'w').write(txt)
changes[f] = True
print('OK ' + f)

# --- 1.6-1.9  core.js ---
f = 'redux/js/core.js'
txt = open(f).read()

# 1.6: nwjs block — remove jsmediatags load
old6 = "    document.write(\n  '<script type=\"text/javascript\" language=\"javascript\" src=\"js/SA_webkit.js\"></scr'+'ipt>\\n'\n ,'<script src=\"js/jsmediatags.js\"></scr'+'ipt>\\n'\n    )"
new6 = "    document.write(\n  '<script type=\"text/javascript\" language=\"javascript\" src=\"js/SA_webkit.js\"></scr'+'ipt>\\n'\n    )"
assert old6 in txt, "1.6 NOT FOUND in " + f
txt = txt.replace(old6, new6)

# 1.7: nwjs block — remove audio custom settings (first occurrence, with trailing //...UseAudioFFTLiveInput)
old7 = 'Settings_default._custom_.EventToMonitor = "SOUND_ALL"\nSettings_default._custom_.WallpaperAsBG = "non_default"\nSettings_default._custom_.UseAudioFFT = "non_default"\nSettings_default._custom_.Use30FPS = "non_default"\nSettings_default._custom_.Use32BandSpectrum = "non_default"\n//Object.defineProperty(Settings_default._custom_, "UseAudioFFTLiveInput", { get: function () { return this.UseAudioFFT } });\nSettings_default._custom_.UpdateInterval = "1"\nSettings_default._custom_.Display = "-1"\n//Settings_default._custom_.UseAudioFFTLiveInput = "non_default"\n\n    console.log("browser-native mode:ON")'
new7 = '// [AUDIO REMOVED] SOUND_ALL, UseAudioFFT, Use32BandSpectrum defaults removed\nSettings_default._custom_.WallpaperAsBG = "non_default"\nSettings_default._custom_.Use30FPS = "non_default"\nSettings_default._custom_.UpdateInterval = "1"\nSettings_default._custom_.Display = "-1"\n\n    console.log("browser-native mode:ON")'
assert old7 in txt, "1.7 NOT FOUND in " + f
txt = txt.replace(old7, new7, 1)

# 1.8: Electron/WE block — remove audio custom settings
old8 = 'Settings_default._custom_.EventToMonitor = "SOUND_ALL"\nSettings_default._custom_.WallpaperAsBG = "non_default"\nSettings_default._custom_.UseAudioFFT = "non_default"\nSettings_default._custom_.Use30FPS = "non_default"\nSettings_default._custom_.Use32BandSpectrum = "non_default"\n//Object.defineProperty(Settings_default._custom_, "UseAudioFFTLiveInput", { get: function () { return this.UseAudioFFT } });\nSettings_default._custom_.UpdateInterval = "1"\nSettings_default._custom_.Display = "-1"\nif (!browser_native_mode) {\n  Settings_default._custom_.UseAudioFFTLiveInput = "non_default"\n}'
new8 = '// [AUDIO REMOVED] SOUND_ALL, UseAudioFFT, Use32BandSpectrum defaults removed\nSettings_default._custom_.WallpaperAsBG = "non_default"\nSettings_default._custom_.Use30FPS = "non_default"\nSettings_default._custom_.UpdateInterval = "1"\nSettings_default._custom_.Display = "-1"'
assert old8 in txt, "1.8 NOT FOUND in " + f
txt = txt.replace(old8, new8, 1)

# 1.9a: Remove jsmediatags in browser_native_mode block
old9a = """    if (browser_native_mode) {
      document.write(
  '<script src="js/jsmediatags.js"></scr'+'ipt>\\n'
      )
      console.log("browser-native mode:ON")
      return
    }"""
new9a = """    if (browser_native_mode) {
      // [AUDIO REMOVED] jsmediatags no longer loaded
      console.log("browser-native mode:ON")
      return
    }"""
assert old9a in txt, "1.9a NOT FOUND in " + f
txt = txt.replace(old9a, new9a)

# 1.9b: Remove Aurora + codecs + jsmediatags block
old9b = """    if (parent.Aurora) {
      self.Aurora = parent.Aurora
//      self.jsmediatags = parent.jsmediatags
    }
    else {
      document.write(
  '<script src="js/aurora.js"></scr'+'ipt>\\n'
+ '<script src="js/mp3.js"></scr'+'ipt>\\n'
+ '<script src="js/aac.js"></scr'+'ipt>\\n'
+ '<script src="js/aurora_web_audio.js"></scr'+'ipt>\\n'
+ '<script src="js/jsmediatags.js"></scr'+'ipt>\\n'
//+ '<script src="js/id3.js"></scr'+'ipt>\\n'
      )
    }"""
new9b = "    // [AUDIO REMOVED] Aurora, mp3, aac, aurora_web_audio, jsmediatags no longer loaded"
assert old9b in txt, "1.9b NOT FOUND in " + f
txt = txt.replace(old9b, new9b)

open(f,'w').write(txt)
changes[f] = True
print('OK ' + f)

print('\n=== Paso 1 applied to %d files ===' % len(changes))
