<template>
  <base-dialog v-model="isShowDialog" title="職稱詳情 : " @save="onSave" @hide="onHide">
    <base-form ref="form">
      <div class="row">
        <div class="col-xs-12 col-sm-12 col-md-12">
          <input-text
            v-model="data.state.name"
            class="full-width"
            label="職稱 *"
            placeholder="請輸入職稱"
            :rules="[$rules.required('職稱必填')]"
          />
        </div>
      </div>
    </base-form>
  </base-dialog>
</template>

<script>
import { defineComponent } from 'vue-demi'
import { baseApiModules } from '@/api'
import { baseModules } from '@/class'
import useDialog from '@/hooks/useDialog'

const companyJobResource = new baseApiModules.CompanyJobResource()

export default defineComponent({
  emits: ['save'],
  setup (props, { emit }) {
    // methods
    const readFetch = async (id, payload) => {
      return await companyJobResource.get(id, payload)
    }
    const createFetch = async (payload) => {
      return await companyJobResource.post(payload)
    }
    const updateFetch = async (id, payload) => {
      return await companyJobResource.patch(id, payload)
    }
    const onSave = async () => {
      const [res, error] = await save()
      if (res) emit('save')
    }
    const onHide = () => {
      data.reset()
    }

    // use
    const { form, data, isShowDialog, showDialog, save } = useDialog({
      formData: new baseModules.CompanyJob(),
      readFetch: readFetch,
      createFetch: createFetch,
      updateFetch: updateFetch,
    })

    return {
      form,
      data,
      isShowDialog,
      showDialog,
      onSave,
      onHide,
    }
  },
})
</script>

<style lang="scss" scoped>
</style>
