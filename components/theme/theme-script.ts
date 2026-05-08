import { THEME_PRESETS, THEME_STORAGE_KEY } from './constants'

const defaultTheme = THEME_PRESETS[0].id
const themeIds = JSON.stringify(THEME_PRESETS.map(theme => theme.id))

export const themeScript = `(function() {
  try {
    var storedTheme = window.localStorage.getItem('${THEME_STORAGE_KEY}');
    var themeIds = ${themeIds};
    var theme = themeIds.indexOf(storedTheme) > -1 ? storedTheme : '${defaultTheme}';
    document.documentElement.dataset.theme = theme;
  } catch (e) {}
})();`
