<template>
  <base-uploader
    :accept="accept"
    :max-file-size="maxFileSize"
    @added="onFile"
    @rejected="onRejected"
  >
    <template #upload-bottom>
      檔案大小為 2MB。
    </template>
  </base-uploader>
</template>

<script>
import BaseUploader from './BaseUploader.vue'
import { defineComponent, ref } from 'vue-demi'
import useNotify from '@/use/useNotify'
export default defineComponent({
  components: {
    BaseUploader,
  },
  props: {
    accept: { type: String },
    maxFileSize: { type: Number, default: 2048000 },
  },
  emits: ['onFile'],
  setup (props, { emit }) {
    const { notify } = useNotify()

    // data
    const uploader = ref()
    const reader = new FileReader()

    const removeQueuedFiles = () => {
      uploader.value.removeQueuedFiles()
    }
    const onFile = (files) => {
      const file = files[0]
      const fileType = file.type
      console.log('🚀 ~ onFile ~ fileType', fileType)
      if (props.accept && !props.accept.includes(fileType)) return notify({ message: '檔案格式錯誤', type: 'negative' })
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        emit('onFile', { file: file, base64: event.target.result })
      }
    }
    const onRejected = (rejectedEntries) => {
      const file = rejectedEntries[0].file
      const fileType = file.type
      const size = file.size
      if (props.accept && !props.accept.includes(fileType)) return notify({ message: '檔案格式錯誤', type: 'negative' })
      if (size > props.maxFileSize) return notify({ message: '檔案大小超過可上傳大小', type: 'negative' })
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