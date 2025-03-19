const NodeCache = require("node-cache");

class Cache {
  ttlSeconds = 21600;
  constructor(ttlSeconds) {
    this.ttlSeconds = ttlSeconds ? ttlSeconds : this.ttlSeconds;
    // console.log("ttlSeconds::",this.ttlSeconds);
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds,
      // checkperiod: ttlSeconds * 0.2,
      // useClones: false,
    });
  }

  get(key) {
    const value = this.cache.get(key);
    if (value) {
      return Promise.resolve(value);
    }

    // return storeFunction().then((result) => {
    //   this.cache.set(key, result);
    //   return result;
    // });
  }

  set(key, value, ttlSeconds) {
    // console.log("inside set::", key, value, ttlSeconds);
    this.ttlSeconds = ttlSeconds ? ttlSeconds : this.ttlSeconds;
    this.cache.set(key, value, this.ttlSeconds);
    return value;
  }

  del(keys) {
    this.cache.del(keys);
  }

  delStartWith(startStr = "") {
    if (!startStr) {
      return;
    }

    const keys = this.cache.keys();
    for (const key of keys) {
      if (key.indexOf(startStr) === 0) {
        this.del(key);
      }
    }
  }

  flush() {
    this.cache.flushAll();
  }
}

class SingletonCache {
  constructor(ttlSeconds) {
    if (!SingletonCache.instance) {
      SingletonCache.instance = new Cache(ttlSeconds);
    }
  }

  getInstance() {
    return SingletonCache.instance;
  }
}

module.exports = { SingletonCache };
