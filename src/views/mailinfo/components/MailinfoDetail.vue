<template>
  <q-page class="q-pa-lg">
    <page-header showPrev>
      信件詳情
    </page-header>
    <base-form ref="form">
      <div class="row q-col-gutter-x-md q-col-gutter-y-md">
        <div class="col-12">
          <q-card class="shadow-7">
            <card-header>
              信件資訊
            </card-header>
            <card-body class="q-pt-none">
              <div class="flex-center row q-col-gutter-x-md q-col-gutter-y-xs">
                <div class="col-12 col-md-6">
                  <input-text
                    v-model="formData.subject"
                    class="full-width"
                    label="信件主旨 *"
                    placeholder="請輸入信件主旨"
                    :rules="[$rules.required('信件主旨必填')]"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <input-text
                    v-model="formData.fromname"
                    class="full-width"
                    label="寄件者名稱"
                    placeholder="請輸入寄件者名稱"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <input-text
                    v-model="formData.repeatname"
                    class="full-width"
                    label="回覆者名稱"
                    placeholder="請輸入回覆者名稱"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <input-email
                    v-model="formData.repeatmail"
                    class="full-width"
                    label="回覆者信箱"
                    placeholder="請輸入回覆者信箱"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <input-email
                    v-model="formData.cc"
                    class="full-width"
                    label="副本信箱"
                    placeholder="請輸入副本信箱"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <input-email
                    v-model="formData.bcc"
                    class="full-width"
                    label="密件副本信箱"
                    placeholder="請輸入密件副本信箱"
                  />
                </div>
              </div>
            </card-body>
          </q-card>
        </div>
        <div class="col-xs-12 col-sm-12 col-md-12">
          <q-card class="shadow-7">
            <card-header>
              信件內文
            </card-header>
            <card-body class="q-pt-none">
              <div class="row q-col-gutter-x-md q-col-gutter-y-xs">
                <div class="col-xs-12 col-sm-12 col-md-12">
                  <input-editor
                    v-model="formData.content_json"
                    class="full-width"
                  />
                </div>
              </div>
            </card-body>
          </q-card>
        </div>
      </div>
    </base-form>
  </q-page>
  <fixed-footer @save="onSubmit" />
</template>

<script>
import { defineComponent, ref, toRefs, onMounted } from 'vue-demi'
import { useRoute } from 'vue-router'
import { baseApiModules } from '@/api'
import { baseModules } from '@/class'
import useCRUD from '@/hooks/useCRUD'
import useGoBack from '@/hooks/useGoBack'
import useDeltaConvert from '@/hooks/useDeltaConvert'

const mailinfoResource = new baseApiModules.MailinfoResource()

export default defineComponent({
  components: {
  },
  props: {
    mode: { type: String, requred: true },
  },
  setup (props) {
    // data
    const { mode } = toRefs(props)
    const route = useRoute()
    const formData = ref(new baseModules.Mailinfo())
    const id = route.params.id || null

    // methods
    const readFetch = async (id, payload) => {
      return await mailinfoResource.get(id, payload)
    }
    const createFetch = async (payload) => {
      return await mailinfoResource.post(payload)
    }
    const updateFetch = async (id, payload) => {
      return await mailinfoResource.patch(id, payload)
    }

    const onSubmit = async () => {
      form.value.validate().then(async (success) => {
        if (success) {
          const payload = { ...formData.value }
          payload.content = payload.content_json ? renderHtml(payload.content_json?.ops || []) : ''
          payload.content_json = JSON.stringify(payload.content_json)
          const urlObj = {
            create: () => { return callCreateFetch({ ...payload }) },
            edit: () => {
              return callUpdateFetch(id, { ...payload })
            },
          }
          const [res, error] = mode.value === 'create' ? await urlObj.create() : await urlObj.edit()
          if (res) goBack()
        }
      })
    }

    // mounted
    onMounted(async () => {
      if (id) {
        const [res, error] = await callReadFetch(id)
        formData.value = res
      }
    })

    // use
    const { goBack } = useGoBack()
    const { form, callReadFetch, callCreateFetch, callUpdateFetch } = useCRUD({
      readFetch: readFetch,
      createFetch: createFetch,
      updateFetch: updateFetch,
    })
    const { renderHtml } = useDeltaConvert()

    return {
      form,
      formData,
      onSubmit,
    }
  },
})
</script>

<style lang="scss" scoped>

</style>
