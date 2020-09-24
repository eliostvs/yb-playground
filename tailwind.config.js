const plugin = require("tailwindcss/plugin")

function addRange({ addComponents, theme }) {
  const focus = {
    boxShadow: `0 0 0 4px ${theme("colors.blue.400")}`,
  }

  const active = {
    backgroundColor: theme("colors.red.600"),
  }

  const disabledThumb = {
    cursor: "not-allowed",
    backgroundColor: theme("colors.red.400"),
  }

  const disabledTrack = {
    cursor: "not-allowed",
  }

  const thumb = {
    appearance: "none",
    backgroundColor: theme("colors.red.600"),
    borderColor: "transparent",
    borderRadius: "9999px",
    borderWidth: "1px",
    boxSizing: "border-box",
    cursor: "pointer",
    height: "1rem",
    width: "1rem",
  }

  const track = {
    backgroundColor: "transparent",
    border: "0",
    boxSizing: "border-box",
    cursor: "pointer",
    height: "100%",
    margin: 0,
    padding: 0,
    width: "100%",
  }

  addComponents({
    ".form-range": {
      appearance: "none",
      backgroundColor: "transparent",
      height: "100%",
      padding: "0",
      width: "100%",
      "&:focus": {
        outline: "none",
        "&::-webkit-slider-thumb": focus,
        "&::-moz-range-thumb": focus,
        "&::-ms-thumb": focus,
      },
      "&::-moz-focus-outer": {
        border: "0",
      },
      "&:disabled": {
        cursor: "default",
        "&::-webkit-slider-thumb": disabledThumb,
        "&::-moz-range-thumb": disabledThumb,
        "&::-ms-thumb": disabledThumb,
        "&::-webkit-slider-runnable-track": disabledTrack,
        "&::-moz-range-track": disabledTrack,
        "&::-ms-fill-lower": disabledTrack,
        "&::-ms-fill-upper": disabledTrack,
      },
      // Chrome & Safari
      "&::-webkit-slider-thumb": {
        ...thumb,
        "&:active": active,
      },
      "&::-webkit-slider-runnable-track": track,
      // Firefox
      "&::-moz-range-thumb": {
        ...thumb,
        "&:active": active,
      },
      "&::-moz-range-track": track,
      // IE11 & Edge
      "&::-ms-thumb": {
        // remove added margin
        marginTop: "0",
        // prevent focus ring being cut off
        ...thumb,
        "&:active": active,
      },
      "&::-ms-track": track,
      "&::-ms-fill-lower": track,
      "&::-ms-fill-upper": track,
    },
  })
}

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto", "Helvetica", "Arial", "sans-serif"],
      },
      gridTemplateRows: {
        app: "auto repeat(2, 1fr)",
      },
      animation: {
        "pulse-fast": "pulse 1.5s linear infinite",
      },
    },
  },
  variants: {
    margin: ["responsive", "first"],
    padding: ["responsive", "first"],
  },
  plugins: [
    require("@tailwindcss/custom-forms"),
    require("tailwindcss-debug-screens"),
    plugin(addRange),
  ],
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
}
