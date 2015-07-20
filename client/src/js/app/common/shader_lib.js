var SHADERS = require('./shaders');
module.exports = {
    mix: function() {
        var shader = SHADERS["mix"];
        var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        return {
            shader: shader,
            uniforms: uniforms
        }
    },
    chroma: function() {
        var shader = SHADERS["chroma"];
        var uniforms = THREE.UniformsUtils.clone(shader.uniforms);

        uniforms["enableChroma"].value = true;
        uniforms["enableColor"].value = true;
        uniforms["enableReflection"].value = true;
        uniforms["enableDisplacement"].value = true;
        uniforms["enableRipples"].value = true;

        uniforms["uDisplacementBias"].value = 1.0;
        uniforms["uDisplacementScale"].value = 20;

        uniforms["uAmbientColor"].value.convertGammaToLinear();
        uniforms["uDiffuseColor"].value.convertGammaToLinear();
        return {
            shader: shader,
            uniforms: uniforms
        }
    },
    fractal1: function() {
        var shader = SHADERS["fractal1"];
        var uniforms = THREE.UniformsUtils.clone(shader.uniforms);

        uniforms["uAmbientColor"].value.convertGammaToLinear();
        uniforms["uDiffuseColor"].value.convertGammaToLinear();
        return {
            shader: shader,
            uniforms: uniforms
        }
    },
    cave: function() {
        var shader = SHADERS["cave"];
        var uniforms = THREE.UniformsUtils.clone(shader.uniforms);

        uniforms["uAmbientColor"].value.convertGammaToLinear();
        uniforms["uDiffuseColor"].value.convertGammaToLinear();
        return {
            shader: shader,
            uniforms: uniforms
        }
    }
};