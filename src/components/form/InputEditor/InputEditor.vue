<template>
  <div class="input-editor">
    <vue-editor
      ref="quill"
      v-model:content="observeValue"
      :placeholder="placeholder"
      theme="snow"
      :readOnly="disabled"
      :toolbar="toolbarOptions"
      :modules="modules"
      :options="options"
    />
    <base-dialog
      v-model="showDialog"
      title="上傳圖片："
      @save="onSave"
      @cancel="onCancelCopper"
    >
      <base-form ref="form">
        <div class="row q-col-gutter-y-md">
          <div class="col-12">
            <div class="h-[275px] w-full" :style="cropperWrapStyle">
              <image-cropper
                v-if="useCropper"
                ref="cropper"
                :source="tempCropper"
              />
              <base-image v-else class="w-full" :src="tempCropper" />
            </div>
          </div>
          <div class="col-12">
            <input-text
              v-model="state.title"
              class="full-width"
              label="圖片標題"
              placeholder="請輸入圖片標題"
            />
          </div>
          <div class="col-12">
            <input-text
              v-model="state.alt"
              class="full-width"
              label="圖片描述文字"
              placeholder="請輸入圖片描述文字"
              hint="做為圖片替代文字，用來描述圖片內容，當圖片失效時才會顯示"
            />
          </div>
        </div>
      </base-form>
    </base-dialog>
  </div>
</template>

<script>
import ImageCropper from '@/components/ImageCropper.vue'
import { useElementBounding, useVModel, watchOnce } from '@vueuse/core'
import { ImageActions } from '@xeger/quill-image-actions'
import { ImageFormats } from '@xeger/quill-image-formats'
import LoadingImage from 'quill-image-uploader/src/blots/image'
import { defineComponent, reactive, ref, computed } from 'vue-demi'
import { ImageBlotAlt, MyImageUploader } from './quillModule'
import isEmpty from 'lodash-es/isEmpty'

import useNotify from '@/hooks/useNotify'
import useBatchUpload from '@/hooks/useBatchUpload'

export default defineComponent({
  components: {
    ImageCropper,
  },
  props: {
    modelValue: { type: [Object, File, String, Number] },
    nativeType: { type: String, default: 'text' },
    placeholder: { type: String, default: '請輸入' },
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    useCropper: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup (props, { emit }) {
    // data
    let tempRaw = null
    let resolveUpload, rejectUpload
    const quill = ref()
    const tempCropper = ref()
    const cropper = ref(null)
    const cropperBounding = useElementBounding(cropper, {
      immediate: true,
    })
    const observeValue = useVModel(props, 'modelValue', emit)
    const toolbarOptions = [
      [
        { header: 1 },
        { header: 2 },
      ],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ size: ['small', false, 'large', 'huge'] }],

      ['bold', 'italic', 'underline'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'image', 'clean'],
    ]
    const options = {
      formats: ['align', 'background', 'bold', 'color', 'float', 'font', 'header', 'height', 'image', 'italic', 'link', 'script', 'strike', 'size', 'underline', 'list', 'width', LoadingImage.blotName, ImageBlotAlt.blotName],
    }
    const state = reactive({
      alt: '',
      title: '',
    })
    const showDialog = ref(false)

    const cropperWrapStyle = computed(() => {
      if (!cropper.value) {
        return {
          height: '275px',
        }
      }
      const { height } = cropperBounding
      return {
        height: height.value + 'px',
      }
    })

    // methods
    const setContents = () => {
      quill.value.setContents(props.modelValue, 'user')
    }
    const upload = (file) => {
      console.log('🚀 ~ upload ~ file', file)
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        notify({ message: '圖片格式錯誤', type: 'negative' })
        return Promise.reject(new Error('格式錯誤'))
      }
      if (file.size / 1024 / 1024 > 2) {
        notify({ message: '圖片大小超過 2 MB', type: 'negative' })
        return Promise.reject(new Error('尺寸錯誤'))
      }
      return new Promise((resolve, reject) => {
        resolveUpload = resolve
        rejectUpload = reject
        onFile(file)
      })
    }
    const onFile = (file) => {
      tempRaw = file
      const reader = new FileReader()

      reader.onload = (event) => {
        tempCropper.value = event.target.result
        showDialog.value = true
      }
      reader.onerror = () => {
        notify({ message: '圖片讀取失敗', type: 'negative' })
        rejectUpload(new Error('圖片讀取失敗'))
      }

      reader.readAsDataURL(file)
    }
    const onSave = async () => {
      let blob
      if (props.useCropper) {
        const { canvas } = await cropper.value.getResult()
        blob = await new Promise((resolve) => canvas.toBlob(resolve, tempRaw.type))
      } else {
        blob = URL.createObjectURL(tempRaw)
      }
      const file = props.useCropper ? new File([blob], tempRaw.name, { type: tempRaw.type }) : tempRaw
      const [uploadRes, uploadErrors] = await batchUpload({ imageObj: { raw: file } })
      if (uploadErrors.value) {
        const message = uploadErrors.value.response.data.message
        notifyAPIError({ message })
        return
      }
      const url = uploadRes.imageObj.url
      resolveUpload({ url, ...state })
      showDialog.value = false
    }
    const onCancelCopper = () => {
      rejectUpload(new Error('取消上傳'))
      showDialog.value = false
    }

    // data
    const modules = [
      {
        name: 'ImageActions',
        module: ImageActions,
        options: {
        },
      },
      {
        name: 'ImageFormats',
        module: ImageFormats,
        options: {
        },
      },
      {
        name: 'MyImageUploader',
        module: MyImageUploader,
        options: {
          upload,
        },
      },
    ]

    // use
    const { notify, notifyAPIError } = useNotify()
    const { batchUpload } = useBatchUpload()

    // watch
    watchOnce(() => props.modelValue, (newV, oldV) => {
      isEmpty()
      if (!oldV || isEmpty(oldV)) {
        setContents()
      }
    })

    return {
      quill,
      cropper,
      tempCropper,
      observeValue,
      toolbarOptions,
      options,
      modules,
      state,
      showDialog,
      cropperWrapStyle,
      onFile,
      onSave,
      onCancelCopper,
      upload,
    }
  },
})

</script>

<style lang="scss">
.input-editor {
  @apply h-[450px] w-full;

  .ql-toolbar,
  .ql-container {
    @apply bg-white;
  }

  .ql-toolbar {
    @apply rounded-t border-b-0;
  }

  .ql-container {
    @apply rounded-b;
    @apply font-sans;
    @apply overflow-hidden;

    height: calc(100% - 50px);
  }

  .ql-snow .ql-tooltip {
    @apply z-100;
  }
}
</style>
