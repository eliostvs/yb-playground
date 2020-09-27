import React from "react"
import PropTypes from "prop-types"
import { assign, Machine } from "xstate"
import { useService } from "@xstate/react"

import { createPlugin } from "./youbora"

const MILLIS = 1000

const contextFactory = {
  plugin: (context) => createPlugin(context.form),
  adapter: null,
  currentTime: 0,
  duration: 60,
  interval: 1,
}

function setupTickInterval({ interval }) {
  return function (cb) {
    const intervalId = setInterval(() => cb("TICK"), MILLIS * interval)

    return function () {
      clearInterval(intervalId)
    }
  }
}

const saveAdapter = assign({
  adapter: (context) => context.plugin.getAdapter(),
})

const setCurrentTime = assign({
  currentTime: (context, event) =>
    Math.floor(context.duration * (event.data / 100)),
})

const updateCurrentTime = assign({
  currentTime: (context) => context.currentTime + context.interval,
})

const updateAdapterPlayHead = assign({
  adapter: updatePlayHead,
})

function atEnd({ currentTime, duration }) {
  return currentTime >= duration
}

function formatCurrentTime(currentTime) {
  const minutes = toMinutes(currentTime)
  return `${padStart(minutes)}:${padStart(toSeconds(currentTime, minutes))}`
}

function padStart(number) {
  return number.toString().padStart(2, "0")
}

function toMinutes(seconds) {
  return Math.floor(seconds / 60)
}

function toSeconds(totalSeconds, minutes) {
  return totalSeconds - minutes * 60
}

function fireQuartile({ currentTime, duration, adapter }) {
  const quartile = currentTime / duration

  switch (true) {
    case quartile >= 0.75: {
      return adapter.fireQuartile(3)
    }
    case quartile >= 0.5: {
      return adapter.fireQuartile(2)
    }
    case quartile >= 0.25: {
      return adapter.fireQuartile(1)
    }
  }
}

function fireInit({ adapter }) {
  adapter.fireInit()
}

function fireJoin({ adapter }) {
  adapter.fireJoin()
}

function fireStop({ adapter }) {
  adapter.fireStop()
}

function firePause({ adapter }) {
  adapter.firePause()
}

function fireResume({ adapter }) {
  adapter.fireResume()
}

function fireSeekBegin({ adapter }) {
  adapter.fireSeekBegin()
}

function fireSeekEnd({ adapter }) {
  adapter.fireSeekEnd()
}

function fireBufferBegin({ adapter }) {
  adapter.fireBufferBegin()
}

function fireBufferEnd({ adapter }) {
  adapter.fireBufferEnd()
}

function fireAdSkip({ adapter }) {
  adapter.fireSkip()
}

function fireFatalError({ adapter }) {
  adapter.fireFatalError("error-code", "error-description")
}

function fireAdManifest({ adapter }) {
  adapter.fireManifest()
}

function fireAdBreakStart({ adapter }) {
  adapter.fireBreakStart()
}

function fireAdBreakStop({ adapter }) {
  adapter.fireBreakStop()
}

function fireStart({ adapter }) {
  adapter.fireStart()
}

function fireAdClick({ adapter }) {
  adapter.fireClick(adapter.getClickThroughURL())
}

function getAdsAdapter({ plugin, duration }) {
  const adapter = plugin.getAdsAdapter()
  adapter.setPosition(duration)
  return adapter
}

function updatePlayHead({ adapter, currentTime }) {
  adapter.player.playHead = currentTime
  return adapter
}

function getAdsDuration({ plugin }) {
  return plugin.getAdsAdapter().getDuration()
}

const adsMachine = Machine({
  id: "ads",
  initial: "ready",
  context: {
    adapter: null,
    currentTime: 0,
    duration: 0,
    interval: 1,
  },
  on: {
    ERROR: { target: "stopped", actions: [fireFatalError] },
    STOP: { target: "stopped", actions: [fireStop] },
  },
  states: {
    ready: {
      entry: [fireStart, fireAdManifest],
      on: {
        PLAY: { target: "playing" },
      },
    },
    playing: {
      initial: "normal",
      entry: [fireAdBreakStart],
      on: {
        SKIP: { target: "stopped", actions: [fireAdSkip] },
        CLICK: { actions: [fireAdClick] },
      },
      states: {
        normal: {
          entry: [fireJoin],
          invoke: { src: setupTickInterval },
          on: {
            PAUSE: { target: "paused", actions: [firePause] },
            TICK: {
              actions: [updateCurrentTime, updateAdapterPlayHead, fireQuartile],
            },
          },
          always: [
            {
              target: "#ads.stopped",
              cond: atEnd,
              actions: [fireStop, fireAdBreakStop],
            },
          ],
        },
        paused: {
          on: {
            PLAY: { target: "normal", actions: [fireResume] },
          },
        },
      },
    },
    stopped: {
      type: "final",
    },
  },
})

const playerMachine = Machine({
  id: "player",
  initial: "ready",
  context: {
    plugin: {},
    adapter: null,
    currentTime: 0,
    duration: 0,
    interval: 1,
  },
  on: {
    ERROR: { target: "stopped", actions: [fireFatalError] },
    STOP: { target: "stopped" },
  },
  states: {
    ready: {
      entry: [saveAdapter, fireInit],
      on: {
        PLAY: { target: "playing" },
        STARTED_ADS: { target: "ads" },
      },
    },
    playing: {
      initial: "normal",
      on: {
        STARTED_SCRUBBING: { target: "#player.scrubbing" },
        BUFFER: { target: "#player.buffering" },
        STARTED_ADS: { target: "#player.ads", actions: [firePause] },
      },
      states: {
        hist: { type: "history" },
        normal: {
          entry: [fireJoin, fireResume],
          invoke: { src: setupTickInterval },
          always: [
            {
              target: "#player.stopped",
              cond: atEnd,
            },
          ],
          on: {
            PAUSE: { target: "paused", actions: [firePause] },
            TICK: { actions: [updateCurrentTime, updateAdapterPlayHead] },
          },
        },
        paused: {
          on: {
            PLAY: { target: "normal" },
          },
        },
      },
    },
    scrubbing: {
      entry: [fireSeekBegin],
      exit: [updatePlayHead, fireSeekEnd],
      on: {
        STOPPED_SCRUBBING: { target: "playing.hist" },
        SET_PROGRESS: { actions: setCurrentTime },
      },
    },
    buffering: {
      entry: [fireBufferBegin],
      exit: [fireBufferEnd],
      on: {
        PLAY: { target: "playing" },
      },
    },
    stopped: {
      entry: [fireStop],
      type: "final",
    },
    ads: {
      invoke: {
        id: "ads",
        src: adsMachine,
        data: {
          adapter: getAdsAdapter,
          duration: getAdsDuration,
          interval: (context) => context.interval,
          currentTime: 0,
        },
        onDone: { target: "playing.hist", actions: [fireResume] },
      },
    },
  },
})

function Section({ actor }) {
  return (
    <section className="flex flex-col items-center gap-4 pb-4 mt-4 md:justify-center md:mt-0 md:col-span-2 md:row-span-2 bg-color-gray-100">
      {actor ? <Players actor={actor} /> : <Fallback />}
    </section>
  )
}

Section.propTypes = {
  actor: PropTypes.object,
}

function Fallback() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-32 h-32 px-4 px-8 text-indigo-200 md:w-40 md:h-40 xl:md-64 xl:w-64"
      stroke="currentColor"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  )
}

function Players({ actor }) {
  const [state, send] = useService(actor)

  return (
    <>
      {state.children.ads ? (
        <AdsPlayer actor={state.children.ads} />
      ) : (
        <MainPlayer state={state} send={send} />
      )}
    </>
  )
}

Players.propTypes = {
  actor: PropTypes.object.isRequired,
}

function MainPlayer({ state, send }) {
  return (
    <div className="w-4/5 p-4 bg-gray-100 border rounded-lg shadow md:w-auto">
      <CurrentTime state={state} bgColor="bg-red-300" />
      <SeekBar
        currentTime={state.context.currentTime}
        duration={state.context.duration}
        onMouseDown={() => send("STARTED_SCRUBBING")}
        onInput={(e) => send("SET_PROGRESS", { data: e.target.value })}
        onMouseUp={() => send("STOPPED_SCRUBBING")}
        disabled={!matchesAny(state, ["playing", "scrubbing"])}
      />
      <div className="flex justify-between gap-2 mt-2">
        <PlayButton state={state} send={send} />
        <PauseButton state={state} send={send} />
        <StopButton state={state} send={send} />
        <ErrorButton state={state} send={send} />
        <BufferButton state={state} send={send} />
        <AdsButton state={state} send={send} />
      </div>
    </div>
  )
}

const SendPropTypes = {
  send: PropTypes.func.isRequired,
}

const StatePropTypes = {
  state: PropTypes.shape({
    context: PropTypes.shape({
      currentTime: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
}

MainPlayer.propTypes = {
  ...SendPropTypes,
  ...StatePropTypes,
}

function CurrentTime({ state, bgColor }) {
  const animatePulse = whenIn(state, {
    "playing.paused buffering": "animate-pulse-fast",
  })

  return (
    <div className={`${bgColor} rounded-lg`}>
      <h2
        className={`py-2 font-mono text-6xl font-bold text-center text-gray-200 text-gray-800 md:py-4 ${animatePulse}`}
      >
        {formatCurrentTime(state.context.currentTime)}
      </h2>
    </div>
  )
}

CurrentTime.propTypes = {
  ...StatePropTypes,
  bgColor: PropTypes.string.isRequired,
}

function SeekBar({
  currentTime,
  disabled,
  duration,
  onInput,
  onMouseDown,
  onMouseUp,
}) {
  const bgColor = disabled ? "bg-red-400" : "bg-red-600 cursor-pointer"
  const progress = calculateProgress(currentTime, duration)

  return (
    <div className="flex items-center justify-center py-2 mt-2">
      <div className="relative min-w-full py-1">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className={`absolute w-0 h-2 rounded-full pointer-events-none ${bgColor}`}
            style={{ width: `${progress}%` }}
          />
          <input
            className="absolute top-0 h-4 form-range"
            disabled={disabled}
            max="100"
            min="0"
            onChange={() => null} // suppress react warning
            onInput={onInput}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            step="1"
            type="range"
            value={progress}
          />
        </div>
      </div>
    </div>
  )
}

SeekBar.propTypes = {
  currentTime: PropTypes.number.isRequired,
  disabled: PropTypes.bool.isRequired,
  duration: PropTypes.number.isRequired,
  onInput: PropTypes.func,
  onMouseDown: PropTypes.func,
  onMouseUp: PropTypes.func,
}

function calculateProgress(currentTime, duration) {
  return (currentTime / duration) * 100
}

function AdsPlayer({ actor }) {
  const [state, send] = useService(actor)

  return (
    <div className="w-4/5 p-4 bg-gray-100 border rounded-lg shadow md:w-auto">
      <CurrentTime state={state} bgColor="bg-green-200" />
      <SeekBar
        currentTime={state.context.currentTime}
        duration={state.context.duration}
        disabled={!state.matches("playing")}
      />
      <div className="flex justify-between gap-2 mt-2">
        <PlayButton state={state} send={send} />
        <PauseButton state={state} send={send} />
        <ClickAdButton state={state} send={send} />
        <SkipAdButton state={state} send={send} />
        <StopButton state={state} send={send} />
        <ErrorButton state={state} send={send} />
      </div>
    </div>
  )
}

AdsPlayer.propTypes = {
  actor: PropTypes.object.isRequired,
}

function ClickAdButton({ state, send }) {
  return (
    <Button
      enabled={state.matches("playing.normal")}
      onClick={() => send("CLICK")}
    >
      <EyeIcon />
    </Button>
  )
}

ClickAdButton.propTypes = {
  ...StatePropTypes,
  ...SendPropTypes,
}

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3 h-3 md:w-5 md:h-5"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function SkipAdButton({ state, send }) {
  return (
    <Button
      enabled={state.matches("playing.normal")}
      onClick={() => send("SKIP")}
    >
      <LogOutIcon />
    </Button>
  )
}

SkipAdButton.propTypes = {
  ...StatePropTypes,
  ...SendPropTypes,
}

function LogOutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3 h-3 md:w-5 md:h-5"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function PlayButton({ state, send }) {
  return (
    <Button
      enabled={matchesAny(state, ["ready", "playing.paused", "buffering"])}
      onClick={() => send("PLAY")}
    >
      <PlayIcon />
    </Button>
  )
}

PlayButton.propTypes = {
  ...StatePropTypes,
  ...SendPropTypes,
}

function PlayIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3 h-3 md:w-5 md:h-5"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

function PauseButton({ state, send }) {
  return (
    <Button
      enabled={matchesAny(state, ["playing.normal"])}
      onClick={() => send("PAUSE")}
    >
      <PauseIcon />
    </Button>
  )
}

PauseButton.propTypes = {
  ...StatePropTypes,
  ...SendPropTypes,
}

function PauseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3 h-3 md:w-5 md:h-5"
    >
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  )
}

function StopButton({ state, send }) {
  return (
    <Button
      onClick={() => send("STOP")}
      enabled={matchesAny(state, ["ready", "playing", "buffering"])}
    >
      <StopIcon />
    </Button>
  )
}

StopButton.propTypes = {
  ...StatePropTypes,
  ...SendPropTypes,
}

function StopIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3 h-3 md:w-5 md:h-5"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    </svg>
  )
}

function ErrorButton({ state, send }) {
  return (
    <Button
      enabled={matchesAny(state, ["ready", "playing", "buffering"])}
      onClick={() => send("ERROR")}
    >
      <ErrorIcon />
    </Button>
  )
}

ErrorButton.propTypes = {
  ...StatePropTypes,
  ...SendPropTypes,
}

function ErrorIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3 h-3 md:w-5 md:h-5"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function BufferButton({ state, send }) {
  return (
    <Button
      onClick={() => send("BUFFER")}
      enabled={state.matches("playing.normal")}
    >
      <WifiOffIcon />
    </Button>
  )
}

BufferButton.propTypes = {
  ...StatePropTypes,
  ...SendPropTypes,
}

function DollarSignIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3 h-3 md:w-5 md:h-5"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function AdsButton({ state, send }) {
  return (
    <Button
      onClick={() => send("STARTED_ADS")}
      enabled={state.matches("playing")}
    >
      <DollarSignIcon />
    </Button>
  )
}

AdsButton.propTypes = {
  ...StatePropTypes,
  ...SendPropTypes,
}

function Button({ children, onClick, enabled = false }) {
  const extraStyle = enabled
    ? "bg-blue-600 hover:bg-blue-700"
    : "bg-blue-300 cursor-not-allowed"

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-4 py-2 font-bold text-gray-100 transition duration-150 ease-in-out rounded focus:outline-none ${extraStyle}`}
    >
      {children}
    </button>
  )
}

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.element,
  enabled: PropTypes.bool,
}

function WifiOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3 h-3 md:w-5 md:h-5"
    >
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  )
}

function whenIn(state, states = {}, _default = "") {
  const matched = Object.entries(states)
    .filter(([name]) => matchesAny(state, name.split(" ")))
    .map(([, value]) => value)
  return matched.length ? matched[0] : _default
}

function matchesAny(state, names) {
  return Object.values(names).some((name) => state.matches(name))
}

export { Section, playerMachine, contextFactory }
