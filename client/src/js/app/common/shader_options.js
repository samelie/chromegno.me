module.exports = {
	bleach: {
		enabled: false,
		opacity: {
			enabled: true,
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
		enabled: true,
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
			enabled: true,
			xAmount: 0.01,
			min: 0,
			max: 0.2
		},
		yAmount: {
			enabled: true,
			yAmount: 0.01,
			min: 0,
			max: 0.2
		}
	},
	mega: {
		enabled: false,
		uDisplacementScale: {
			enabled: true,
			uDisplacementScale: 1,
			min: 1,
			max: 300
		}
	},
	chroma: {
		enabled: false,
		uDisplacementScale: {
			enabled: true,
			uDisplacementScale: 1,
			min: 1,
			max: 300
		}
	},
	color: {
		enabled: false,
		uSaturation: {
			enabled: true,
			uSaturation: 1.01,
			min: 1,
			max: 10
		},
		uContrast: {
			enabled: true,
			uContrast: 1.01,
			min: -6,
			max: 6
		},
		uDesaturate: {
			enabled: true,
			uDesaturate: 0,
			min: 0,
			max: 4
		},
		uBrightness: {
			enabled: true,
			uBrightness: 0.05,
			min: -1,
			max: 1.3
		},
		uHue: {
			enabled: true,
			uHue: 0.05,
			min: 0,
			max: 4
		}
	},
	glitch: {
		enabled: false,
		"amount": {
			enabled: true,
			amount: 0.05,
			min: 0,
			max: 4
		},
		"angle": {
			enabled: true,
			angle: 0.05,
			min: 0,
			max: Math.PI * 2
		},
		"seed": {
			enabled: true,
			seed: 0.05,
			min: 0,
			max: 4
		},
		"seed_x": {
			enabled: true,
			seed_x: 0.05,
			min: 0,
			max: 4
		},
		"seed_y": {
			enabled: true,
			seed_y: 0.05,
			min: 0,
			max: 4
		},
		"distortion_x": {
			enabled: true,
			distortion_x: 0.05,
			min: 0,
			max: 4
		},
		"distortion_y": {
			enabled: true,
			distortion_y: 0.05,
			min: 0,
			max: 4
		},
		"col_s": {
			enabled: true,
			col_s: 0.05,
			min: 0,
			max: 4
		}
	},
	dot: {
		enabled: false,
		"angle": {
			enabled: true,
			angle: 0.01,
			min: 0,
			max: Math.PI * 2
		},
		"scale": {
			enabled: true,
			scale: 0.01,
			min: 4,
			max: 12
		}
	},
	bit: {
		enabled: false,
		"bitSize": {
			enabled: true,
			bitSize: 2.0,
			min: 0.7,
			max: 8
		}
	},
	kaleido: {
		enabled: false,
		"sides": {
			enabled: true,
			sides: 0.01,
			min: 0.0001,
			max: 2.001
		},
		"angle": {
			enabled: false,
			angle: 0.01,
			min: 0,
			max: Math.PI * 2
		}
	},
	twist: {
		enabled: false,
		"radius": {
			enabled: true,
			radius: 0.141,
			min: 0.065,
			max: 0.42
		},
		"angle": {
			enabled: true,
			angle: 0.01,
			min: -Math.PI * .5,
			max: Math.PI * .5
		}
	},
	rgb: {
		enabled: false,
		"amount": {
			enabled: true,
			amount: 0.01,
			min: 0,
			max: 0.2
		},
		"angle": {
			enabled: true,
			angle: 0,
			min: 0,
			max: Math.PI * 2
		}
	},
	rgbShift: {
		enabled: false,
		"amount": {
			enabled: true,
			amount: 0.01,
			min: 0,
			max: .4
		},
		"uRedX": {
			enabled: true,
			uRedX: 1,
			min: -32,
			max: 32
		},
		"uRedY": {
			enabled: true,
			uRedY: 1,
			min: -32,
			max: 32
		},
		"uGreenX": {
			enabled: true,
			uGreenX: 1,
			min: -32,
			max: 32
		},
		"uGreenY": {
			enabled: true,
			uGreenY: 1,
			min: -32,
			max: 32
		},
		"uBlueX": {
			enabled: true,
			uBlueX: 1,
			min: -32,
			max: 32
		},
		"uBlueY": {
			enabled: true,
			uBlueY: 1,
			min: -32,
			max: 32
		}
	}
};