<template>
  <q-page class="q-pa-lg">
    <page-header showPrev> 帳號詳情 </page-header>
    <q-card class="shadow-7">
      <card-header>
        帳號資訊
      </card-header>
      <card-body class="q-pt-none">
        <base-form ref="form">
          <div class="row q-col-gutter-x-md q-col-gutter-y-xs">
            <div class="col-xs-12 col-sm-6 col-md-6">
              <input-text
                v-model="formData.account"
                class="full-width"
                label="帳號 *"
                placeholder="請輸入帳號"
                :rules="[$rules.required('帳號必填')]"
                :disable="mode==='edit'"
              />
            </div>
            <div v-if="mode==='create'" class="col-xs-12 col-sm-6 col-md-6">
              <input-password
                v-model="formData.password"
                class="full-width"
                label="密碼 *"
                autocomplete="new-password"
                placeholder="請輸入密碼"
                :rules="[
                  $rules.required('密碼必填'),
                  $rules.regex(/^(?=.*\d)(?=.*[a-zA-Z])(?=.*\W)(?!.* ).{8,}$/i,'格式錯誤，密碼需為 8 至 255 個字元長度，包含數字、英文字母和特殊符號')
                ]"
              >
                <template #hint>
                  密碼需為 8 至 255 個字元長度，包含數字、英文字母和特殊符號。
                </template>
              </input-password>
            </div>
            <div class="col-xs-12 col-sm-6 col-md-6">
              <input-text
                v-model="formData.name"
                class="full-width"
                label="人員名稱 *"
                placeholder="請輸入人員名稱"
                :rules="[$rules.required('人員名稱必填')]"
              />
            </div>
            <div class="col-xs-12 col-sm-6 col-md-6">
              <input-email
                v-model="formData.email"
                class="full-width"
                label="Email"
                placeholder="請輸入Email"
              />
            </div>
            <div class="col-xs-12 col-sm-6 col-md-6">
              <input-company-select
                v-model="formData.company"
                class="full-width"
                label="所屬公司"
                placeholder="請選擇所屬公司"
              />
            </div>
            <div class="col-xs-12 col-sm-6 col-md-6">
              <input-select
                v-model="formData.company_job"
                :options="companyJobList"
                class="full-width"
                label="職稱"
                placeholder="請選擇職稱"
              />
            </div>
            <div class="col-xs-12 col-sm-6 col-md-6">
              <input-select
                v-model="formData.role"
                :options="roleList"
                class="full-width"
                label="權限群組 *"
                placeholder="請選擇權限群組"
              />
            </div>
            <div class="col-xs-12 col-sm-12 col-md-12">
              <input-textarea
                v-model="formData.remark"
                class="full-width"
                label="備註"
              />
            </div>
          </div>
        </base-form>
      </card-body>
    </q-card>
  </q-page>
  <fixed-footer go-back-route="/user" @save="onSubmit" />
</template>

<script>

import { defineComponent, ref, toRefs, watchEffect, onMounted } from 'vue-demi'
import { baseModules } from '@/class'
import { useRoute } from 'vue-router'
import { baseApiModules } from '@/api'
import useCRUD from '@/hooks/useCRUD'
import useGoBack from '@/hooks/useGoBack'

const userResource = new baseApiModules.UserResource()
const roleResource = new baseApiModules.RoleResource()
const companyJobResource = new baseApiModules.CompanyJobResource()

export default defineComponent({
  props: {
    mode: { type: String, requred: true },
  },
  setup (props) {
    // data
    const { mode } = toRefs(props)
    const route = useRoute()
    const formData = ref(new baseModules.User())
    const roleList = ref([])
    const companyJobList = ref([])

    const fallBack = { name: 'UserList' }
    const id = route.params.id || null

    // mounted
    onMounted(async () => {
      await callRoleListFetch()
      await callCompanyJobListFetch()
      if (id) {
        const [res] = await callReadFetch(id)
        formData.value = res
      }
    })

    // methods
    const readFetch = async (id, payload) => {
      return await userResource.get(id, payload)
    }
    const createFetch = async (payload) => {
      return await userResource.post(payload)
    }
    const updateFetch = async (id, payload) => {
      return await userResource.patch(id, payload)
    }
    const fetchRoleData = async (payload) => {
      return await roleResource.list(payload).then((res) => {
        roleList.value = []
        roleList.value = res.list
      })
    }

    const fetchCompanyJobData = async (payload) => {
      return await companyJobResource.list(payload).then((res) => {
        companyJobList.value = []
        companyJobList.value = res.list
      })
    }

    const onSubmit = async () => {
      form.value.validate().then(async (success) => {
        if (success) {
          const payload = { ...formData.value }
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

    // use
    const { goBack } = useGoBack({ fallBack })
    const { form, callReadFetch, callCreateFetch, callUpdateFetch } = useCRUD({
      readFetch: readFetch,
      createFetch: createFetch,
      updateFetch: updateFetch,
    })
    // role
    const { callReadListFetch: callRoleListFetch } = useCRUD({
      readListFetch: fetchRoleData,
    })
    // role
    const { callReadListFetch: callCompanyJobListFetch } = useCRUD({
      readListFetch: fetchCompanyJobData,
    })

    // watch
    watchEffect(async () => {
      if (!id) return
      const [res, error] = await callReadFetch(id)
      formData.value = res
    })

    return {
      formData,
      form,
      roleList,
      companyJobList,
      onSubmit,
    }
  },
})
</script>

<style lang="scss" scoped>

</style>
