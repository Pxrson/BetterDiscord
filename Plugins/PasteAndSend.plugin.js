/**
 * @name PasteAndSend
 * @description Adds a "Paste and Send" button to context menus in message boxes so you don't ever have to touch your keyboard to paste and send a message from your clipboard.
 * @version 1.0.0
 * @author ak-tr
 * @authorLink https://akif.kr
 * @website https://github.com/ak-tr/BetterDiscordPlugins/tree/master/Plugins/PasteAndSend
 * @source https://raw.githubusercontent.com/ak-tr/BetterDiscordPlugins/master/Plugins/PasteAndSend/PasteAndSend.plugin.js
 */
/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();

@else@*/
const config = {
    main: "index.js",
    name: "PasteAndSend",
    author: "ak-tr",
    authorLink: "https://akif.kr",
    version: "1.0.0",
    description: "Adds a \"Paste and Send\" button to context menus in message boxes so you don't ever have to touch your keyboard to paste and send a message from your clipboard.",
    github: "https://github.com/ak-tr/BetterDiscordPlugins/tree/master/Plugins/PasteAndSend",
    github_raw: "https://raw.githubusercontent.com/ak-tr/BetterDiscordPlugins/master/Plugins/PasteAndSend/PasteAndSend.plugin.js",
    changelog: [],
    defaultConfig: []
};
class Dummy {
    constructor() {this._config = config;}
    start() {}
    stop() {}
}
 
if (!global.ZeresPluginLibrary) {
    BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.name ?? config.info.name} is missing. Please click Download Now to install it.`, {
        confirmText: "Download Now",
        cancelText: "Cancel",
        onConfirm: () => {
            require("request").get("https://betterdiscord.app/gh-redirect?id=9", async (err, resp, body) => {
                if (err) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                if (resp.statusCode === 302) {
                    require("request").get(resp.headers.location, async (error, response, content) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), content, r));
                    });
                }
                else {
                    await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                }
            });
        }
    });
}
 
module.exports = !global.ZeresPluginLibrary ? Dummy : (([Plugin, Api]) => {
     const plugin = (Plugin, Library) => {
    const { Logger } = Library;
    const { ContextMenu } = window.BdApi;

    return class PasteAndSend extends Plugin {
        onStart() {
            try {
                this.patchContextMenu();
                Logger.info("Plugin enabled, context menu patched!");
            } catch (err) {
                Logger.info("Errored while patching.");
                Logger.info(err);
            }
        }

        onStop() {
            this.contextMenuPatch?.();
            Logger.info("Plugin disabled, context menu unpatched!");
        }

        patchContextMenu() {
            // Extract callback to global scope as it is required for unpatching
            const callback = (tree, props) => {
                // Prepare target and keyboard event
                const target = props.target;
                const enterEvent = new KeyboardEvent("keydown", {
                    key: "Enter",
                    code: "Enter",
                    keyCode: 13,
                    which: 13,
                    bubbles: true, // Make sure the event bubbles
                    cancelable: false,
                });

                const copyGroup =
                    tree.props.children[tree.props.children.length - 1];
                copyGroup.props.children.push(
                    ContextMenu.buildItem({
                        id: "pas-button",
                        label: "Paste and Send",
                        action: async () => {
                            // Paste...
                            DiscordNative.clipboard.paste();
                            // ...and send
                            setTimeout(() => {
                                const result = target.dispatchEvent(enterEvent);
                            }, 75);
                        },
                    })
                );
            };

            this.contextMenuPatch = ContextMenu.patch(
                "textarea-context",
                callback
            );
        }
    };
};
     return plugin(Plugin, Api);
})(global.ZeresPluginLibrary.buildPlugin(config));
/*@end@*/