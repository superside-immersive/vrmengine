// WebGL2 shader conversion utilities
// Extracted from MMD_SA.js — Step 10G refactoring
// http://www.shaderific.com/blog/2014/3/13/tutorial-how-to-update-a-shader-for-opengl-es-30
// https://webgl2fundamentals.org/webgl/lessons/webgl1-to-webgl2.html
// http://forum.playcanvas.com/t/webgl-2-0-and-engine-release-notes-v0-207-22-02-16/3445

window.MMD_SA_createWebGL2Convert = function () {
  return {
    webgl2_vshader_prefix_convert: function (string) {
      if (!MMD_SA.use_webgl2)
        return string

      string = '#version 300 es\n' + MMD_SA.webgl2_vshader_main_convert(string) + '\nout vec4 SA_FragColor;\n\n'
      return string
    },

    webgl2_fshader_prefix_convert: function (string) {
      if (!MMD_SA.use_webgl2)
        return string

      string = '#version 300 es\n' + MMD_SA.webgl2_fshader_main_convert(string) + '\nout vec4 SA_FragColor;\n\n'
      return string
    },

    webgl2_common_convert: function (string) {
      if (!MMD_SA.use_webgl2)
        return string

      string = string.replace(/texture([^\w\()\_])/g, "texSA$1").replace(/texture(2D|Cube)\(/g, "texture(").replace(/texture2DProj\(/g, "textureProj(").replace(/gl_FragColor/g, "SA_FragColor").replace(/\#extension GL_OES_standard_derivatives \: enable/, "")
      //.replace(/gl_FragDepthEXT/g, "gl_FragDepth")
      return string
    },

    webgl2_vshader_main_convert: function (string) {
      if (!MMD_SA.use_webgl2)
        return string

      string = MMD_SA.webgl2_common_convert(string).replace(/varying /g, "out ").replace(/attribute /g, "in ")
      return string
    },

    webgl2_fshader_main_convert: function (string) {
      if (!MMD_SA.use_webgl2)
        return string

      string = MMD_SA.webgl2_common_convert(string).replace(/varying /g, "in ")
      return string
    },

    webgl2_RGBA_internal: function (gl, format, type) {
      // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
      // https://www.khronos.org/registry/webgl/specs/latest/2.0/

      if (!MMD_SA.use_webgl2)
        return format

      if (type == gl.FLOAT) {
        return ((format == gl.RGBA) ? gl.RGBA32F : format)
      }
      return format//gl.RGBA8
    }
  };
};
