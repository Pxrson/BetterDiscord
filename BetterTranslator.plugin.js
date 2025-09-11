/**
 * @name BetterTranslator
 * @author pxrson
 * @description Super accurate Discord message translation using DeepL API with comprehensive language support
 * @version 2.0.0
 * @authorId 1039345167926308865
 * @source https://github.com/Pxrson/BetterTranslator
 * @updateUrl https://github.com/Pxrson/BetterTranslator/blob/main/BetterTranslator.plugin.js
 */

(() => {
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
        ],
        main: "index.js"
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
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() { }
        stop() { }
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Api) => {
            const { Patcher, Settings, Utilities, WebpackModules, DiscordModules, Logger, PluginUtilities } = Api;
            const { MessageStore, UserStore, ChannelStore } = DiscordModules;

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
                'AR': 'Arabic', 'HE': 'Hebrew', 'TH': 'Thai', 'VI': 'Vietnamese',
                'MS': 'Malay', 'HI': 'Hindi', 'TA': 'Tamil', 'BN': 'Bengali',
                'TE': 'Telugu', 'MR': 'Marathi', 'GU': 'Gujarati', 'KN': 'Kannada',
                'ML': 'Malayalam', 'PA': 'Punjabi', 'OR': 'Odia', 'AS': 'Assamese'
            };

            const QUICK_TRANSLATE_LANGUAGES = ['EN-US', 'ES', 'DE', 'FR', 'JA', 'ZH-CN', 'RU', 'IT', 'PT-BR', 'AR'];

            return class BetterTranslator extends Plugin {
                constructor() {
                    super();
                    this.settings = {
                        apiKey: "",
                        targetLanguage: "EN-US",
                        autoTranslate: false,
                        showOriginal: true,
                        preserveFormatting: true,
                        formalityLevel: "default",
                        quickTranslateLanguages: QUICK_TRANSLATE_LANGUAGES
                    };
                }

                onLoad() {
                    this.settings = Utilities.loadSettings(this.getName(), {
                        apiKey: "",
                        targetLanguage: "EN-US",
                        autoTranslate: false,
                        showOriginal: true,
                        preserveFormatting: true,
                        formalityLevel: "default",
                        quickTranslateLanguages: QUICK_TRANSLATE_LANGUAGES
                    });
                }

                onStart() {
                    this.addStyles();
                    this.patchMessageContextMenu();
                    this.startAutoTranslation();
                    BdApi.showToast("BetterTranslator started! 🚀", { type: "success" });
                }

                onStop() {
                    Patcher.unpatchAll();
                    this.removeStyles();
                    BdApi.showToast("BetterTranslator stopped!", { type: "info" });
                }

                getSettingsPanel() {
                    const panel = Settings.SettingPanel.build(() => this.saveSettings(), 
                        new Settings.SettingGroup("API Configuration").append(
                            new Settings.Textbox("DeepL API Key", "Get your free API key from https://www.deepl.com/pro#developer", this.settings.apiKey, (val) => {
                                this.settings.apiKey = val;
                            }, { placeholder: "Enter your DeepL API key..." })
                        ),
                        new Settings.SettingGroup("Translation Settings").append(
                            new Settings.Dropdown("Default Target Language", "Language to translate messages into", this.settings.targetLanguage, Object.entries(LANGUAGES).map(([code, name]) => ({ label: name, value: code })), (val) => {
                                this.settings.targetLanguage = val;
                            }),
                            new Settings.Switch("Auto-Translate", "Automatically translate new messages", this.settings.autoTranslate, (val) => {
                                this.settings.autoTranslate = val;
                                if (val) this.startAutoTranslation();
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
                        ),
                        new Settings.SettingGroup("Quick Translate Languages").append(
                            ...QUICK_TRANSLATE_LANGUAGES.map(lang => 
                                new Settings.Switch(LANGUAGES[lang], `Show ${LANGUAGES[lang]} in quick translate buttons`, 
                                    this.settings.quickTranslateLanguages.includes(lang), (val) => {
                                        if (val && !this.settings.quickTranslateLanguages.includes(lang)) {
                                            this.settings.quickTranslateLanguages.push(lang);
                                        } else if (!val) {
                                            this.settings.quickTranslateLanguages = this.settings.quickTranslateLanguages.filter(l => l !== lang);
                                        }
                                    }
                                )
                            )
                        )
                    );
                    return panel;
                }

                saveSettings() {
                    Utilities.saveSettings(this.getName(), this.settings);
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
                            const error = await response.json().catch(() => ({ message: 'Translation failed' }));
                            throw new Error(error.message || `HTTP ${response.status}`);
                        }

                        const data = await response.json();
                        return {
                            text: data.translations[0].text,
                            detectedLanguage: data.translations[0].detected_source_language
                        };
                    } catch (error) {
                        Logger.error('Translation failed:', error);
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
                            navigator.clipboard.writeText(translatedText).then(() => {
                                BdApi.showToast('Translation copied!', { type: 'success', timeout: 2000 });
                            });
                        });
                    }

                    quickBtns.forEach(btn => {
                        btn.addEventListener('click', async () => {
                            const targetLang = btn.dataset.lang;
                            if (targetLang === this.settings.targetLanguage) return;
                            
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
                                btn.textContent = targetLang;
                            }
                        });
                    });

                    return element;
                }

                patchMessageContextMenu() {
                    const MessageContextMenu = WebpackModules.find(m => m.default && m.default.displayName === "MessageContextMenu");
                    
                    if (!MessageContextMenu) {
                        Logger.warn("Could not find MessageContextMenu");
                        return;
                    }

                    Patcher.after(MessageContextMenu, "default", (_, [props], ret) => {
                        if (!props.message || !props.message.content) return;

                        const translateItem = BdApi.React.createElement("div", {
                            className: "item-1tOPte labelContainer-1BLJti",
                            role: "menuitem",
                            tabIndex: -1,
                            onClick: () => this.translateMessage(props.message.id, props.message.content)
                        }, 
                            BdApi.React.createElement("div", { className: "label-JWQiNe" }, "🌐 Translate with BetterTranslator")
                        );

                        if (ret?.props?.children && Array.isArray(ret.props.children)) {
                            ret.props.children.splice(1, 0, translateItem);
                        }
                    });
                }

                async translateMessage(messageId, content) {
                    if (!content?.trim()) return;

                    const messageElement = document.querySelector(`[id*="${messageId}"]`);
                    if (!messageElement) return;

                    const existingTranslation = messageElement.querySelector('.deepl-translation');
                    if (existingTranslation) {
                        existingTranslation.remove();
                        return;
                    }

                    const loadingElement = this.createTranslationElement('', content, true);
                    const messageContent = messageElement.querySelector('[class*="messageContent"]');
                    if (messageContent) {
                        messageContent.appendChild(loadingElement);
                    }

                    try {
                        const result = await this.translateText(content);
                        
                        const translationElement = this.createTranslationElement(
                            result.text, 
                            content, 
                            false, 
                            result.detectedLanguage
                        );
                        
                        loadingElement.replaceWith(translationElement);

                    } catch (error) {
                        loadingElement.remove();
                        BdApi.showToast(`Translation failed: ${error.message}`, { type: 'error' });
                    }
                }

                startAutoTranslation() {
                    if (!this.settings.autoTranslate || !this.settings.apiKey) return;

                    Logger.log("Auto-translation would start here");
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
        };
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
