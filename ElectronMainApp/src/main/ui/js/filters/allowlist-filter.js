/* global ace */

const { ipcRenderer } = require('electron');
const utils = require('../utils/common-utils');
const editorUtils = require('../utils/editor-utils');
const checkboxUtils = require('../utils/checkbox-utils');
const { Range } = require('../libs/ace/ace');

const COMMENT_MASK = '!';

/**
 * Allowlist block
 *
 * @param {object} userSettings
 * @param {object} contentBlockerInfo
 */
const AllowlistFilter = function (userSettings, contentBlockerInfo) {
    'use strict';

    const editorId = 'allowlistRules';
    const editor = ace.edit(editorId);
    editorUtils.handleEditorResize(editor);

    editor.setShowPrintMargin(false);

    editor.session.setMode('ace/mode/adguard');
    editor.setOption('wrap', true);

    const saveIndicatorElement = document.querySelector('#allowlistRulesSaveIndicator');
    const saver = new editorUtils.Saver({
        editor,
        saveEventType: 'saveAllowlistDomains',
        indicatorElement: saveIndicatorElement,
    });

    const changeDefaultAllowlistModeCheckbox = document.querySelector('#changeDefaultAllowlistMode');
    const allowlistEditor = document.querySelector('#allowlistRules > textarea');
    const applyChangesBtn = document.querySelector('#allowlistFilterApplyChanges');

    let hasContent = false;
    function loadAllowlistDomains() {
        const response = ipcRenderer.sendSync('renderer-to-main', JSON.stringify({
            'type': 'getAllowlistDomains',
        }));
        /* eslint-disable-next-line no-unused-vars */
        hasContent = !!response.content;
        editor.setValue(response.content || '', 1);
        applyChangesBtn.classList.add('disabled');
        const allowlistedNum = editorUtils.countRules(response.content);
        utils.setAllowlistInfo(allowlistedNum);
        contentBlockerInfo.allowlistedNum = allowlistedNum;
    }

    applyChangesBtn.onclick = (event) => {
        event.preventDefault();
        saver.saveData();
        allowlistEditor.focus();
    };

    editor.commands.addCommand({
        name: 'save',
        bindKey: { win: 'Ctrl-S', 'mac': 'Cmd-S' },
        exec: () => saver.saveData(),
    });

    editor.commands.addCommand({
        name: 'comment',
        bindKey: { win: 'Ctrl-/', 'mac': 'Cmd-/' },
        exec: (editor) => {
            const selection = editor.getSelection();
            const ranges = selection.getAllRanges();

            const selectedRows = ranges
                .map((range) => {
                    const [start, end] = [range.start.row, range.end.row];
                    return Array.from({ length: end - start + 1 }, (_, idx) => idx + start);
                })
                .flat();

            // check if all selected lines are commented
            const hasUncommentedRows = selectedRows.some((row) => !editor.session
                .getLine(row)
                .trim()
                .startsWith(COMMENT_MASK));

            selectedRows.forEach((row) => {
                if (hasUncommentedRows) {
                    // add comment mark
                    editor.session.insert({ row, column: 0 }, `${COMMENT_MASK} `);
                } else {
                    // remove comment mark
                    const rawLine = editor.session.getLine(row);
                    editor.session.replace(new Range(row, 0, row), rawLine.replace(`${COMMENT_MASK} `, ''));
                }
            });
        },
    });

    function changeDefaultAllowlistMode(e) {
        e.preventDefault();

        utils.setIsAllowlistInverted(e.currentTarget.checked);
        userSettings.values[userSettings.names.DEFAULT_ALLOWLIST_MODE] = !e.currentTarget.checked;

        ipcRenderer.send('renderer-to-main', JSON.stringify({
            'type': 'changeDefaultAllowlistMode',
            enabled: !e.currentTarget.checked,
        }));

        loadAllowlistDomains();
    }

    changeDefaultAllowlistModeCheckbox.addEventListener('change', changeDefaultAllowlistMode);

    checkboxUtils.updateCheckbox(
        [changeDefaultAllowlistModeCheckbox],
        !userSettings.values[userSettings.names.DEFAULT_ALLOWLIST_MODE]
    );

    const importAllowlistInput = document.querySelector('#importAllowlistInput');
    const importAllowlistBtn = document.querySelector('#allowlistImport');
    const exportAllowlistBtn = document.querySelector('#allowlistExport');

    const session = editor.getSession();

    session.addEventListener('change', () => {
        applyChangesBtn.classList.remove('disabled');
        if (session.getValue().length > 0) {
            exportAllowlistBtn.classList.remove('disabled');
        } else {
            exportAllowlistBtn.classList.add('disabled');
        }
    });

    importAllowlistBtn.addEventListener('click', (event) => {
        event.preventDefault();
        importAllowlistInput.click();
    });

    importAllowlistInput.addEventListener('change', async (event) => {
        try {
            const importedDomains = await utils.importRulesFromFile(event);
            utils.addRulesToEditor(editor, importedDomains);
            saver.saveData();
        } catch (err) {
            /* eslint-disable-next-line no-console */
            console.error(err.message);
        }
    });

    exportAllowlistBtn.addEventListener('click', (event) => {
        event.preventDefault();
        if (exportAllowlistBtn.classList.contains('disabled')) {
            return;
        }

        const fileName = userSettings.values[userSettings.names.DEFAULT_ALLOWLIST_MODE]
            ? 'adguard-allowlist'
            : 'adguard-allowlist-inverted';

        utils.exportFile(fileName, 'txt', editor.getValue())
            .catch((err) => {
                /* eslint-disable-next-line no-console */
                console.error(err.message);
            });
    });

    /**
     * returns true if allowlist is empty
     */
    const isAllowlistEmpty = () => {
        return !editor.getValue().trim();
    };

    return {
        loadAllowlistDomains,
        isAllowlistEmpty,
    };
};

module.exports = AllowlistFilter;
