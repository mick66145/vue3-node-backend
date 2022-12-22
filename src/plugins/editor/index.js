import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

export default {
  install (app) {
    app.component('VueEditor', QuillEditor)
  },
}
