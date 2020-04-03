var color;
(function (color) {
    var ColorBox = (function () {
        function ColorBox(initColors) {
            if (typeof initColors === "undefined") { initColors = null; }
            this.colors = [];
            this.colorLength = 0;
            if (initColors) {
                for (var i = 0; i < initColors.length; i++) {
                    this.addColor(initColors[i][0], initColors[i][1]);
                }
            }
        }
        ColorBox.prototype.addColor = function (color, length) {
            this.colorLength += length;
            this.colors.push([RGB.FromString(color), length]);
        };

        ColorBox.prototype.getColor = function (range) {
            var f = this.colors[0][0];
            var sum = 0;
            for (var i = 1; i < this.colors.length; i++) {
                sum += this.colors[i][1];
                if (range == sum) {
                    return this.colors[i][0].toString();
                } else if (range < sum) {
                    var s = this.colors[i][0];
                    sum = 1 - (sum - range) / this.colors[i][1];
                    return RGB.NumberToString(this.distance(f.r, s.r, sum), this.distance(f.g, s.g, sum), this.distance(f.b, s.b, sum));
                }
                f = this.colors[i][0];
            }
            return this.colors[this.colors.length - 1][0].toString();
        };

        ColorBox.prototype.distance = function (v1, v2, p) {
            if (typeof p === "undefined") { p = 0.5; }
            return v1 + (Math.abs(v1 - v2) * p) * (v1 < v2 ? 1 : -1);
        };
        return ColorBox;
    })();
    color.ColorBox = ColorBox;

    var RGB = (function () {
        function RGB(r, g, b) {
            this.r = r;
            this.g = g;
            this.b = b;
        }
        RGB.NumberToString = function (r, g, b) {
            return Math.round(r).toString(16) + Math.round(g).toString(16) + Math.round(b).toString(16);
        };
        RGB.IntToString = function (r, g, b) {
            return r.toString(16) + g.toString(16) + b.toString(16);
        };

        RGB.FromString = function (str) {
            if (str.length > 6) {
                str = str.substr(str.length - 6);
            }
            return new RGB(parseInt(str.substr(0, 2), 16), parseInt(str.substr(2, 2), 16), parseInt(str.substr(4, 2), 16));
        };

        RGB.prototype.toString = function () {
            return this.r.toString(16) + this.g.toString(16) + this.b.toString(16);
        };
        RGB.prototype.toDebug = function () {
            return '[r:' + this.r + ' g:' + this.g + ' b:' + this.b + ']';
        };
        return RGB;
    })();
    color.RGB = RGB;
})(color || (color = {}));
//# sourceMappingURL=ColorBox.js.map
