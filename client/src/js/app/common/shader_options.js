module.exports = {
	bleach: {
		enabled: false,
		opacity: {
			opacity: 0.05,
			min: -4,
			max: 4
		}
	},
	blend: {
		enabled: false,
		mixRatio: 0.01,
		opacity: 0.01
	},
	brightness: {
		enabled: false,
		brightness: 0.01,
		contrast: 0.01
	},
	edge: {
		enabled: false,
	},
	copy: {
		enabled: true,
	},
	pixelate: {
		enabled: false,
		xAmount: {
			xAmount: 0.01,
			min: 0,
			max: 1
		},
		yAmount: {
			yAmount: 0.01,
			min: 0,
			max: 1
		}
	},
	color: {
		enabled: false,
		uSaturation: {
			uSaturation: 1.01,
			min: 1,
			max: 10
		},
		uContrast: {
			uContrast: 1.01,
			min: -6,
			max: 6
		},
		uDesaturate: {
			uDesaturate: 0,
			min: 0,
			max: 4
		},
		uBrightness: {
			uBrightness: 0.05,
			min: -1,
			max: 1.3
		},
		uHue: {
			uHue: 0.05,
			min: 0,
			max: 4
		}
	},
	glitch: {
		enabled: false,
		"amount": {
			amount: 0.05,
			min: 0,
			max: 4
		},
		"angle": {
			angle: 0.05,
			min: 0,
			max: Math.PI * 2
		},
		"seed": {
			seed: 0.05,
			min: 0,
			max: 4
		},
		"seed_x": {
			seed_x: 0.05,
			min: 0,
			max: 4
		},
		"seed_y": {
			seed_y: 0.05,
			min: 0,
			max: 4
		},
		"distortion_x": {
			distortion_x: 0.05,
			min: 0,
			max: 4
		},
		"distortion_y": {
			distortion_y: 0.05,
			min: 0,
			max: 4
		},
		"col_s": {
			col_s: 0.05,
			min: 0,
			max: 4
		}
	},
	dot: {
		enabled: false,
		"angle": {
			angle: 0.01,
			min: 0,
			max: Math.PI * 2
		},
		"scale": {
			scale: 0.01,
			min: 0,
			max: 10
		}
	},
	bit: {
		enabled: false,
		"bitSize": {
			bitSize: 2.0,
			min: 1.3,
			max: 8
		}
	},
	kaleido: {
		enabled: false,
		"sides": {
			sides: 0.01,
			min: 0.01,
			max: 32
		},
		"angle": {
			angle: 0.01,
			min: 0,
			max: Math.PI * 2
		}
	},
	twist: {
		enabled: false,
		"radius": {
			radius: 0.141,
			min: 0.065,
			max: 0.42
		},
		"angle": {
			angle: 0.01,
			min: -Math.PI * .5,
			max: Math.PI * .5
		}
	},
	rgb: {
		enabled: false,
		"amount": {
			amount: 0.01,
			min: 0,
			max: 1
		},
		"angle": {
			angle: 0,
			min: 0,
			max: Math.PI * 2
		}
	},
	rgbShift: {
		enabled: false,
		"amount": {
			amount: 0.01,
			min: 0,
			max: 1
		},
		"uRedX": {
			uRedX: 1,
			min: -512,
			max: 512
		},
		"uRedY": {
			uRedY: 1,
			min: -512,
			max: 512
		},
		"uGreenX": {
			uGreenX: 1,
			min: -512,
			max: 512
		},
		"uGreenY": {
			uGreenY: 1,
			min: -512,
			max: 512
		},
		"uBlueX": {
			uBlueX: 1,
			min: -512,
			max: 512
		},
		"uBlueY": {
			uBlueY: 1,
			min: -512,
			max: 512
		}
	}
};