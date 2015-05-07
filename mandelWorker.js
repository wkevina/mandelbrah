var scale;
var limits;

onmessage = function(oEvent) {

	var options = oEvent.data;

	scale = options.scale;
	limits = options.limits;

	var imageData = new ImageData(limits.x, limits.y);

	mandelbrah(imageData);

	postMessage({
		buffer: imageData.data.buffer
	}, [imageData.data.buffer]);
};

function mandelbrah(data) {

	for (var x = 0; x < limits.x; ++x) {
		for (var y = 0; y < limits.y; ++y) {
			drawPoint(x, y, data, 60);
		}
	}
}

function drawPoint(x, y, data, maxiter) {
	// z^2 = (x^2 - y^2, 2xy)
	// abs = sqrt(x^2 + y^2)

	var coord = {
		x: x,
		y: y
	};

	var p = canvasPointToSet(coord);
	x = p.x;
	y = p.y;

	var z = {
		x: 0,
		y: 0
	};

	var mag2 = 0;
	var temp;
	var count = 0;

	var x2 = 0;
	var y2 = 0;

	while (mag2 < 1e20 && count < maxiter) {
		++count;

		x2 = z.x * z.x;
		y2 = z.y * z.y;

		temp = {
			x: x2 - y2 + x,
			y: 2 * z.x * z.y + y
		};
		z = temp;
		mag2 = x2 + y2;

		if (!isFinite(mag2) || isNaN(mag2)) {
			mag2 = Number.MAX_VALUE;
		}
	}

	var index = (limits.x * coord.y + coord.x) * 4;

	if (mag2 < 4) {

		data.data[index] = 255;
		data.data[index + 1] = 255;
		data.data[index + 2] = 255;
		data.data[index + 3] = 255;

	} else {

		var value = Math.sqrt(count);
		var valueScale = Math.sqrt(maxiter);
		var ratio = value / valueScale*0.9;
		var c = hslToRgb(1 - ratio, 1, 0.5 * count / maxiter);

		data.data[index] = c[0];
		data.data[index + 1] = c[1];
		data.data[index + 2] = c[2];
		data.data[index + 3] = 255;
	}
}

function canvasPointToSet(p) {
	var x = p.x * scale - limits.x * scale * 0.6;
	var y = p.y * scale - limits.y * scale * 0.5;
	return {
		x: x,
		y: y
	};
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l) {
	var r, g, b;

	h = h % 1;

	if (s === 0) {
		r = g = b = l; // achromatic
	} else {
		var hue2rgb = function hue2rgb(p, q, t) {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};

		var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		var p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
