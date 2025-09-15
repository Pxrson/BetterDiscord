/**
* @name ADifferentSearch
* @description Change the search engine used in the `Search With` feature.
* @author ace.
* @version 1.2.1
* @source https://raw.githubusercontent.com/AceLikesGhosts/bd-plugins/master/dist/ADifferentSearch/ADifferentSearch.plugin.js
* @authorLink https://github.com/AceLikesGhosts/bd-plugins
* @authorId 327639826075484162
*/
    
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// plugins/ADifferentSearch/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => ADifferentSearch,
  meta: () => config_default
});
module.exports = __toCommonJS(index_exports);

// lib/logger/index.ts
var DefaultColors = {
  PLUGIN_NAME: "color: purple; font-weight: bold;",
  PLUGIN_VERSION: "color: gray; font-size: 10px;"
};
function isError(err) {
  return err instanceof Error;
}
function getErrorMessage(error) {
  return `${error.name}: ${error.message}
At: ${error.stack}`;
}
var Logger = class {
  constructor(meta, colors = DefaultColors) {
    this._meta = meta;
    this._colors = colors;
  }
  print(type, message, ...data) {
    console[type](
      `%c[${this._meta.name}]%c(v${this._meta.version})`,
      this._colors.PLUGIN_NAME,
      this._colors.PLUGIN_VERSION,
      message,
      ...data
    );
  }
  debug(message, ...data) {
    return this.print("debug", message, ...data);
  }
  log(message, ...data) {
    return this.info(message, ...data);
  }
  info(message, ...data) {
    return this.print("log", isError(message) ? getErrorMessage(message) : message, ...data);
  }
  warn(message, ...data) {
    return this.print("warn", isError(message) ? getErrorMessage(message) : message, ...data);
  }
  error(message, ...data) {
    return this.critical(message, ...data);
  }
  critical(message, ...data) {
    return this.print("error", isError(message) ? getErrorMessage(message) : message, ...data);
  }
};

// plugins/ADifferentSearch/config.json
var config_default = {
  $schema: "../../config_schema.jsonc",
  name: "ADifferentSearch",
  description: "Change the search engine used in the `Search With` feature.",
  author: "ace.",
  version: "1.2.1",
  source: "https://raw.githubusercontent.com/AceLikesGhosts/bd-plugins/master/dist/ADifferentSearch/ADifferentSearch.plugin.js",
  authorLink: "https://github.com/AceLikesGhosts/bd-plugins",
  authorId: "327639826075484162"
};

// lib/components/index.ts
var Margins = /* @__PURE__ */ BdApi.Webpack.getByKeys("marginBottom40", "marginTop4");
var React = BdApi.React;
var ReactDom = BdApi.ReactDOM || BdApi.Webpack.getByKeys("createRoot");

// lib/components/Form.tsx
var FormTitle = BdApi.Webpack.getByStrings('["defaultMargin".concat', '="h5"', { searchExports: true });
var FormText = BdApi.Webpack.getByStrings(".SELECTABLE),", ".DISABLED:", { searchExports: true });
var FormSection = BdApi.Webpack.getBySource(".titleId)&&", { searchExports: true });
var FormSwitch = BdApi.Webpack.getByStrings(".labelRow", "useId", "DESCRIPTION", { searchExports: true });
var FormItem = BdApi.Webpack.getModule((x) => x.render.toString?.().includes(".fieldWrapper"), { searchExports: true });
var FormNotice = BdApi.Webpack.getByStrings(".Types.DANGER", ".formNotice", { searchExports: true });
var FormDivider = BdApi.Webpack.getBySource(".divider", ",style:", '"div"', "dividerDefault", { searchExports: true });

// lib/components/TextInput.tsx
var TextInput_default = BdApi.Webpack.getByStrings('"disabled","editable","inputRef",', "errorMessage", "setShouldValidate", { searchExports: true });

// lib/components/Radio.tsx
var RawRadioGroup = BdApi.Webpack.getByStrings("itemInfoClassName:", "radioItemClassName", "titleId", { searchExports: true });
function RadioItem(props) {
  return /* @__PURE__ */ React.createElement(
    FormItem,
    {
      ...props
    },
    /* @__PURE__ */ React.createElement(RawRadioGroup, { ...props })
  );
}

// plugins/ADifferentSearch/Settings.tsx
function TextInput(props) {
  return /* @__PURE__ */ React.createElement(
    FormItem,
    {
      style: {
        width: "50%"
      },
      className: Margins.marginBottom20,
      ...props
    },
    /* @__PURE__ */ React.createElement(
      TextInput_default,
      {
        ...props
      }
    )
  );
}
var DefaultProvidedSearchEngines = {
  startpage: "https://startpage.com/sp/search?query=",
  duckduckgo: "https://duckduckgo.com/?t=h_&q=",
  searX: "https://searx.be/search?q=",
  google: "https://google.com/search?q=",
  bing: "https://bing.com/search?q=",
  yandex: "https://yandex.com/search?text=",
  perplexity: "https://perplexity.ai/search?q=",
  yahoo: "https://yahoo.com/search?q=",
  aol: "https://search.aol.com/aol/search?q=",
  brave: "https://search.brave.com/search?q="
};
function Settings() {
  const [searchEngineName, setSearchEngineName] = React.useState(ADifferentSearch.settings.searchEngineName);
  const [searchEngineURL, setSearchEngineURL] = React.useState(ADifferentSearch.settings.searchEngineURL);
  React.useEffect(() => {
    ADifferentSearch.settings = {
      searchEngineName,
      searchEngineURL
    };
    BdApi.Data.save(config_default.name, "settings", ADifferentSearch.settings);
  }, [
    searchEngineName,
    searchEngineURL
  ]);
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(
    RadioItem,
    {
      title: "Search Engine",
      options: Object.keys(DefaultProvidedSearchEngines).map((k) => ({
        name: k,
        value: DefaultProvidedSearchEngines[k]
      })),
      onChange: (e) => {
        setSearchEngineName(e.name.toString());
        setSearchEngineURL(e.value.toString());
      },
      className: Margins.marginBottom20,
      value: searchEngineURL
    }
  ), /* @__PURE__ */ React.createElement(FormText, { className: Margins.marginBottom20 }, "or manually provide a search engine"), /* @__PURE__ */ React.createElement(
    TextInput,
    {
      title: "Search Engine Name",
      value: searchEngineName,
      onChange: (e) => {
        setSearchEngineName(e);
      }
    }
  ), /* @__PURE__ */ React.createElement(
    TextInput,
    {
      title: "Search Engine URL",
      value: searchEngineURL,
      onChange: (e) => {
        setSearchEngineURL(e);
      }
    }
  ));
}

// plugins/ADifferentSearch/index.ts
var logger = new Logger(config_default);
var DefaultSettings = {
  searchEngineName: "startpage",
  searchEngineURL: "https://startpage.com/sp/search?query="
};
var capitalise = (str) => str[0].toUpperCase() + str.slice(1, str.length);
var ADifferentSearch = class _ADifferentSearch {
  static {
    this.settings = DefaultSettings;
  }
  start() {
    logger.info("started");
    logger.info("Loading settings.");
    _ADifferentSearch.settings = {
      ...DefaultSettings,
      ...BdApi.Data.load(config_default.name, "settings")
    };
    const [mod, key] = BdApi.Webpack.getWithKey(
      BdApi.Webpack.Filters.byStrings("search-google")
    );
    BdApi.Patcher.after(config_default.name, mod, key, (_, args, ret) => {
      if (!args[0] || typeof args[0] !== "string" || !Array.isArray(ret) || !ret[0]) {
        return;
      }
      ret[0].props.label = `Search with ${capitalise(_ADifferentSearch.settings.searchEngineName)}`;
      BdApi.Patcher.instead(config_default.name, ret[0].props, "action", () => {
        window.open(
          _ADifferentSearch.settings.searchEngineURL + args[0]
        );
      });
    });
  }
  stop() {
    logger.info("stopped");
    logger.info("Saving settings.");
    BdApi.Data.save(config_default.name, "settings", _ADifferentSearch.settings);
    logger.info("Unpatching");
    BdApi.Patcher.unpatchAll(config_default.name);
  }
  getSettingsPanel() {
    return Settings;
  }
};
