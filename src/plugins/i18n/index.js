import { createI18n } from 'vue-i18n'
import Cookies from 'js-cookie'
import messages from '@intlify/vite-plugin-vue-i18n/messages'
import quasarEnLocale from 'quasar/lang/en-Us'
import quasarZhTwTwLocale from 'quasar/lang/zh-TW'

// locale value 要 kebab case
export const locales = {
  en: 'en',
  tw: 'zh-hant-tw',
}

// const messages = {
//   zhTw: {
//     ...zhTwLocale,
//     ...quasarZhTwTwLocale,
//   },
//   en: {
//     ...esLocale,
//     ...quasarEnLocale,
//   },
// }

export function getLanguage () {
  const chooseLanguage = Cookies.get('language')
  if (chooseLanguage) return chooseLanguage

  return 'zh-hant-tw'
}

export const i18n = createI18n({
  allowComposition: true,
  locale: getLanguage(),
  fallbackLocale: locales.tw,
  messages,
  silentTranslationWarn: true,
  silentFallbackWarn: true,
})

export default {
  install (app) {
    app.use(i18n)
    app.config.globalProperties.$isLocale = (locale) => locale === i18n.global.locale
  },
}