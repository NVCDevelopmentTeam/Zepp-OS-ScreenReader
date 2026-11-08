// @ts-nocheck
// Lightweight polyfills for Sveltia CMS feature checks (Uint8Array Base64/Hex & Iterator helpers)
// Zero external dependencies, only loaded on the /admin route.

if (typeof window !== 'undefined') {
  const U8 = Uint8Array;

  if (typeof U8.fromBase64 !== 'function') {
    U8.fromBase64 = function (str, options) {
      let s = String(str).trim();
      if (options?.alphabet === 'base64url') {
        s = s.replace(/-/g, '+').replace(/_/g, '/');
      }
      while (s.length % 4 !== 0) s += '=';
      const bin = window.atob(s);
      const bytes = new U8(bin.length);
      for (let i = 0; i < bin.length; i++) {
        bytes[i] = bin.charCodeAt(i);
      }
      return bytes;
    };
  }

  if (typeof U8.prototype.toHex !== 'function') {
    U8.prototype.toHex = function () {
      let hex = '';
      for (let i = 0; i < this.length; i++) {
        hex += this[i].toString(16).padStart(2, '0');
      }
      return hex;
    };
  }

  if (typeof U8.prototype.toBase64 !== 'function') {
    U8.prototype.toBase64 = function (options) {
      let bin = '';
      for (let i = 0; i < this.length; i++) {
        bin += String.fromCharCode(this[i]);
      }
      let b64 = window.btoa(bin);
      if (options?.alphabet === 'base64url') {
        b64 = b64.replace(/\+/g, '-').replace(/\//g, '_');
      }
      if (options?.omitPadding) {
        b64 = b64.replace(/=+$/, '');
      }
      return b64;
    };
  }

  if (typeof globalThis.Iterator !== 'function') {
    globalThis.Iterator = class Iterator {
      static from(iterable) {
        return iterable;
      }
    };
  }

  if (typeof globalThis.Iterator.prototype.map !== 'function') {
    globalThis.Iterator.prototype.map = function* (fn) {
      for (const item of this) {
        yield fn(item);
      }
    };
  }
}
