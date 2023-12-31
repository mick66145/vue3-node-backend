<template>
  <q-page class="q-pa-lg">
    <page-header showPrev>權限詳情</page-header>
    <base-form ref="form">
      <div class="row q-col-gutter-x-md q-col-gutter-y-md">
        <div class="col-12">
          <q-card class="shadow-7">
            <card-header>
              權限資訊
            </card-header>
            <card-body class="q-pt-none">
              <div class="row q-col-gutter-x-md q-col-gutter-y-xs">
                <div class="col-xs-12 col-sm-6 col-md-6">
                  <input-text
                    v-model="formData.name"
                    class="full-width"
                    label="權限群組名稱*"
                    placeholder="請輸入權限群組名稱"
                    :rules="[$rules.required('權限群組名稱必填')]"
                  />
                </div>
              </div>
            </card-body>
          </q-card>
        </div>
        <div class="col-12">
          <q-card class="shadow-7">
            <card-header>
              權限設定
            </card-header>
            <card-body class="q-pt-none">
              <input-checkbox v-model="allSelectd" label="全選" @update:modelValue="onSelectAll" />
              <div class="row q-col-gutter-x-md q-col-gutter-y-xs">
                <div v-for="menuPermissionItem in menuPermissionList" :key="menuPermissionItem" class="col-12">
                  <q-card
                    class="shadow-0 permissions-card"
                    bordered
                  >
                    <q-card-section class="bg-gray-100">
                      <div class="text-h6">{{ menuPermissionItem.name }}</div>
                    </q-card-section>
                    <q-card-section vertical class="p-0">
                      <div v-for="(childItem,index) in menuPermissionItem.childs" :key="childItem">
                        <div class="p-2 row items-center">
                          <span class="h-full col-md-2 col-sm-3 permissions-title ">
                            {{ childItem.name }}
                          </span>
                          <div class="col-md-2 col-sm-3">
                            <input-checkbox v-model="childItem.allSelectd" label="全選" @update:modelValue="childItem.onSelectAll(childItem.allSelectd);refreshAllSelectd()" />
                          </div>
                          <div
                            v-for="permissionItem in childItem.permissions"
                            :key="permissionItem"
                            class="flex col-md-2 col-sm-3"
                          >
                            <input-checkbox
                              v-model="permissionItem.is_active"
                              :label="permissionItem.display_name"
                              :val="permissionItem"
                              @update:modelValue="childItem.refreshAllSelectd();refreshAllSelectd()"
                            />
                          </div>
                        </div>
                        <q-separator v-show="menuPermissionItem.childs.length - 1 !== index" class="w-full" />
                      </div>
                    </q-card-section>
                  </q-card>
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
import { breadthFirstSearch } from '@/utils/tree'
import useCRUD from '@/hooks/useCRUD'
import useGoBack from '@/hooks/useGoBack'
import _ from 'lodash-es'

const roleResource = new baseApiModules.RoleResource()
const menuPermissionResource = new baseApiModules.MenuPermissionResource()

export default defineComponent({
  props: {
    mode: { type: String, requred: true },
  },
  setup (props) {
    // data
    const { mode } = toRefs(props)
    const route = useRoute()
    const formData = ref(new baseModules.Role())
    const allSelectd = ref(false)
    const menuPermissionList = ref([])
    const id = route.params.id || null

    // mounted
    onMounted(async () => {
      await callMenuPermissionListFetch()
      if (id) {
        const [res] = await callReadFetch(id)
        const permissions = _(res.permissions).map('id').value()
        formData.value = res
        menuPermissionList.value.forEach(element => { element.setPermission(permissions) })
        refreshAllSelectd()
      }
    })

    // methods
    const readFetch = async (id, payload) => {
      return await roleResource.get(id, payload)
    }
    const createFetch = async (payload) => {
      return await roleResource.post(payload)
    }
    const updateFetch = async (id, payload) => {
      return await roleResource.patch(id, payload)
    }
    const fetchMenuPermissionData = async () => {
      return await menuPermissionResource.list().then((res) => {
        menuPermissionList.value = []
        menuPermissionList.value = res.list
      })
    }
    const onSubmit = async () => {
      form.value.validate().then(async (success) => {
        if (success) {
          const payload = { ...formData.value }
          payload.permissions = []
          breadthFirstSearch(menuPermissionList.value, node => {
            node.permissions.forEach(element => {
              (element.is_active) && (payload.permissions.push(element))
            })
          })
          const urlObj = {
            create: () => { return callCreateFetch({ ...payload }) },
            edit: () => {
              return callUpdateFetch(id, { ...payload })
            },
          }
          const [res] = mode.value === 'create' ? await urlObj.create() : await urlObj.edit()
          if (res) goBack()
        }
      })
    }
    const onSelectAll = (value) => {
      menuPermissionList.value.forEach(element => { element.onSelectAll(value) })
    }
    const refreshAllSelectd = () => {
      allSelectd.value = menuPermissionList.value.every(element => element.everyAllSelectd())
    }

    // use
    const { goBack } = useGoBack()
    const { form, callReadFetch, callCreateFetch, callUpdateFetch } = useCRUD({
      readFetch: readFetch,
      createFetch: createFetch,
      updateFetch: updateFetch,
    })
    // role
    const { callReadListFetch: callMenuPermissionListFetch } = useCRUD({
      readListFetch: fetchMenuPermissionData,
    })

    return {
      form,
      formData,
      allSelectd,
      menuPermissionList,
      onSubmit,
      onSelectAll,
      refreshAllSelectd,
    }
  },
})
</script>

<style lang="scss" scoped>
.permissions-card {
  @apply mb-4;

  .permissions-title {
    @apply m-0 pl-3  self-center;
  }
}
</style>
