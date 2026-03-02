(function () {
  'use strict';

  const XR_Animator_HeadlessWsBridge = {
    install() {
      window.addEventListener('SA_WebSocket_server_on_message', (() => {
/*
    async function load_file(path) {
if (!path || !FSO_OBJ.FileExists(path)) return null;

let blob;

const response = await fetch(toFileProtocol(path));
if (linux_mode) {
  blob = new Blob([await response.arrayBuffer()]);
}
else {
  blob = await response.blob();
}

if (blob) {
  blob.name = path;
  blob.isFileSystem = true;
  await SA_DragDropEMU(blob);
}
    }
*/
        function on_XRA_loaded(func, delay = 1) {
          if (delay == -1) {
            func();
          }
          else {
            window.addEventListener('SA_Dungeon_onstart', () => {
              System._browser.on_animation_update.add(func, delay, 0);
            });
          }
        }

        function update_camera() {
          const camera = System._browser.camera;
          camera.video_track?.applyConstraints(camera.set_constraints()).then(function () {
            camera.DEBUG_show('(camera size updated)', 3);
          }).catch(function () {
            camera.DEBUG_show('ERROR:camera size failed to update', 5);
          });
        }

        function write_settings(data, stage = get_stage()) {
          function func(data) {
            data.forEach((para) => {
              let path = para.path;
              let value = para.value;

              if (!path) {
                MMD_SA_options._XRA_settings_imported = value;
              }
              else {
                const nodes = path.split('.');
                let node = MMD_SA_options._XRA_settings_imported;
                for (let i = 0; i < nodes.length - 1; i++) {
                  let name = nodes[i];
                  if (name == '<current_motion>') {
                    System._browser.camera.poseNet.hip_adjustment_set = MMD_SA.MMD.motionManager.filename;
                    name = System._browser.camera.poseNet.hip_adjustment_set;
                  }

                  if (node[name]) {
                    node = node[name];
                  }
                  else {
                    node = node[name] = (isNaN(parseInt(nodes[i + 1]))) ? {} : [];
                  }
                }

                const p_last = nodes[nodes.length - 1];
                if (/camera_preference\.label|streamer_mode\.mocap_type/.test(path)) {
                  if (stage >= 3) {
                    if ((p_last == 'label') && System._browser.camera.camera_list) {
                      const preference = (value && { label: { test: (s) => s.indexOf(value) != -1 } }) || MMD_SA_options.user_camera.preference;
                      System._browser.camera.camera_list.sort((a, b) => (preference?.label?.test(a.label) && -1) || (preference?.label?.test(b.label) && 1) || (/warudo/i.test(a.label) && 1) || (/warudo/i.test(b.label) && -1) || 0);
                      System._browser.camera.camera_list = System._browser.camera.camera_list.slice(0, 7);
                    }

                    System._browser.on_animation_update.remove(start_streamer_mode, 0);
                    System._browser.on_animation_update.add(start_streamer_mode, 3, 0);
                  }
                }
                else if (/user_camera\.(pixel_limit|fps)/.test(path)) {
                  if (stage >= 2) {
                    System._browser.on_animation_update.remove(update_camera, 0);
                    System._browser.on_animation_update.add(update_camera, 3, 0);
                  }
                }

                node[p_last] = value;
              }
            });

            System._browser.on_animation_update.remove(update_settings, 0);
            System._browser.on_animation_update.add(update_settings, 1, 0);
          }

          on_XRA_loaded(() => {
            func(data);
          }, (stage >= 2) ? -1 : 1);
        }

        function update_settings() {
          MMD_SA_options._XRA_settings_import();
          DEBUG_show();
        }

        function get_stage() {
          let stage = 0;
          if (MMD_SA_options.Dungeon.started) {
            if (System._browser.camera.ML_enabled) {
              stage = 3;
            }
            else {
              stage = 2;
            }
          }
          else if (MMD_SA.THREEX.THREEX) {
            stage = 1;
          }

          return stage;
        }

        let warudo_path;
        function get_warudo_path() {
          if (warudo_path) return warudo_path;

          try {
            let key = oShell.RegRead('HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ ').filter((k) => k.indexOf('Steam App') != -1).find((k) => oShell.RegRead(k + '\\DisplayName') == 'Warudo');
            if (key) {
              warudo_path = oShell.RegRead(key + '\\InstallLocation');
            }
          }
          catch (err) { console.error(err); }

          return warudo_path;
        }

        function start_streamer_mode() {
          if (MMD_SA_options.Dungeon.event_mode) {
            document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' }));
          }

          if (System._browser.camera.ML_enabled) {
            MMD_SA.WebXR.user_camera.facemesh.enabled = false;
            MMD_SA.WebXR.user_camera.poseNet.enabled = false;
            MMD_SA.WebXR.user_camera.handpose.enabled = false;
          }

          System._browser.on_animation_update.add(() => {
            const inv = MMD_SA_options.Dungeon.inventory.find('streamer_mode');
            inv.action_check().then((actionable) => {
              if (actionable) {
                inv.item.action.func();
              }
            });
          }, 3, 0);
        }

        window.addEventListener('load', () => {
          Object.defineProperty(MMD_SA_options, '_XRA_headless_mode', (() => {
            let _XRA_headless_mode = MMD_SA_options._XRA_headless_mode;
            return {
              get: function () { return _XRA_headless_mode; },
              set: function (v) {
                if ((_XRA_headless_mode === v) || (!v && !_XRA_headless_mode)) return;
                _XRA_headless_mode = v;

                let stage = get_stage();

                if (!v) {
                  on_XRA_loaded(() => {
                    if (document.getElementById('Ldungeon_UI')) {
                      document.getElementById('Ldungeon_UI').style.visibility = 'inherit';
                      document.getElementById('Ldungeon_inventory').style.visibility = 'inherit';
                      document.getElementById('Ldungeon_inventory_backpack').style.visibility = 'hidden';
                    }
                  }, (stage >= 2) ? -1 : 1);

                  MMD_SA_options.user_camera.display.wireframe = { top: 0.5 };
                  document.body.style.backgroundColor = 'transparent';
                  System._browser.skip_rendering = null;

                  LbuttonFullscreen.style.display = LbuttonLR.style.display = 'inline';

                  if (!is_mobile) {
                    MMD_SA_options.width = 960;
                    MMD_SA_options.height = 540;
                    LbuttonRestore.dispatchEvent(new MouseEvent('click'));
                  }
                }
                else {
                  on_XRA_loaded(() => {
                    System._browser.overlay_mode = 0;

                    if (document.getElementById('Ldungeon_UI')) {
                      document.getElementById('Ldungeon_UI').style.visibility = 'hidden';
                      document.getElementById('Ldungeon_inventory').style.visibility = 'hidden';
                      document.getElementById('Ldungeon_inventory_backpack').style.visibility = 'hidden';
                    }
                  }, (stage >= 2) ? -1 : 1);

                  MMD_SA_options.user_camera.display.wireframe = { top: 0, left: 0, scale: 1.8 };
                  document.body.style.backgroundColor = 'rgba(105,105,105,0.5)';
                  System._browser.skip_rendering = true;

                  LbuttonFullscreen.style.display = LbuttonLR.style.display = 'none';

                  if (!is_mobile) {
                    MMD_SA_options.width = 640;
                    MMD_SA_options.height = 360;
                    LbuttonRestore.dispatchEvent(new MouseEvent('click'));
                  }
                }
              }
            };
          })());
        });

        return function (e) {
          let message = e.detail.message;
          console.log(message);

          let msg_json;
          try {
            msg_json = JSON.parse(message);
          }
          catch {
            console.log(message);
            return;
          }

          const app = msg_json.app;
          const action = msg_json.action;
          const data = msg_json.data;

          if (app != 'XRAnimator') return;

          let stage = get_stage();

          if (action == 'enable_headless_mode') {
            MMD_SA_options._XRA_headless_mode = data;

            if (data && (stage == 0)) {
              System._browser.on_animation_update.add(() => {
                document.getElementById('LMMD_StartButton').dispatchEvent(new MouseEvent('click'));
              }, 10, 0);

              on_XRA_loaded(() => {
                System._browser.on_animation_update.add(() => {
                  const config = MMD_SA_options._XRA_settings_imported = MMD_SA_options._XRA_settings_imported || MMD_SA_options._XRA_settings_export();

                  const config_data = [];
                  if (!config.user_camera.streamer_mode.camera_preference.label)
                    config_data.push({ 'path': 'user_camera.streamer_mode.camera_preference.label', 'value': '' });

                  if (!config.user_camera.streamer_mode.VMC_sender_enabled)
                    config_data.push({ 'path': 'user_camera.streamer_mode.VMC_sender_enabled', 'value': true });

                  if (!config.UI_muted)
                    config_data.push({ 'path': 'UI_muted', 'value': true });

                  const VMC_app_mode = (data == 'Warudo') ? 'Warudo' : 'Others';
                  if (config.VMC?.app_mode != VMC_app_mode)
                    config_data.push({ 'path': 'VMC.app_mode', 'value': VMC_app_mode });

                  if (config_data.length) {
                    write_settings(config_data);
                  }
                }, 2, 0);

                System._browser.on_animation_update.add(() => {
                  start_streamer_mode();
                }, 10, 0);
              });
            }
          }
          else if (action == 'write_settings') {
            write_settings(data, stage);
          }
          else if (action == 'open_file') {
            if (/^character\:/.test(data) || /\.vrm$/.test(data)) {
              let path;
              if (/^character\:/.test(data)) {
                if (/([^\/\\]+)$/.test(data)) {
                  const filename = RegExp.$1;

                  path = get_warudo_path();
                  if (path) {
                    path += '\\Warudo_Data\\StreamingAssets\\Characters\\' + filename;
                  }
                }
              }
              else {
                path = data;
              }

              if (!path) return;
              console.log(path);

              on_XRA_loaded(() => {
                SA_DragDropEMU(path);
              }, (stage == 1) ? 1 : -1);
            }
          }
          else if (action == 'press_key') {
            on_XRA_loaded(() => {
              MMD_SA.THREEX.utils.press_key(data);
            }, (stage >= 2) ? -1 : 1);
          }
          else if (action == 'switch_motion') {
            let initializing = stage < 2;
            on_XRA_loaded(() => {
              const motion_index = data + ((System._browser.camera.poseNet.enabled) ? 0 : 1);
              MMD_SA_options.Dungeon_options.item_base.pose._change_motion_(motion_index, true);

              if (initializing) {
                window.addEventListener('SA_MMD_model0_onmotionchange', (e) => {
                  const mm = e.detail.motion_new;
                  if (mm.filename == 'stand_simple') {
                    MMD_SA_options.user_camera.streamer_mode.motion_id = (mm.para_SA.motion_tracking_upper_body_only) ? 1 : 0;
                  }
                  else if (mm.para_SA.motion_tracking_enabled) {
                    MMD_SA_options.user_camera.streamer_mode.motion_id = mm.filename;
                  }
                }, { once: true });
              }
            }, (stage > 2) ? -1 : 1);
          }
          else if (action == 'restart_app') {
            SA_Reload_PRE(Settings.f_path, Settings.f_path_folder);
          }
          else if (action == 'close_app') {
            SA_topmost_window.System._browser.confirmClose(true);
          }
        };
      })());
    }
  };

  window.XR_Animator_HeadlessWsBridge = XR_Animator_HeadlessWsBridge;
})();
