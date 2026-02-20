/*
  js/app/utils.js
  Utility functions extracted from _SA.js (Step 5A)
*/

function addZero(n, d) {
  if (!d)
    d = 2

  n += ""

  if (n.length >= d)
    return n

  n = Math.pow(10,d-n.length) + n
  return n.substring(1, n.length)
}

function random(num) {
  return Math.floor(Math.random() * num)
}

function SA_OnBeforeUnload_Common() {
  WMI_AL_stop()
}

function AutoIt_Execute(path, para, delay, callback) {
  if (non_windows_native_mode)
    return

  if (!/\.(au3|exe)$/.test(path))
    path += (returnBoolean("AutoItRunAsAU3")) ? '.au3' : '.exe'
  if (!delay)
    delay = 0

  // use setTimeout to fix some kind of unknown thread race issue
  if (webkit_mode && callback)
    setTimeout(function () {Shell_OBJ.ShellExecute(path, para, null, callback)}, delay)
  else
    setTimeout(function () {Shell_OBJ.ShellExecute(path, para)}, delay)
}

function CheckDockState() {
//  System.Gadget.beginTransition();
  resize()
//  System.Gadget.endTransition(1, 2);
}

var bar_accelerate = true

function barPhysics(s) {
  if (!bar_accelerate || (PC_count_max == 1))
    return s

  var t = (PC_count_max - PC_count) / PC_count_max
  if (!bar_accelerate)
    return s*t

  var u = s*2
  var a = -u
  var s_final = u*t + 0.5*a*t*t

  return s_final
}
