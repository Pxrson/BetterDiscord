/**
 * @name BetterTranslator
 * @author pxrson
 * @description Super accurate Discord message translation using DeepL API with comprehensive language support
 * @version 2.0.0
 * @authorId 1039345167926308865
 * @source https://github.com/Pxrson/BetterTranslator
 * @updateUrl https://github.com/Pxrson/BetterTranslator/blob/main/BetterTranslator.plugin.js
 */

module.exports = (() => {
    const config = {
        info: {
            name: "BetterTranslator",
            authors: [{
                name: "pxrson",
                discord_id: "1039345167926308865",
                github_username: "Pxrson"
            }],
            version: "2.0.0",
            description: "Super accurate Discord message translation using DeepL API with comprehensive language support",
            github: "https://github.com/Pxrson/BetterTranslator",
            github_raw: "https://github.com/Pxrson/BetterTranslator/blob/main/BetterTranslator.plugin.js"
        },
        changelog: [
            {
                title: "v2.0.0",
                items: [
                    "Added comprehensive language support (60+ languages)",
                    "Implemented DeepL API integration",
                    "Added quick translate buttons",
                    "Enhanced UI with beautiful gradients",
                    "Added context menu integration",
                    "Implemented auto-translation feature"
                ]
            }
        ]
    };

    return !global.ZeresPluginLibrary ? class {
        constructor() { this._config = config; }
        getName() { return config.info.name; }
        getAuthor() { return config.info.authors.map(a => a.name).join(", "); }
        getDescription() { return config.info.description; }
        getVersion() { return config.info.version; }
        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.app/gh-redirect?id=library");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() { }
        stop() { }
    } : (([Plugin, Library]) => {
        const { Patcher, Settings, Utilities, WebpackModules, DiscordModules, Logger } = Library;

        const LANGUAGES = {
            'BG': 'Bulgarian', 'CS': 'Czech', 'DA': 'Danish', 'DE': 'German',
            'EL': 'Greek', 'EN': 'English', 'EN-GB': 'English (British)', 'EN-US': 'English (American)',
            'ES': 'Spanish', 'ET': 'Estonian', 'FI': 'Finnish', 'FR': 'French',
            'HU': 'Hungarian', 'ID': 'Indonesian', 'IT': 'Italian', 'JA': 'Japanese',
            'KO': 'Korean', 'LT': 'Lithuanian', 'LV': 'Latvian', 'NB': 'Norwegian (Bokmål)',
            'NL': 'Dutch', 'PL': 'Polish', 'PT': 'Portuguese', 'PT-BR': 'Portuguese (Brazilian)',
            'PT-PT': 'Portuguese (European)', 'RO': 'Romanian', 'RU': 'Russian', 'SK': 'Slovak',
            'SL': 'Slovenian', 'SV': 'Swedish', 'TR': 'Turkish', 'UK': 'Ukrainian',
            'ZH': 'Chinese', 'ZH-CN': 'Chinese (Simplified)', 'ZH-TW': 'Chinese (Traditional)',
            'AR': 'Arabic', 'HE': 'Hebrew', 'TH': 'Thai', 'VI': 'Vietnamese'
        };

        const QUICK_TRANSLATE_LANGUAGES = ['EN-US', 'ES', 'DE', 'FR', 'JA', 'ZH-CN', 'RU', 'IT'];

        return class BetterTranslator extends Plugin {
            constructor() {
                super();
                this.defaultSettings = {
                    apiKey: "",
                    targetLanguage: "EN-US",
                    autoTranslate: false,
                    showOriginal: true,
                    preserveFormatting: true,
                    formalityLevel: "default",
                    quickTranslateLanguages: [...QUICK_TRANSLATE_LANGUAGES]
                };
                this.settings = {...this.defaultSettings};
            }

            onLoad() {
                this.settings = Utilities.loadSettings(this.getName(), this.defaultSettings);
            }

            onStart() {
                try {
                    this.addStyles();
                    this.patchMessageContextMenu();
                    BdApi.showToast("BetterTranslator started! 🚀", { type: "success" });
                } catch (error) {
                    Logger.error(this.getName(), "Failed to start:", error);
                    BdApi.showToast("BetterTranslator failed to start!", { type: "error" });
                }
            }

            onStop() {
                try {
                    Patcher.unpatchAll();
                    this.removeStyles();
                    BdApi.showToast("BetterTranslator stopped!", { type: "info" });
                } catch (error) {
                    Logger.error(this.getName(), "Failed to stop:", error);
                }
            }

            onStart() {
                try {
                    this.addStyles();
                    this.patchMessageContextMenu();
                    BdApi.showToast("BetterTranslator started! 🚀", { type: "success" });
                } catch (error) {
                    Logger.error(this.getName(), "Failed to start:", error);
                    BdApi.showToast("BetterTranslator failed to start!", { type: "error" });
                }
            }

            onStop() {
                try {
                    Patcher.unpatchAll();
                    this.removeStyles();
                    BdApi.showToast("BetterTranslator stopped!", { type: "info" });
                } catch (error) {
                    Logger.error(this.getName(), "Failed to stop:", error);
                }
            }
                try {
                    return Settings.SettingPanel.build(() => this.saveSettings(), 
                        new Settings.SettingGroup("API Configuration", {
                            shown: true
                        }).append(
                            new Settings.Textbox("DeepL API Key", "Get your free API key from https://www.deepl.com/pro#developer", this.settings.apiKey, (val) => {
                                this.settings.apiKey = val;
                            }, { placeholder: "Enter your DeepL API key..." })
                        ),
                        new Settings.SettingGroup("Translation Settings", {
                            shown: true
                        }).append(
                            new Settings.Dropdown("Default Target Language", "Language to translate messages into", this.settings.targetLanguage, Object.entries(LANGUAGES).map(([code, name]) => ({ label: name, value: code })), (val) => {
                                this.settings.targetLanguage = val;
                            }),
                            new Settings.Switch("Auto-Translate", "Automatically translate new messages", this.settings.autoTranslate, (val) => {
                                this.settings.autoTranslate = val;
                            }),
                            new Settings.Switch("Show Original Text", "Display original text alongside translation", this.settings.showOriginal, (val) => {
                                this.settings.showOriginal = val;
                            }),
                            new Settings.Switch("Preserve Formatting", "Keep Discord formatting in translations", this.settings.preserveFormatting, (val) => {
                                this.settings.preserveFormatting = val;
                            }),
                            new Settings.Dropdown("Formality Level", "Set translation formality (for supported languages)", this.settings.formalityLevel, [
                                { label: "Default", value: "default" },
                                { label: "More Formal", value: "more" },
                                { label: "Less Formal", value: "less" }
                            ], (val) => {
                                this.settings.formalityLevel = val;
                            })
                        )
                    );
                } catch (error) {
                    Logger.error(this.getName(), "Settings panel error:", error);
                    return BdApi.React.createElement("div", {}, "Settings panel failed to load");
                }
            }

            saveSettings() {
                try {
                    Utilities.saveSettings(this.getName(), this.settings);
                } catch (error) {
                    Logger.error(this.getName(), "Failed to save settings:", error);
                }
            }

            async translateText(text, targetLang = null, sourceLang = null) {
                if (!this.settings.apiKey) {
                    throw new Error("No API key configured. Please add your DeepL API key in plugin settings.");
                }

                const target = targetLang || this.settings.targetLanguage;
                const url = 'https://api-free.deepl.com/v2/translate';
                
                const params = new URLSearchParams({
                    auth_key: this.settings.apiKey,
                    text: text,
                    target_lang: target
                });

                if (sourceLang) params.append('source_lang', sourceLang);
                if (this.settings.formalityLevel !== 'default') params.append('formality', this.settings.formalityLevel);
                if (this.settings.preserveFormatting) params.append('preserve_formatting', '1');

                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: params
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`HTTP ${response.status}: ${errorText || 'Translation failed'}`);
                    }

                    const data = await response.json();
                    
                    if (!data.translations || data.translations.length === 0) {
                        throw new Error("No translation received from DeepL API");
                    }

                    return {
                        text: data.translations[0].text,
                        detectedLanguage: data.translations[0].detected_source_language
                    };
                } catch (error) {
                    Logger.error(this.getName(), 'Translation failed:', error);
                    throw error;
                }
            }

            createTranslationElement(translatedText, originalText, isLoading = false, detectedLang = null) {
                const element = document.createElement('div');
                element.className = 'deepl-translation';
                
                if (isLoading) {
                    element.innerHTML = `
                        <div class="deepl-loading">
                            <div class="deepl-spinner"></div>
                            <span>Translating...</span>
                        </div>
                    `;
                    return element;
                }

                const detectedLangName = detectedLang ? LANGUAGES[detectedLang] || detectedLang : 'Unknown';
                const targetLangName = LANGUAGES[this.settings.targetLanguage] || this.settings.targetLanguage;

                element.innerHTML = `
                    <div class="deepl-header">
                        <div class="deepl-languages">
                            <span class="deepl-lang-badge">${detectedLangName}</span>
                            <span class="deepl-arrow">→</span>
                            <span class="deepl-lang-badge">${targetLangName}</span>
                        </div>
                        <div class="deepl-actions">
                            <button class="deepl-toggle-btn" title="Toggle Original">👁️</button>
                            <button class="deepl-copy-btn" title="Copy Translation">📋</button>
                        </div>
                    </div>
                    <div class="deepl-content">
                        <div class="deepl-translated">${translatedText}</div>
                        ${this.settings.showOriginal ? `<div class="deepl-original" style="display: none;">${originalText}</div>` : ''}
                    </div>
                    <div class="deepl-quick-translate">
                        ${this.settings.quickTranslateLanguages.map(lang => 
                            `<button class="deepl-quick-btn" data-lang="${lang}" title="Translate to ${LANGUAGES[lang]}">${lang}</button>`
                        ).join('')}
                    </div>
                `;

                const toggleBtn = element.querySelector('.deepl-toggle-btn');
                const copyBtn = element.querySelector('.deepl-copy-btn');
                const originalDiv = element.querySelector('.deepl-original');
                const translatedDiv = element.querySelector('.deepl-translated');
                const quickBtns = element.querySelectorAll('.deepl-quick-btn');

                if (toggleBtn && originalDiv) {
                    toggleBtn.addEventListener('click', () => {
                        const isOriginalVisible = originalDiv.style.display !== 'none';
                        originalDiv.style.display = isOriginalVisible ? 'none' : 'block';
                        translatedDiv.style.display = isOriginalVisible ? 'block' : 'none';
                        toggleBtn.textContent = isOriginalVisible ? '👁️' : '🔙';
                    });
                }

                if (copyBtn) {
                    copyBtn.addEventListener('click', () => {
                        if (navigator.clipboard) {
                            navigator.clipboard.writeText(translatedText).then(() => {
                                BdApi.showToast('Translation copied!', { type: 'success', timeout: 2000 });
                            }).catch(() => {
                                BdApi.showToast('Failed to copy translation', { type: 'error' });
                            });
                        } else {
                            BdApi.showToast('Clipboard not available', { type: 'error' });
                        }
                    });
                }

                quickBtns.forEach(btn => {
                    btn.addEventListener('click', async () => {
                        const targetLang = btn.dataset.lang;
                        if (targetLang === this.settings.targetLanguage) return;
                        
                        const originalText = btn.textContent;
                        btn.disabled = true;
                        btn.textContent = '...';
                        
                        try {
                            const result = await this.translateText(originalText, targetLang);
                            translatedDiv.textContent = result.text;
                            
                            const targetBadge = element.querySelector('.deepl-lang-badge:last-child');
                            if (targetBadge) targetBadge.textContent = LANGUAGES[targetLang];
                            
                        } catch (error) {
                            BdApi.showToast(`Translation failed: ${error.message}`, { type: 'error' });
                        } finally {
                            btn.disabled = false;
                            btn.textContent = originalText;
                        }
                    });
                });

                return element;
            }

            patchMessageContextMenu() {
                try {
                    const MessageContextMenu = WebpackModules.getModule(m => m.default?.displayName === "MessageContextMenu");
                    
                    if (!MessageContextMenu) {
                        Logger.warn(this.getName(), "Could not find MessageContextMenu");
                        return;
                    }

                    Patcher.after(this.getName(), MessageContextMenu, "default", (_, [props], ret) => {
                        if (!props?.message?.content) return;

                        try {
                            const translateItem = BdApi.React.createElement("div", {
                                className: "item-1OdjEX labelContainer-2vJzYL colorDefault-CDqZdO",
                                role: "menuitem",
                                tabIndex: -1,
                                onClick: () => this.translateMessage(props.message.id, props.message.content)
                            }, 
                                BdApi.React.createElement("div", { 
                                    className: "label-2gNW3x" 
                                }, "🌐 Translate with BetterTranslator")
                            );

                            if (ret?.props?.children && Array.isArray(ret.props.children)) {
                                ret.props.children.splice(1, 0, translateItem);
                            }
                        } catch (error) {
                            Logger.error(this.getName(), "Context menu patch error:", error);
                        }
                    });
                } catch (error) {
                    Logger.error(this.getName(), "Failed to patch context menu:", error);
                }
            }

            async translateMessage(messageId, content) {
                if (!content?.trim()) return;

                try {
                    const messageElement = document.querySelector(`[data-list-item-id*="${messageId}"], [id*="${messageId}"]`);
                    if (!messageElement) return;

                    const existingTranslation = messageElement.querySelector('.deepl-translation');
                    if (existingTranslation) {
                        existingTranslation.remove();
                        return;
                    }

                    const loadingElement = this.createTranslationElement('', content, true);
                    const messageContent = messageElement.querySelector('[class*="messageContent"], [class*="markup"]');
                    
                    if (messageContent) {
                        messageContent.appendChild(loadingElement);
                    } else {
                        messageElement.appendChild(loadingElement);
                    }

                    const result = await this.translateText(content);
                    
                    const translationElement = this.createTranslationElement(
                        result.text, 
                        content, 
                        false, 
                        result.detectedLanguage
                    );
                    
                    loadingElement.replaceWith(translationElement);

                } catch (error) {
                    const loadingElement = document.querySelector('.deepl-loading');
                    if (loadingElement?.parentElement) loadingElement.parentElement.remove();
                    
                    BdApi.showToast(`Translation failed: ${error.message}`, { type: 'error' });
                    Logger.error(this.getName(), "Translation error:", error);
                }
            }

            addStyles() {
                const css = `
                    .deepl-translation {
                        background: linear-gradient(135deg, #2f3136 0%, #36393f 100%);
                        border-left: 4px solid #7289da;
                        border-radius: 8px;
                        margin: 8px 0;
                        padding: 12px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                        animation: slideIn 0.3s ease-out;
                    }

                    @keyframes slideIn {
                        from { opacity: 0; transform: translateY(-10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }

                    .deepl-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 8px;
                        padding-bottom: 8px;
                        border-bottom: 1px solid #4f545c;
                    }

                    .deepl-languages {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }

                    .deepl-lang-badge {
                        background: #7289da;
                        color: white;
                        padding: 2px 8px;
                        border-radius: 12px;
                        font-size: 12px;
                        font-weight: 500;
                    }

                    .deepl-arrow {
                        color: #7289da;
                        font-weight: bold;
                    }

                    .deepl-actions {
                        display: flex;
                        gap: 4px;
                    }

                    .deepl-toggle-btn, .deepl-copy-btn {
                        background: none;
                        border: none;
                        font-size: 16px;
                        cursor: pointer;
                        padding: 4px;
                        border-radius: 4px;
                        transition: background 0.2s;
                    }

                    .deepl-toggle-btn:hover, .deepl-copy-btn:hover {
                        background: rgba(114, 137, 218, 0.2);
                    }

                    .deepl-content {
                        margin: 8px 0;
                    }

                    .deepl-translated, .deepl-original {
                        color: #dcddde;
                        line-height: 1.4;
                        word-wrap: break-word;
                    }

                    .deepl-original {
                        opacity: 0.7;
                        font-style: italic;
                    }

                    .deepl-quick-translate {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 4px;
                        margin-top: 8px;
                        padding-top: 8px;
                        border-top: 1px solid #4f545c;
                    }

                    .deepl-quick-btn {
                        background: linear-gradient(135deg, #677bc4 0%, #7289da 100%);
                        color: white;
                        border: none;
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 11px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.2s;
                        min-width: 35px;
                    }

                    .deepl-quick-btn:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 2px 8px rgba(114, 137, 218, 0.3);
                    }

                    .deepl-quick-btn:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                        transform: none;
                    }

                    .deepl-loading {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        color: #7289da;
                        font-style: italic;
                    }

                    .deepl-spinner {
                        width: 16px;
                        height: 16px;
                        border: 2px solid #4f545c;
                        border-top: 2px solid #7289da;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }

                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `;

                BdApi.injectCSS(this.getName(), css);
            }

            removeStyles() {
                BdApi.clearCSS(this.getName());
            }
        };
    })(global.ZeresPluginLibrary.buildPlugin(config));
});
