<template>
  <base-uploader
    ref="uploader"
    multiple
    :accept="accept"
    :max-file-size="maxFileSize"
    :img-src="imgSrc"
    :disable="disable"
    @added="onFile"
    @rejected="onRejected"
  >
    <template #upload-bottom>
      請上傳 JPG 或 PNG 格式圖片，檔案大小為 {{ maxFileSize/1024000 }}MB。
    </template>
  </base-uploader>
</template>

<script>
import BaseUploader from './BaseUploader.vue'
import { defineComponent, ref } from 'vue-demi'
import { readFileAsDataUrl } from '@/utils/blob'
import useNotify from '@/hooks/useNotify'
export default defineComponent({
  components: {
    BaseUploader,
  },
  props: {
    accept: { type: String, default: 'image/png, image/jpeg, image/jpg' },
    imgSrc: { type: String },
    maxFileSize: { type: Number, default: 2048000 },
    disable: { type: Boolean, default: false },
  },
  emits: ['onFile'],
  setup (props, { emit }) {
    const { notifyError } = useNotify()

    // data
    const uploader = ref()

    const removeQueuedFiles = () => {
      uploader.value.removeQueuedFiles()
    }
    const onFile = async (files) => {
      const tmpFiles = []
      for (const [imageItemIndex, fileItem] of files.entries()) {
        const fileType = fileItem.type
        console.log('🚀 ~ onFile ~ fileType', fileType)
        const readObj = {
          dataUrl: () => { return readFileAsDataUrl(fileItem) },
        }
        const data = await readObj.dataUrl()
        tmpFiles.push({ file: fileItem, base64: data })
      }
      emit('onFile', tmpFiles)
    }
    const onRejected = (rejectedEntries) => {
      for (const [rejectedItemIndex, rejectedItem] of rejectedEntries.entries()) {
        const file = rejectedItem.file
        const fileType = file.type
        const size = file.size
        if (!props.accept.includes(fileType)) notifyError({ message: `${file.name}格式錯誤` })
        if (size > props.maxFileSize) notifyError({ message: `${file.name}大小超過可上傳大小` })
      }
    }

    return {
      uploader,
      removeQueuedFiles,
      onFile,
      onRejected,
    }
  },
})
</script>

<style lang="scss" scoped>
</style>
