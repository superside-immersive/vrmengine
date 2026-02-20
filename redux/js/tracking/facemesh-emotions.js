// facemesh-emotions.js — Emotion detection, object detection worker
// Refactored: Step 2C — extracted from js/facemesh_lib.js

export async function fm_emotion_detection(S, rgba, bb, options) {
  if (options.object_detection?.enabled) {
    if (!S.object_detection_worker) {
      await new Promise((resolve) => {
        S.object_detection_worker = new Worker('object_detection_worker.js');
        S.object_detection_worker.onmessage = function (e) {
          let data = ((typeof e.data == "string") && (e.data.charAt(0) === "{")) ? JSON.parse(e.data) : e.data;

          if (typeof data === "string") {
            if (data == 'OK') {
              console.log('(Object Detection worker loaded)');
              resolve();
            }
            S.object_detection_worker_ready = true;
          }
          else {
            S.object_detection_data = data;
          }
        };
      });
    }
    else if (S.object_detection_worker_ready) {
      S.object_detection_worker_ready = false;

      const scale = options.bb.scale;

      const sw = options.bb.w;
      const sh = options.bb.h

      let x = ~~Math.max(bb.topLeft[0] * scale, 0);
      let y = ~~Math.max(bb.topLeft[1] * scale, 0);
      let w = ~~Math.min(bb.bottomRight[0] * scale - x, sw);
      let h = ~~Math.min(bb.bottomRight[1] * scale - y, sh);

      let _rgba = await createImageBitmap(rgba, x, y, w, h);

      const od_options = options.object_detection;
      od_options.categoryAllowlist = ['sad', 'disgust', 'angry', 'neutral', 'fear', 'surprise', 'happy'];
      od_options.framework_classification = 'Transformers.js';
      od_options.model_classification = 'Xenova/facial_emotions_image_detection';

      let data_to_transfer = [_rgba];
      let data = { w: w, h: h, options: options, rgba: _rgba };
      S.object_detection_worker.postMessage(data, data_to_transfer);

      _rgba = undefined;
    }
  }
  else {
    S.object_detection_data = null;
  }
}
