import React from "react"
import { assign, Machine } from "xstate"
import { useMachine } from "@xstate/react"

import {
  contextFactory as playerContext,
  playerMachine,
  Section as PlayerSection,
} from "./Player"
import { Section as FormSection } from "./Form"

const saveForm = assign({ form: (context, event) => event.data })
const cleanContext = assign({ form: {} })
const cleanForm = (context, event) => event.cleanup()

const appState = Machine({
  id: "app",
  initial: "form",
  context: {
    form: {},
  },
  states: {
    form: {
      on: {
        START: {
          target: "player",
          actions: [saveForm],
        },
        RESET: { actions: [cleanContext, cleanForm] },
      },
    },
    player: {
      invoke: {
        id: "player",
        src: playerMachine,
        data: playerContext,
        onDone: "form",
      },
    },
  },
})

function App() {
  return (
    <div className="grid h-full grid-cols-1 md:grid-cols-4 lg:grid-cols-3 md:grid-rows-app">
      <header className="flex items-center col-span-1 row-span-1 p-4 text-indigo-800 shadow-md md:p-2 sm:col-span-4 lg:col-span-3">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-12 h-12">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
            clipRule="evenodd"
          />
        </svg>
        <h1 className="px-2 pt-1 text-xl font-extrabold tracking-wide uppercase sm:text-4xl">
          Youbora Playground
        </h1>
      </header>

      <Main />
    </div>
  )
}

function Main() {
  const devTools = process.env.NODE_ENV === "development"
  const [state, send] = useMachine(appState, { devTools })

  function onSubmit(data) {
    send("START", { data })
  }

  function onReset(cleanup) {
    send("RESET", { cleanup })
  }

  return (
    <main className="contents">
      <FormSection
        onSubmit={onSubmit}
        onReset={onReset}
        disabled={state.matches("player")}
      />
      <PlayerSection actor={state.children.player} />
    </main>
  )
}

export { App }
