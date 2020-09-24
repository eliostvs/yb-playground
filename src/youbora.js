import youbora from "youboralib"

youbora.Log.logLevel = youbora.Log.Level.DEBUG

export function fireInit({ adapter }) {
  adapter.fireInit()
}

export function fireJoin({ adapter }) {
  adapter.fireJoin()
}

export function fireStop({ adapter }) {
  adapter.fireStop()
}

export function firePause({ adapter }) {
  adapter.firePause()
}

export function fireResume({ adapter }) {
  adapter.fireResume()
}

export function fireSeekBegin({ adapter }) {
  adapter.fireSeekBegin()
}

export function fireSeekEnd({ adapter }) {
  adapter.fireSeekEnd()
}

export function fireBufferBegin({ adapter }) {
  adapter.fireBufferBegin()
}

export function fireBufferEnd({ adapter }) {
  adapter.fireBufferEnd()
}

export function fireAdSkip({ adapter }) {
  adapter.fireSkip()
}

export function fireFatalError({ adapter }) {
  adapter.fireFatalError("error-code", "error-description")
}

export function fireAdManifest({ adapter }) {
  adapter.fireManifest()
}

export function fireAdBreakStart({ adapter }) {
  adapter.fireBreakStart()
}

export function fireAdBreakStop({ adapter }) {
  adapter.fireBreakStop()
}

export function fireStart({ adapter }) {
  adapter.fireStart()
}

export function fireAdClick({ adapter }) {
  adapter.fireClick(adapter.getClickThroughURL())
}

const Adapter = youbora.Adapter.extend({
  registerListeners() {
    this.monitorPlayhead(false, false)
  },

  getPlayhead() {
    return this.player.playHead
  },

  getVersion() {
    return this.player.version
  },

  getPlayerName() {
    return this.player.playerName
  },

  getPlayerVersion() {
    return this.player.playerVersion
  },
})

const AdAdapter = youbora.Adapter.extend({
  getVersion() {
    return this.player.version
  },

  getDuration() {
    return this.player.duration
  },

  getIsVisible() {
    return this.player.isVisible
  },

  getIsSkippable() {
    return this.player.isSkippable
  },

  getIsFullscreen() {
    return this.player.isFullScreen
  },

  getAudioEnabled() {
    return this.player.audioEnabled
  },

  getClickThroughURL() {
    return this.player.clickThroughURL
  },
})

export function updatePlayHead({ adapter, currentTime }) {
  adapter.player.playHead = currentTime
  return adapter
}

function createPlugin({ form }) {
  const options = renameOptions(form)
  const plugin = new youbora.Plugin(options)
  plugin.setAdapter(new Adapter(createPlayer(options, form)))
  plugin.setAdsAdapter(new AdAdapter(createAdsPlayer(form)))
  return plugin
}

function renameOptions(options) {
  return Object.entries(options)
    .filter(pluginInfo)
    .filter(emptyFields)
    .map(renameFields)
    .reduce(joinFields, {})
}

function pluginInfo([key]) {
  return !key.startsWith("$")
}

function emptyFields([, value]) {
  return typeof value === "boolean" ? true : !!value
}

function renameFields([key, value]) {
  return [key.replace("-", "."), value]
}

function joinFields(full, [key, value]) {
  full[key] = value
  return full
}

function createPlayer(options, form) {
  return {
    version: form["$pluginVersion"],
    duration: parseInt(options["content.duration"]),
    playerName: form["$playerName"],
    playerVersion: form["$playerVersion"],
    playHead: 0,
  }
}

function createAdsPlayer(form) {
  return {
    duration: parseInt(form["$adsDuration"]),
    playHead: 0,
    isSkippable: form["$adsIsSkippable"],
    isFullScreen: form["$adsIsFullScreen"],
    isVisible: form["$adsIsVisible"],
    audioEnabled: form["$adsAudioEnabled"],
    version: form["$adsVersion"],
    clickThroughURL: form["$adsClickThroughURL"],
  }
}

function memoizer(fn) {
  const cache = new Map()
  return function (...args) {
    const key = JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

const createPluginMemoized = memoizer(createPlugin)

export { createPluginMemoized as createPlugin }
