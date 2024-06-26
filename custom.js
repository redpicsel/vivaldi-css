﻿//window.onload = function (event) {


//----Mica Effect-----------------------------------------------------------------------------------------------------------------------------------------------------
const micaBackgroundImage = 'url("chrome://vivaldi-data/desktop-image/0")';

const micaBackground = document.createElement('div');

const micaFilter = document.createElement('div');

let micaX = 0, micaY = 0;

const micaFilterStyle = `position: fixed; top: 0; left: 0; background-color: rgba(40, 36, 36, 0.8); width: 100vw; height: 100vh; z-index: -10;`;

const micaBackgroundStyle = `position: fixed; background-image: ${micaBackgroundImage}; background-size: cover; translate: 0 -34px; width: ${window.screen.width + 'px'}; height: ${window.screen.height + 34 + 'px'}; filter: blur(100px) saturate(2.5); z-index: -11;`;

micaBackground.setAttribute('style', micaBackgroundStyle);

micaFilter.setAttribute('style', micaFilterStyle);

micaBackground.setAttribute('id', 'mica-background');

micaFilter.setAttribute('id', 'mica-filter');

const appendMicaEffect = () => {

    document.body.appendChild(micaBackground);

    document.body.appendChild(micaFilter);

};

setTimeout(appendMicaEffect, 5);

let micaRefresh = () => {

    micaX = window.screenX * -1;

    micaY = window.screenY * -1;

    micaBackground.style.top = micaY + 'px';

    micaBackground.style.left = micaX + 'px';

};

setInterval(micaRefresh, 10);

const documentHead = document.getElementsByTagName('head')[0];

const customCSSForMica = document.createElement('style');

customCSSForMica.innerHTML = '#browser {background: none !important;} html:has(#browser.theme-dark) #mica-filter {background-color: rgba(40, 36, 36, 0.8) !important;} html:has(#browser.theme-dark) #mica-background {filter: blur(100px) saturate(1.5) !important;}';

documentHead.appendChild(customCSSForMica);
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------



setTimeout(function () {
    if (document.getElementsByClassName("vivaldi") && document.getElementsByClassName("vivaldi").length > 0)
        document.getElementsByClassName("vivaldi")[0].title = "Lực Nguyễn";

    clearSearchInput();

    openLinkDialog();


    if (document.getElementById("urlFieldInput")) {
        document.getElementById("urlFieldInput").onchange = function () {
            setTimeout(function () {
                var currentUrl = document.getElementById("urlFieldInput").value;

                if (currentUrl.includes("StartPageChrome2")) {
                    clearSearchInput();

                    return;
                }


                if (currentUrl.includes("localhost") || currentUrl.includes("127.0.0.1")) {
                    setTimeout(function () {
                        localhost();
                    }, 200);

                    return;
                }


                setTimeout(function () {
                    showPort();
                }, 200);


                //var port = getPort(currentUrl);
                //if (port != "") {
                //	setTimeout(function () {
                //		showPort();
                //	}, 200);

                //	return;
                //}


            }, 500)
        };
    }



    // if (document.getElementById("urlFieldInput")) {
    //     setInterval(function () {
    //         var currentUrl = document.getElementById("urlFieldInput").value;

    //         if (currentUrl.includes("StartPageChrome2")) {
    //             clearSearchInput();

    //             return;
    //         }

    //         if (currentUrl.includes("localhost") || currentUrl.includes("127.0.0.1")) {
    //             setTimeout(function () {
    //                 localhost();
    //             }, 200);

    //             return;
    //         }

    //         setTimeout(function () {
    //             showPort();
    //         }, 200);
    //     }, 2000)
    // }



}, 2000)
//};

showPort = function () {
    var currentUrl = document.getElementById("urlFieldInput").value;
    var port = getPort(currentUrl);

    if (document.querySelectorAll("#tabs-container .tab.active").length > 0) {
        var tabActive = document.querySelectorAll("#tabs-container .tab.active")[0];
        var title = tabActive.title;

        var portHTML = port == "" ? "" : port + "<span class='port-title'>-</span>";

        //tabActive.title = port + " ● " + title;
        tabActive.getElementsByClassName("title")[0].innerHTML = portHTML + title;
    }
}

localhost = function () {
    if (document.querySelectorAll("#tabs-container .tab.active").length > 0) {
        var tabActive = document.querySelectorAll("#tabs-container .tab.active")[0];
        var parent = tabActive.parentElement;
        parent.classList.add("localhost");

        var title = tabActive.title;

        //tabActive.title = "Local ● " + title;
        tabActive.getElementsByClassName("title")[0].innerHTML = "local" + "<span class='port-title'>-</span>" + title;
    }
}

function getPort(url) {
    url = url.match(/^(([a-z]+:)?(\/\/)?[^\/]+).*$/)[1] || url;

    var parts = url.split(':'),
        port = parseInt(parts[parts.length - 1], 10);

    if (parts[0] === 'http' && (isNaN(port) || parts.length < 3))
        return "";

    if (parts[0] === 'https' && (isNaN(port) || parts.length < 3))
        return "";

    if (parts.length === 1 || isNaN(port))
        return "";

    return port;
}

clearSearchInput = function () {
    if (document.getElementById("urlFieldInput")) {
        document.getElementById("urlFieldInput").value = "";

        setTimeout(function () {
            //document.getElementById("urlFieldInput").focus();
        }, 100);
    }
}



//-----------open link in dialog------------------------------------------------------------------------------------------------------
function openLinkDialog() {
    let searchEngineCollection,
        defaultSearchId,
        privateSearchId,
        createdContextMenuIds = [],
        webviews = new Map(),
        fromPanel;

    // Wait for the browser to come to a ready state
    setTimeout(function waitDialog() {
        const browser = document.getElementById('browser');
        if (browser) {
            // Create a context menu item to call on a link
            createContextMenuOption();

            // create initial search engine context menus
            updateSearchEnginesAndContextMenu();

            // detect changes in search engines and recreate the context menus
            vivaldi.searchEngines.onTemplateUrlsChanged.addListener(() => {
                removeContextMenuSelectSearch();
                updateSearchEnginesAndContextMenu();
            });

            // Setup keyboard shortcuts
            vivaldi.tabsPrivate.onKeyboardShortcut.addListener(keyCombo);

            chrome.runtime.onMessage.addListener((message) => {
                if (message.url) {
                    fromPanel = message.fromPanel;
                    dialogTab(message.url, message.fromPanel);
                }
            });

            // chrome.tabs.onUpdated.addListener((tabId, data) => {
            //     if (data.status === chrome.tabs.TabStatus.COMPLETE) {
            //         chrome.scripting.executeScript({
            //             target: {tabId: tabId},
            //             func: setUrlClickObserver
            //         });
            //     }
            // });

            chrome.webNavigation.onCompleted.addListener((details) => {
                if (details.tabId < 0) {
                    let view = Array.from(webviews.values()).pop();
                    if (view) {
                        view.webview.executeScript({ code: `(${setUrlClickObserver})(${fromPanel})` });
                    } else {
                        view = document.querySelector('.webpanel-stack > .visible webview');
                        view && view.executeScript({ code: `(${setUrlClickObserver})(${true})` });
                    }
                } else {
                    chrome.scripting.executeScript({
                        target: { tabId: details.tabId },
                        func: setUrlClickObserver
                    });
                }
            });

        } else {
            setTimeout(waitDialog, 300);
        }
    }, 300);

    /**
        * Checks if a link is clicked by middle mouse while pressing Ctrl + Alt, then fires an event with the Url
        */
    function setUrlClickObserver(fromPanel = false) {
        if (this.dialogEventListenerSet) return;

        let timer;
        document.addEventListener('mousedown', function (event) {
            // Check if the Ctrl key, Shift key, and middle mouse button were pressed
            if (event.ctrlKey && event.altKey && (event.button === 0 || event.button === 1)) {
                callDialog(event);
            } else if (event.button === 1) {
                timer = setTimeout(() => callDialog(event), 500);
            }
        });

        document.addEventListener('mouseup', function (event) {
            if (event.button === 1) {
                clearTimeout(timer);
            }
        });

        this.dialogEventListenerSet = true;

        let callDialog = (event) => {
            let link = getLinkElement(event.target);
            if (link) {
                event.preventDefault();
                chrome.runtime.sendMessage({ url: link.href, fromPanel: fromPanel });
            }
        };

        let getLinkElement = (el) => {
            do {
                if (el.tagName != null && el.tagName.toLowerCase() === 'a') {
                    if (el.getAttribute('href') === '#') return null;
                    return el;
                }
            } while ((el = el.parentNode));

            return null;
        };
    }

    /**
        * Creates context menu items to open dialog tab
        */
    function createContextMenuOption() {
        chrome.contextMenus.create({
            id: 'dialog-tab-link',
            title: '[Dialog Tab] Open Link',
            contexts: ['link'],
        });
        chrome.contextMenus.create({
            id: 'search-dialog-tab',
            title: '[Dialog Tab] Search for "%s"',
            contexts: ['selection'],
        });
        chrome.contextMenus.create({
            id: 'select-search-dialog-tab',
            title: '[Dialog Tab] Search with',
            contexts: ['selection'],
        });

        chrome.contextMenus.onClicked.addListener(function (itemInfo) {
            if (itemInfo.menuItemId === 'dialog-tab-link') {
                dialogTab(itemInfo.linkUrl);
            } else if (itemInfo.menuItemId === 'search-dialog-tab') {
                let engineId = window.incognito ? privateSearchId : defaultSearchId;
                dialogTabSearch(engineId, itemInfo.selectionText);
            } else if (itemInfo.parentMenuItemId === 'select-search-dialog-tab') {
                let engineId = itemInfo.menuItemId.substr(itemInfo.parentMenuItemId.length);
                dialogTabSearch(engineId, itemInfo.selectionText);
            }
        });
    }

    /**
        * Creates sub-context menu items for select search engine menu item
        */
    function createContextMenuSelectSearch() {
        searchEngineCollection.forEach(function (engine) {
            if (!createdContextMenuIds.includes(engine.id)) {
                chrome.contextMenus.create({
                    id: 'select-search-dialog-tab' + engine.id,
                    parentId: 'select-search-dialog-tab',
                    title: engine.name,
                    contexts: ['selection'],
                });
                createdContextMenuIds.push(engine.id);
            }
        });
    }

    /**
        * updates the search engines and context menu
        */
    function updateSearchEnginesAndContextMenu() {
        vivaldi.searchEngines.getTemplateUrls().then((searchEnignes) => {
            searchEngineCollection = searchEnignes.templateUrls;
            defaultSearchId = searchEnignes.defaultSearch;
            privateSearchId = searchEnignes.defaultPrivate;

            createContextMenuSelectSearch();
        });
    }

    /**
        * Updates sub-context menu items for select search engine menu item
        * @param {Object} oldValue the value that is used as reference to old sub-menu items
        */
    function removeContextMenuSelectSearch() {
        searchEngineCollection.forEach(function (engine) {
            if (createdContextMenuIds.includes(engine.id)) {
                chrome.contextMenus.remove('select-search-dialog-tab' + engine.id);
                createdContextMenuIds.splice(createdContextMenuIds.indexOf(engine.id), 1);
            }
        });
    }

    /**
        * Prepares url for search, calls dailogTab function
        * @param {String} engineId engine id of the engine to be used
        * @param {int} selectionText the text to search
        */
    async function dialogTabSearch(engineId, selectionText) {
        let searchRequest = await vivaldi.searchEngines.getSearchRequest(engineId, selectionText);
        dialogTab(searchRequest.url);
    }

    /**
        * Returns engine from the collection variable with matching id
        * @param {int} engineId engine id of the required engine
        */
    function getEngine(engineId) {
        return searchEngineCollection.find(function (engine) {
            return engine.id === engineId;
        });
    }

    /**
        * Handle a potential keyboard shortcut (copy from KeyboardMachine)
        * @param {number} some id, but I don't know what this does, but it's an extra argument
        * @param {String} combination written in the form (CTRL+SHIFT+ALT+KEY)
        */
    function keyCombo(id, combination) {
        /** Open Default Search Engine in Dialog and search for selected text */
        const searchForSelectedText = async () => {
            let tabs = await chrome.tabs.query({ active: true })
            vivaldi.utilities.getSelectedText(tabs[0].id, (text) =>
                dialogTabSearch(defaultSearchId, text)
            );
        }

        const SHORTCUTS = {
            'Ctrl+Alt+Period': searchForSelectedText,
            'Ctrl+Shift+F': searchForSelectedText,
            'Esc': () => removeDialog(Array.from(webviews.keys()).pop())
        };

        const customShortcut = SHORTCUTS[combination];
        if (customShortcut) {
            customShortcut();
        }
    }

    /**
        * removes the dialog
        */
    function removeDialog(webviewId) {
        let data = webviews.get(webviewId);
        if (data) {
            data.divContainer.remove();
            webviews.delete(webviewId);
        }
    }

    /**
        * Checks if the current window is the correct window to show the dialog and then opens the dialog
        * @param {string} linkUrl the url to load
        * @param {boolean} fromPanel indicates whether the dialog is opened from a panel
        */
    function dialogTab(linkUrl, fromPanel = undefined) {
        chrome.windows.getLastFocused(function (window) {
            if (window.id === vivaldiWindowId && window.state !== chrome.windows.WindowState.MINIMIZED) {
                showDialog(linkUrl, fromPanel);
            }
        });
    }

    /**
        * Opens a link in a dialog like display in the current visible tab
        * @param {string} linkUrl the url to load
        * @param {boolean} fromPanel indicates whether the dialog is opened from a panel
        */
    function showDialog(linkUrl, fromPanel) {
        let divContainer = document.createElement('div'),
            webview = document.createElement('webview'),
            webviewId = 'dialog-' + getWebviewId(),
            divOptionContainer = document.createElement('div'),
            progressBarContainer = document.createElement('div'),
            progressBar = document.createElement('div');

        if (fromPanel === undefined && webviews.size !== 0) {
            fromPanel = Array.from(webviews.values()).pop().fromPanel;
        }

        webviews.set(webviewId, {
            divContainer: divContainer,
            webview: webview,
            fromPanel: fromPanel
        });

        //#region webview properties
        webview.setAttribute('src', linkUrl);
        webview.id = webviewId;
        webview.style.width = 85 - 5 * webviews.size + '%';
        webview.style.height = 90 - 5 * webviews.size + '%';
        webview.style.margin = 'auto';
        webview.style.overflow = 'hidden';
        webview.style.borderRadius = '10px';

        webview.addEventListener('loadstart', function () {
            this.style.backgroundColor = 'var(--colorBorder)';
            document.getElementById('progressBar-' + webviewId).style.display = 'block';

            if (document.getElementById('input-' + this.id) !== null) {
                document.getElementById('input-' + this.id).value = this.src;
            }
        });
        webview.addEventListener('loadstop', function () {
            document.getElementById('progressBar-' + webviewId).style.display = 'none';
        });
        fromPanel && webview.addEventListener('mousedown', event => event.stopPropagation());
        //#endregion

        //#region divOptionContainer properties
        divOptionContainer.style.position = 'fixed';
        divOptionContainer.style.width = '100%';
        divOptionContainer.style.textAlign = 'center';
        divOptionContainer.style.alignItems = 'center';
        divOptionContainer.style.top = (100 - (90 - 5 * webviews.size)) / 2 - 4 + '%';
        divOptionContainer.style.color = 'white';
        divOptionContainer.style.zIndex = '1160';
        divOptionContainer.innerHTML = getEllipsisContent();

        let timeout;
        divOptionContainer.addEventListener('mouseover', function () {
            if (divOptionContainer.children.length === 1) {
                divOptionContainer.innerHTML = '';
                showWebviewOptions(webviewId, divOptionContainer);
            }
            if (timeout) {
                clearTimeout(timeout);
                timeout = undefined;
            }
        });
        divOptionContainer.addEventListener('mouseleave', function () {
            if (!timeout) {
                timeout = setTimeout(() => {
                    while (divOptionContainer.firstChild) {
                        divOptionContainer.removeChild(divOptionContainer.firstChild);
                    }
                    divOptionContainer.innerHTML = getEllipsisContent();
                }, 1500);
            }
        });
        //#endregion

        //#region divContainer properties
        divContainer.setAttribute('class', 'dialog-tab');
        divContainer.style.zIndex = '1060';
        divContainer.style.position = 'fixed';
        divContainer.style.top = '0';
        divContainer.style.right = '0';
        divContainer.style.bottom = '0';
        divContainer.style.left = '0';
        divContainer.style.backgroundColor = 'rgba(0,0,0,.4)';
        divContainer.style.transitionProperty = 'background-color';
        divContainer.style.transitionDuration = '0.1s';
        divContainer.style.transitionTimingFunction = 'ease';
        divContainer.style.transitionDelay = '0s';
        divContainer.style.backdropFilter = 'blur(1px)';

        let stopEvent = event => {
            event.preventDefault();
            event.stopPropagation();
        };

        fromPanel && document.body.addEventListener('pointerdown', stopEvent);

        divContainer.addEventListener('click', function (event) {
            if (event.target === this) {
                fromPanel && document.body.removeEventListener('pointerdown', stopEvent);
                removeDialog(webviewId);
            }
        });

        //#endregion

        //#region progressBarContainer properties
        progressBarContainer.style.width = '77%';
        progressBarContainer.style.margin = '1.3rem auto auto';

        progressBar.id = 'progressBar-' + webviewId;
        progressBar.style.height = '5px';
        progressBar.style.width = '10%';
        progressBar.style.backgroundColor = '#0080ff';
        progressBar.style.borderRadius = '5px';
        //#endregion

        progressBarContainer.appendChild(progressBar);
        divContainer.appendChild(divOptionContainer);
        divContainer.appendChild(webview);
        divContainer.appendChild(progressBarContainer);

        // Get for current tab and append divContainer
        fromPanel ? document.body.appendChild(divContainer) : document.querySelector('.active.visible.webpageview').appendChild(divContainer);
    }

    /**
        * Displays open in tab buttons and current url in input element
        * @param {string} webviewId is the id of the webview
        * @param {Object} thisElement the current instance divOptionContainer (div) element
        */
    function showWebviewOptions(webviewId, thisElement) {
        let inputId = 'input-' + webviewId,
            data = webviews.get(webviewId),
            webview = data ? data.webview : undefined;
        console.log(document.getElementById(inputId) === null, webviewId);
        if (webview && document.getElementById(inputId) === null) {
            let webviewSrc = webview.src,
                input = document.createElement('input', 'text'),
                buttonBack = createOptionsButton(),
                buttonForward = createOptionsButton(),
                buttonNewTab = createOptionsButton(),
                buttonBackgroundTab = createOptionsButton();

            input.value = webviewSrc;
            input.id = inputId;
            input.setAttribute('readonly', '');
            input.style.background = 'var(--colorAccentBgAlpha)' // 'transparent';
            input.style.color = 'white';
            input.style.border = 'unset';
            input.style.width = '20%';
            input.style.margin = '0 0.5rem 0 0.5rem';
            input.style.padding = '0.25rem 0.5rem';

            setBackButtonContent(buttonBack);
            buttonBack.addEventListener('click', function (event) {
                if (event.target === this || this.firstChild) {
                    webview.back();
                }
            });

            setForwardButtonContent(buttonForward);
            buttonForward.addEventListener('click', function (event) {
                if (event.target === this || this.firstChild) {
                    webview.forward();
                }
            });

            buttonNewTab.innerHTML = getNewTabContent();
            buttonNewTab.addEventListener('click', function (event) {
                if (event.target === this || this.firstChild) {
                    openNewTab(inputId, true);
                }
            });

            buttonBackgroundTab.innerHTML = getBackgroundTabContent();
            buttonBackgroundTab.addEventListener('click', function (event) {
                if (event.target === this || this.firstChild) {
                    openNewTab(inputId, false);
                }
            });

            thisElement.appendChild(buttonBack);
            thisElement.appendChild(buttonForward);
            thisElement.appendChild(buttonNewTab);
            thisElement.appendChild(buttonBackgroundTab);
            thisElement.appendChild(input);

            console.log(webviewSrc, thisElement);
        }
    }

    /**
        * Create a button with default style for the web view options.
        */
    function createOptionsButton() {
        let button = document.createElement('button');

        button.style.background = 'transparent';
        button.style.margin = '0 0.5rem 0 0.5rem';
        button.style.border = 'unset';

        return button;
    }

    /**
        * Returns a random, verified id.
        */
    function getWebviewId() {
        let tempId = 0;
        while (true) {
            if (document.getElementById('dialog-' + tempId) === null) {
                break;
            }
            tempId = Math.floor(Math.random() * 1000 + 1);
        }
        return tempId;
    }

    /**
        * Opens a new Chrome tab with specified active boolean value
        * @param {string} inputId is the id of the input containing current url
        * @param {boolean} active indicates whether the tab is active or not (background tab)
        */
    function openNewTab(inputId, active) {
        let url = document.getElementById(inputId).value;

        chrome.tabs.create({ url: url, active: active })
    }

    /**
        * Returns string of ellipsis svg icon
        */
    function getEllipsisContent() {
        return '<svg xmlns="http://www.w3.org/2000/svg" height="2em" viewBox="0 0 448 512"><path d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z"/></svg>';
    }

    /**
        * Sets the svg icon for the back button
        */
    function setBackButtonContent(buttonBack) {
        let svg = document.querySelector('.button-toolbar [name="Back"] svg');
        if (svg) {
            buttonBack.appendChild(svg.cloneNode(true));
        } else {
            buttonBack.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>';
        }
    }

    /**
        * Sets the svg icon for the forward button
        */
    function setForwardButtonContent(forwardButton) {
        let svg = document.querySelector('.button-toolbar [name="Forward"] svg');
        if (svg) {
            forwardButton.appendChild(svg.cloneNode(true));
        } else {
            forwardButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg>';
        }
    }

    /**
        *  Returns string of external link alt svg icon
        */
    function getNewTabContent() {
        return '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z"/></svg>';
    }

    /**
        * Returns string of external link square alt svg icon
        */
    function getBackgroundTabContent() {
        return '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M384 32c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96C0 60.7 28.7 32 64 32H384zM160 144c-13.3 0-24 10.7-24 24s10.7 24 24 24h94.1L119 327c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l135-135V328c0 13.3 10.7 24 24 24s24-10.7 24-24V168c0-13.3-10.7-24-24-24H160z"/></svg>';
    }
}


//------------------------------------------------------------------------------------------------------------------------------------