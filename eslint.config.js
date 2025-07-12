import globals from "globals";
import js from "@eslint/js";
// I hate TS only using js
export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        App: "readonly",
        Page: "readonly",
        AppSideService: "readonly",
        GestureHandler: "readonly",
        __DEV__: "readonly",
        Speech: "readonly",
        hmUI: "readonly",
        DEVICE_CAPABILITIES: "readonly",
        createWidget: "readonly",
        widget: "readonly",
        DEVICE_WIDTH: "readonly",
        GestureManager: "readonly",
        gettext: "readonly",
        EventManager: "readonly",
        getDeviceInfo: "readonly",
        settingsManager: "readonly",
        logger: "readonly",
        accessibility: "readonly",
      },
    },
  },
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      parser: js.parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
    },
  },
];