/**
 * @name Timezones
 * @author TheCommieAxolotl#0001
 * @description Allows you to display other Users' local times.
 * @version 1.4.2
 * @authorId 538487970408300544
 * @invite 5BSWtSM3XU
 * @source https://github.com/TheCommieAxolotl/BetterDiscord-Stuff/tree/main/Timezones
 * @updateurl https://raw.githubusercontent.com/TheCommieAxolotl/BetterDiscord-Stuff/main/Timezones/Timezones.plugin.js
 * @donate https://github.com/sponsors/thecommieaxolotl
 */

const { Data, React, DOM, Webpack, ContextMenu, UI, Components, Patcher } = new BdApi('Timezones');

const baseConfig = {
    info: {
        name: "Timezones",
        authors: [
            {
                name: "TheCommieAxolotl",
                discord_id: "538487970408300544",
            },
        ],
        github_raw: "https://raw.githubusercontent.com/TheCommieAxolotl/BetterDiscord-Stuff/main/Timezones/Timezones.plugin.js",
        version: "1.4.2",
        description: "Allows you to display other Users' local times.",
    },
    defaultConfig: [
        {
            type: "switch",
            id: "twentyFourHours",
            name: "24 Hour Time",
            value: false,
        },
        {
            type: "switch",
            id: "showInMessage",
            name: "Show local timestamp next to message",
            value: true,
        },
        {
            type: "switch",
            id: "showOffset",
            name: "Show localized GMT format (e.g., GMT-8)",
            value: false,
        },
    ],
};

const DataStore = new Proxy(
    {},
    {
        get: (_, key) => {
            if (key === 'settings') {
                const savedSettings = Data.load(key) || {};
                return baseConfig.defaultConfig.reduce((acc, setting) => {
                    acc[setting.id] = savedSettings[setting.id] ?? setting.value;
                    return acc;
                }, {});
            }
            return Data.load(key);
        },
        set: (_, key, value) => {
            Data.save(key, value);
            return true;
        },
        deleteProperty: (_, key) => {
            Data.delete(key);
            return true;
        },
    }
);

function loadDefaults()
{
    if (!Data.load('settings')) {
        DataStore.settings = baseConfig.defaultConfig.reduce((acc, setting) => {
            acc[setting.id] = setting.value;
            return acc;
        }, {});
    }
}

const config = {
    ...baseConfig,
    defaultConfig: baseConfig.defaultConfig.map(setting => ({
        ...setting,
        value: DataStore.settings[setting.id]
    }))
};

const Styles = `
.timezone {
    margin-left: 0.5rem;
    font-size: 0.75rem;
    line-height: 1.375rem;
    color: var(--text-muted);
    vertical-align: baseline;
    display: inline-block;
    height: 1.25rem;
    cursor: default;
    font-weight: 500;
}

[class*="compact"] .timezone {
    display: inline;
}

.timezone-margin-top {
    margin-top: 0.5rem;
}

.timezone-banner-container {
    position: relative;
}

.timezone-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    background: var(--profile-body-background-color, var(--background-primary));
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    color: var(--text-normal);
}
`;

const Markdown = Webpack.getModule((m) => m?.rules && m?.defaultProps?.parser);
const SearchableSelect = Webpack.getModule(x=>x.render.toString().includes('.focusFirstVisibleItem())},['),{searchExports:true})
const ProfileBanner = Webpack.getByStrings('"canUsePremiumProfileCustomization"', { defaultExport: false });
const MessageHeader = Webpack.getModule(Webpack.Filters.byStrings("userOverride", "withMentionPrefix"), { defaultExport: false });
const Tooltip = Components.Tooltip;
const i18n = Webpack.getByKeys("getLocale");

const TimezonesPanel = () => {
    const [settings, setSettings] = React.useState({ ...DataStore.settings });

    const handleSettingChange = (id, value) => {
        setSettings(prevSettings => {
            const newSettings = {
                ...prevSettings,
                [id]: value
            };
            DataStore.settings = newSettings;
            return newSettings;
        });
    };

    return UI.buildSettingsPanel({
        settings: config.defaultConfig.map(setting => ({
            ...setting,
            value: settings[setting.id]
        })),
        onChange: (_, id, value) => handleSettingChange(id, value)
    });
};

class Timezones {
    constructor()
    {
        loadDefaults();
    }

    start() {
        DOM.addStyle("Timezones-Styles", Styles);

        ContextMenu.patch("user-context", this.userContextPatch);

        Patcher.after(ProfileBanner, "Z", (_, [props], ret) => {
            if (!this.hasTimezone(props.user.id)) return;
            ret.props.children = React.createElement(Tooltip, {
                text:
                    this.getTime(props.user.id, Date.now(), { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric" }) +
                    ` (${DataStore[props.user.id]})`,
                children: (p) => React.createElement("div", { ...p, className: "timezone-badge" }, this.getTime(props.user.id, Date.now(), { hour: "numeric", minute: "numeric" })),
            });
        });

        Patcher.after(MessageHeader, "Z", (_, [props], ret) => {
            if (props.isRepliedMessage || !DataStore.settings.showInMessage) return;

            if (!this.hasTimezone(props.message.author.id)) return;

            ret.props.children.push(
                React.createElement(Tooltip, {
                    text:
                        this.getTime(props.message.author.id, props.message.timestamp, {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                        }) + ` (${DataStore[props.message.author.id]})`,
                    children: (p) =>
                        React.createElement(
                            "span",
                            { ...p, className: "timezone" },
                            this.getTime(props.message.author.id, props.message.timestamp, { hour: "numeric", minute: "numeric" })
                        ),
                })
            );
        });
    }

    userContextPatch = (ret, props) => {
        const isDM = !Array.isArray(ret.props.children[0].props.children);

        (isDM ? ret.props.children : ret.props.children[0].props.children).push([
            ContextMenu.buildItem({ type: "separator" }),
            ContextMenu.buildItem({
                type: "submenu",
                label: "Timezones",
                children: [
                    DataStore[props.user.id] &&
                    ContextMenu.buildItem({
                        type: "text",
                        disabled: true,
                        label: DataStore[props.user.id],
                    }),
                    ContextMenu.buildItem({
                        label: DataStore[props.user.id] ? "Change Timezone" : "Set Timezone",
                        action: () => {
                            return this.setTimezone(props.user.id, props.user);
                        },
                    }),
                    ContextMenu.buildItem({
                        label: "Remove Timezone",
                        danger: true,
                        disabled: !this.hasTimezone(props.user.id),
                        action: () => {
                            return this.removeTimezone(props.user.id, props.user);
                        },
                    }),
                ].filter((x) => x),
            }),
        ]);
    };

    hasTimezone(id) {
        const value = DataStore[id];
        return !Array.isArray(value) && !!value;
    }

    setTimezone(id, user) {
        let outvalue = null;

        const options = Intl.supportedValuesOf("timeZone").map((timezone) => {
            const offset = new Intl.DateTimeFormat(undefined, { timeZone: timezone, timeZoneName: "short" })
                .formatToParts(new Date())
                .find((part) => part.type === "timeZoneName").value;

            return { label: `${timezone} (${offset})`, value: timezone };
        });

        UI.showConfirmationModal(
            `Set Timezone for ${user.username}`,
            [
                React.createElement(Markdown, null, "Please select a timezone."),
                React.createElement(() => {
                    const [currentValue, setCurrentValue] = React.useState(DataStore[id] || null);

                    return React.createElement(SearchableSelect, {
                        options,
                        value: options.find((o) => o.value === currentValue),
                        placeholder: "Select a Timezone",
                        maxVisibleItems: 5,
                        closeOnSelect: true,
                        onChange: (value) => {
                            setCurrentValue(value);
                            outvalue = value;
                        },
                    });
                }),
            ],
            {
                confirmText: "Set",
                onConfirm: () => {
                    DataStore[id] = outvalue;

                    UI.showToast(`Timezone set to ${outvalue} for ${user.username}`, {
                        type: "success",
                    });
                },
            }
        );
    }

    removeTimezone(id, user) {
        delete DataStore[id];

        UI.showToast(`Timezone removed for ${user.username}`, {
            type: "success",
        });
    }

    getTime(id, time, props) {
        const timezone = DataStore[id];

        if (!timezone) return null;

        const date = new Date(time);

        const formatter = new Intl.DateTimeFormat(i18n?.getLocale?.() ?? "en-US", {
            hourCycle: DataStore.settings.twentyFourHours ? "h23" : "h12",
            timeZone: timezone,
            timeZoneName: DataStore.settings.showOffset ? "shortOffset" : undefined,
            ...props,
        });

        return formatter.format(date);
    }

    stop() {
        Patcher.unpatchAll();
        ContextMenu.unpatch("user-context", this.userContextPatch);
        DOM.removeStyle("Timezones-Styles");
    }

    getSettingsPanel() {
        return React.createElement(TimezonesPanel);
    }
}

module.exports = Timezones;
