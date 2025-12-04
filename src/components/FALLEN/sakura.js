;(function (global, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else if (typeof define === 'function' && define.amd) define(factory);
  else global.Sakura = factory();
})(typeof window !== 'undefined' ? window : this, function () {
  function r(min, max) { return Math.random() * (max - min) + min }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }

  function createCanvas(parent, zIndex) {
    var c = document.createElement('canvas');
    var s = c.style;
    s.position = 'fixed';
    s.left = '0';
    s.top = '0';
    s.width = '100%';
    s.height = '100%';
    s.pointerEvents = 'none';
    s.zIndex = String(zIndex == null ? 0 : zIndex);
    (parent || document.body).appendChild(c);
    return c;
  }

function Petal(w, h, opt) {
  this.w = w; this.h = h;
  this.size = r(opt.minSize, opt.maxSize);
  this.x = r(0, w);
  this.y = r(-h, 0);
  this.vx = opt.wind + r(-opt.windVariance, opt.windVariance);
  var dLarge = opt.drifterLargeRatio == null ? 0.15 : opt.drifterLargeRatio;
  var dSmall = opt.drifterRatio == null ? 0.35 : opt.drifterRatio;
  var roll = Math.random();
  this.mode = roll < dLarge ? 'drifter_large' : (roll < dLarge + dSmall ? 'drifter' : 'spinner');
  this.noSpin = this.mode === 'drifter' && Math.random() < (opt.noSpinDrifter == null ? 0.6 : opt.noSpinDrifter) || this.mode === 'drifter_large' && Math.random() < (opt.noSpinDrifterLarge == null ? 0.8 : opt.noSpinDrifterLarge);
  this.spinScale = this.mode === 'spinner' ? r(0.25, 0.7) : (this.mode === 'drifter_large' ? r(0.0, 0.15) : r(0.0, 0.2));
  this.vy = this.mode === 'drifter' ? r(opt.minSpeedY * 0.5, opt.maxSpeedY * 0.9) : (this.mode === 'drifter_large' ? r(opt.minSpeedY * 0.35, opt.maxSpeedY * 0.7) : r(opt.minSpeedY, opt.maxSpeedY));
  this.rot = r(0, Math.PI * 2);
  this.vr = r(-opt.rotationSpeed, opt.rotationSpeed) * this.spinScale;
  var swayBase = r(0, opt.swayAmplitude);
  this.swayAmp = swayBase * (this.mode === 'drifter' ? 1.5 : (this.mode === 'drifter_large' ? (opt.largeSwayMultiplier == null ? 2.2 : opt.largeSwayMultiplier) : 1));
  this.swayFreq = this.mode === 'drifter_large' ? r(opt.swayFrequency * 0.6, opt.swayFrequency * 1.0) : r(opt.swayFrequency * 0.8, opt.swayFrequency * 1.2);
  this.opacity = r(opt.minOpacity, opt.maxOpacity);
  if (this.mode === 'drifter_large') this.size *= (opt.largeSizeMultiplier == null ? 1.8 : opt.largeSizeMultiplier);
  this.gravityP = (opt.gravity == null ? 0.03 : opt.gravity) * r(0.7, 1.3) * (this.mode === 'drifter' ? 0.6 : (this.mode === 'drifter_large' ? 0.5 : 1));
  this.dragP = (opt.airDrag == null ? 0.02 : opt.airDrag) * r(0.7, 1.3) * (this.mode === 'drifter' ? 1.2 : (this.mode === 'drifter_large' ? 1.5 : 1));
  this.liftP = (opt.liftFactor == null ? 0.02 : opt.liftFactor) * r(0.6, 1.4);
}

Petal.prototype.update = function (dt, opt) {
  var sway = Math.sin(performance.now() * 0.001 * this.swayFreq) * this.swayAmp;
  this.vx += (opt.wind - this.vx) * this.dragP * dt;
  this.vy += this.gravityP * dt;
  if (this.mode === 'drifter') this.vy *= (1 - (opt.verticalDrag == null ? 0.04 : opt.verticalDrag) * dt);
  if (this.mode === 'drifter_large') this.vy *= (1 - (opt.largeVerticalDrag == null ? 0.08 : opt.largeVerticalDrag) * dt);
  this.vy -= Math.min(0.05, Math.abs(this.vx) * this.liftP) * dt;
  if (!this.noSpin) {
    var spinTarget = this.mode === 'spinner' ? this.vx * 0.015 : (this.mode === 'drifter_large' ? this.vx * 0.003 : this.vx * 0.005);
    this.vr += (spinTarget + (Math.random() - 0.5) * 0.01) * dt;
    var base = (opt.rotationSpeed == null ? 0.8 : opt.rotationSpeed);
    var maxSpin = base * (this.mode === 'spinner' ? 1.0 : (this.mode === 'drifter_large' ? 0.2 : 0.3));
    this.vr = clamp(this.vr, -maxSpin, maxSpin);
  } else {
    this.vr *= 0.98;
  }
  this.x += (this.vx + sway) * dt;
  this.y += this.vy * dt;
  this.rot += this.vr * dt;
    if (this.x < -this.size * 2) this.x = this.w + this.size * 2;
    if (this.x > this.w + this.size * 2) this.x = -this.size * 2;
  if (this.y > this.h + this.size * 2) {
    this.size = r(opt.minSize, opt.maxSize);
    this.x = r(0, this.w);
    this.y = r(-this.h * 0.2, 0);
    this.vx = opt.wind + r(-opt.windVariance, opt.windVariance);
    var dLarge = opt.drifterLargeRatio == null ? 0.15 : opt.drifterLargeRatio;
    var dSmall = opt.drifterRatio == null ? 0.35 : opt.drifterRatio;
    var roll = Math.random();
    this.mode = roll < dLarge ? 'drifter_large' : (roll < dLarge + dSmall ? 'drifter' : 'spinner');
    this.noSpin = this.mode === 'drifter' && Math.random() < (opt.noSpinDrifter == null ? 0.6 : opt.noSpinDrifter) || this.mode === 'drifter_large' && Math.random() < (opt.noSpinDrifterLarge == null ? 0.8 : opt.noSpinDrifterLarge);
    this.spinScale = this.mode === 'spinner' ? r(0.25, 0.7) : (this.mode === 'drifter_large' ? r(0.0, 0.15) : r(0.0, 0.2));
    this.vy = this.mode === 'drifter' ? r(opt.minSpeedY * 0.5, opt.maxSpeedY * 0.9) : (this.mode === 'drifter_large' ? r(opt.minSpeedY * 0.35, opt.maxSpeedY * 0.7) : r(opt.minSpeedY, opt.maxSpeedY));
    this.vr = r(-opt.rotationSpeed, opt.rotationSpeed) * this.spinScale;
    var swayBase = r(0, opt.swayAmplitude);
    this.swayAmp = swayBase * (this.mode === 'drifter' ? 1.5 : (this.mode === 'drifter_large' ? (opt.largeSwayMultiplier == null ? 2.2 : opt.largeSwayMultiplier) : 1));
    this.swayFreq = this.mode === 'drifter_large' ? r(opt.swayFrequency * 0.6, opt.swayFrequency * 1.0) : r(opt.swayFrequency * 0.8, opt.swayFrequency * 1.2);
    this.opacity = r(opt.minOpacity, opt.maxOpacity);
    if (this.mode === 'drifter_large') this.size *= (opt.largeSizeMultiplier == null ? 1.8 : opt.largeSizeMultiplier);
    this.gravityP = (opt.gravity == null ? 0.03 : opt.gravity) * r(0.7, 1.3) * (this.mode === 'drifter' ? 0.6 : (this.mode === 'drifter_large' ? 0.5 : 1));
    this.dragP = (opt.airDrag == null ? 0.02 : opt.airDrag) * r(0.7, 1.3) * (this.mode === 'drifter' ? 1.2 : (this.mode === 'drifter_large' ? 1.5 : 1));
    this.liftP = (opt.liftFactor == null ? 0.02 : opt.liftFactor) * r(0.6, 1.4);
  }
  };

  function drawPetal(ctx, size, rot, color, opacity) {
    ctx.save();
    ctx.rotate(rot);
    ctx.scale(size, size);
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.moveTo(0, -1);
    ctx.bezierCurveTo(0.85, -0.95, 1.1, -0.35, 0.95, 0.05);
    ctx.bezierCurveTo(0.9, 0.75, 0.35, 1.05, -0.05, 0.95);
    ctx.bezierCurveTo(-0.65, 0.9, -1.05, 0.45, -1, -0.1);
    ctx.bezierCurveTo(-0.95, -0.6, -0.6, -0.95, 0, -1);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -0.6);
    ctx.quadraticCurveTo(0.16, -0.3, 0.02, -0.02);
    ctx.quadraticCurveTo(-0.16, -0.3, 0, -0.6);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fill();
    ctx.restore();
  }
  function drawPaper(ctx, size, rot, color, opacity) {
    ctx.save();
    ctx.rotate(rot);
    ctx.scale(size, size);
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.moveTo(-1.0, -0.8);
    ctx.quadraticCurveTo(-0.2, -1.0, 0.9, -0.6);
    ctx.quadraticCurveTo(1.1, 0.0, 0.8, 0.7);
    ctx.quadraticCurveTo(-0.1, 1.0, -0.9, 0.6);
    ctx.quadraticCurveTo(-1.1, 0.0, -1.0, -0.8);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-0.6, -0.4);
    ctx.quadraticCurveTo(0.0, -0.6, 0.6, -0.3);
    ctx.quadraticCurveTo(0.1, 0.2, -0.5, 0.1);
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.fill();
    ctx.restore();
  }

function SakuraBackground(options) {
  var opt = options || {};
  this.parent = opt.parent || null;
  this.zIndex = opt.zIndex == null ? 0 : opt.zIndex;
  this.targetDensity = opt.density || 0.08;
  this.maxPetals = opt.maxPetals || 180;
  this.color = opt.color || '#f6a7c1';
  this.wind = opt.wind == null ? 0.4 : opt.wind;
  this.windVariance = opt.windVariance == null ? 0.35 : opt.windVariance;
  this.minSpeedY = opt.minSpeedY == null ? 0.6 : opt.minSpeedY;
  this.maxSpeedY = opt.maxSpeedY == null ? 1.6 : opt.maxSpeedY;
  this.rotationSpeed = opt.rotationSpeed == null ? 0.8 : opt.rotationSpeed;
  this.minSize = opt.minSize == null ? 5 : opt.minSize;
  this.maxSize = opt.maxSize == null ? 12 : opt.maxSize;
  this.minOpacity = opt.minOpacity == null ? 0.55 : opt.minOpacity;
  this.maxOpacity = opt.maxOpacity == null ? 0.95 : opt.maxOpacity;
  this.swayAmplitude = opt.swayAmplitude == null ? 0.5 : opt.swayAmplitude;
  this.swayFrequency = opt.swayFrequency == null ? 1.5 : opt.swayFrequency;
  this.gravity = opt.gravity == null ? 0.03 : opt.gravity;
  this.airDrag = opt.airDrag == null ? 0.02 : opt.airDrag;
  this.liftFactor = opt.liftFactor == null ? 0.02 : opt.liftFactor;
  this.drifterRatio = opt.drifterRatio == null ? 0.35 : opt.drifterRatio;
  this.drifterLargeRatio = opt.drifterLargeRatio == null ? 0.15 : opt.drifterLargeRatio;
  this.noSpinDrifter = opt.noSpinDrifter == null ? 0.6 : opt.noSpinDrifter;
  this.noSpinDrifterLarge = opt.noSpinDrifterLarge == null ? 0.8 : opt.noSpinDrifterLarge;
  this.verticalDrag = opt.verticalDrag == null ? 0.04 : opt.verticalDrag;
  this.largeVerticalDrag = opt.largeVerticalDrag == null ? 0.08 : opt.largeVerticalDrag;
  this.largeSizeMultiplier = opt.largeSizeMultiplier == null ? 1.8 : opt.largeSizeMultiplier;
  this.largeSwayMultiplier = opt.largeSwayMultiplier == null ? 2.2 : opt.largeSwayMultiplier;
  this.imageSrc = opt.imageSrc || null;
  this.imageSrcLarge = opt.imageSrcLarge || null;
  this.image = null;
  this.imageLarge = null;
  this.imageLoaded = false;
  this.imageLargeLoaded = false;
  this.running = false;
  this.canvas = null;
  this.ctx = null;
  this.petals = [];
  this._raf = 0;
  this._last = 0;
}

  SakuraBackground.prototype._resize = function () {
    var c = this.canvas;
    var dpr = clamp(window.devicePixelRatio || 1, 1, 2);
    var w = (this.parent || document.documentElement).clientWidth;
    var h = (this.parent || document.documentElement).clientHeight;
    c.width = Math.floor(w * dpr);
    c.height = Math.floor(h * dpr);
    c.style.width = w + 'px';
    c.style.height = h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = w; this.h = h;
    var desired = Math.min(this.maxPetals, Math.floor(this.w * this.h * this.targetDensity / 10000));
    if (desired > this.petals.length) {
      var add = desired - this.petals.length;
      for (var i = 0; i < add; i++) this.petals.push(new Petal(this.w, this.h, this));
    } else if (desired < this.petals.length) {
      this.petals.length = desired;
    }
    for (var j = 0; j < this.petals.length; j++) { this.petals[j].w = this.w; this.petals[j].h = this.h }
  };

  SakuraBackground.prototype.start = function () {
    if (this.running) return this;
    this.canvas = createCanvas(this.parent, this.zIndex);
    this.ctx = this.canvas.getContext('2d');
    var self = this;
    if (this.imageSrc) {
      this.image = new Image();
      this.image.onload = function(){ self.imageLoaded = true };
      this.image.src = this.imageSrc;
    }
    if (this.imageSrcLarge) {
      this.imageLarge = new Image();
      this.imageLarge.onload = function(){ self.imageLargeLoaded = true };
      this.imageLarge.src = this.imageSrcLarge;
    }
    this._resize();
    this._last = performance.now();
    function loop(t) {
      self._raf = requestAnimationFrame(loop);
      var dt = (t - self._last) / 16.6667;
      self._last = t;
      self.ctx.clearRect(0, 0, self.w, self.h);
      for (var i = 0; i < self.petals.length; i++) {
        var p = self.petals[i];
        p.update(dt, self);
        self.ctx.save();
        self.ctx.translate(p.x, p.y);
        if (p.mode === 'drifter_large' && self.imageLargeLoaded) {
          self.ctx.rotate(p.rot);
          self.ctx.globalAlpha = p.opacity;
          var s0 = p.size;
          self.ctx.drawImage(self.imageLarge, -s0, -s0, s0 * 2, s0 * 2);
        } else if (self.imageLoaded) {
          self.ctx.rotate(p.rot);
          self.ctx.globalAlpha = p.opacity;
          var s1 = p.size;
          self.ctx.drawImage(self.image, -s1, -s1, s1 * 2, s1 * 2);
        } else {
          if (p.mode === 'drifter_large') drawPaper(self.ctx, p.size, p.rot, self.color, p.opacity);
          else drawPetal(self.ctx, p.size, p.rot, self.color, p.opacity);
        }
        self.ctx.restore();
      }
    }
    this._onResize = this._resize.bind(this);
    window.addEventListener('resize', this._onResize);
    this.running = true;
    this._raf = requestAnimationFrame(loop);
    return this;
  };

  SakuraBackground.prototype.stop = function () {
    if (!this.running) return this;
    cancelAnimationFrame(this._raf);
    window.removeEventListener('resize', this._onResize);
    this.running = false;
    return this;
  };

  SakuraBackground.prototype.destroy = function () {
    this.stop();
    if (this.canvas && this.canvas.parentNode) this.canvas.parentNode.removeChild(this.canvas);
    this.canvas = null; this.ctx = null;
    this.petals = [];
  };

  SakuraBackground.prototype.update = function (opts) {
    if (!opts) return this;
    if (opts.density != null) this.targetDensity = opts.density;
    if (opts.maxPetals != null) this.maxPetals = opts.maxPetals;
    if (opts.color) this.color = opts.color;
    if (opts.wind != null) this.wind = opts.wind;
    if (opts.windVariance != null) this.windVariance = opts.windVariance;
    if (opts.minSpeedY != null) this.minSpeedY = opts.minSpeedY;
    if (opts.maxSpeedY != null) this.maxSpeedY = opts.maxSpeedY;
    if (opts.rotationSpeed != null) this.rotationSpeed = opts.rotationSpeed;
    if (opts.minSize != null) this.minSize = opts.minSize;
    if (opts.maxSize != null) this.maxSize = opts.maxSize;
    if (opts.minOpacity != null) this.minOpacity = opts.minOpacity;
    if (opts.maxOpacity != null) this.maxOpacity = opts.maxOpacity;
    if (opts.swayAmplitude != null) this.swayAmplitude = opts.swayAmplitude;
    if (opts.swayFrequency != null) this.swayFrequency = opts.swayFrequency;
    if (opts.drifterRatio != null) this.drifterRatio = opts.drifterRatio;
    if (opts.drifterLargeRatio != null) this.drifterLargeRatio = opts.drifterLargeRatio;
    if (opts.noSpinDrifter != null) this.noSpinDrifter = opts.noSpinDrifter;
    if (opts.noSpinDrifterLarge != null) this.noSpinDrifterLarge = opts.noSpinDrifterLarge;
    if (opts.verticalDrag != null) this.verticalDrag = opts.verticalDrag;
    if (opts.largeVerticalDrag != null) this.largeVerticalDrag = opts.largeVerticalDrag;
    if (opts.largeSizeMultiplier != null) this.largeSizeMultiplier = opts.largeSizeMultiplier;
    if (opts.largeSwayMultiplier != null) this.largeSwayMultiplier = opts.largeSwayMultiplier;
    if (opts.imageSrc) this.imageSrc = opts.imageSrc;
    if (opts.imageSrcLarge) this.imageSrcLarge = opts.imageSrcLarge;
    this._resize();
    return this;
  };

  function create(options) { return new SakuraBackground(options) }

  return { createSakuraBackground: create };
});
