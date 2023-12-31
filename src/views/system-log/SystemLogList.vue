<template>
  <q-page class="q-pa-lg">
    <page-header>
      {{ $t('operate-log.title') }}
    </page-header>

    <q-card class="shadow-7">
      <card-body>
        <system-log-list-search-block
          v-model="search"
          class="q-mb-sm"
          @changeFilter="onChangeFilter"
          @reset="onReset"
        />
        <vxe-server-table
          ref="dataTable"
          :data="data"
          :total="total"
          :current="search.page"
          @sort-change="OnChangeSort"
          @update:current="onChangePage"
        >
          <vxe-column
            v-for="{ field, title, min_width } in tableFields"
            :key="field"
            :field="field"
            :title="title"
            sortable
            :min-width="min_width"
          />
        </vxe-server-table>
      </card-body>
    </q-card>
  </q-page>
</template>

<script>
import SystemLogListSearchBlock from './components/SystemLogListSearchBlock.vue'
import { baseApiModules } from '@/api'
import { defineComponent, ref, reactive } from 'vue-demi'
import useCRUD from '@/hooks/useCRUD'
import useVxeServerDataTable from '@/hooks/useVxeServerDataTable'

const systemResource = new baseApiModules.SystemResource()

export default defineComponent({
  components: {
    SystemLogListSearchBlock,
  },
  setup () {
    // data
    const filter = reactive({
      keyword: null,
    })
    const tableFields = ref([
      { title: '操作人員', field: 'user.name', min_width: '130' },
      { title: '帳號', field: 'user.account', min_width: '130' },
      { title: '操作日期', field: 'created_at', min_width: '130' },
      { title: '操作描述', field: 'description', min_width: '130' },
      { title: 'IP位置', field: 'sourceip', min_width: '130' },
    ])

    // methods
    const fetchData = async (payload) => {
      return await systemResource.recordLoglist(payload).then((res) => {
        data.value = []
        data.value = res.list
        total.value = res.total
      })
    }

    const refreshFetch = async () => {
      await getDataList({ ...search })
    }

    const { dataTable, search, data, total, onChangePage, onChangeFilter, OnChangeSort, onReset } = useVxeServerDataTable({
      searchParames: filter,
      sortParames: [{
        field: 'id',
        order: 'desc',
      }],
      sessionStorageKey: 'dashboardSystemLogServerDataTable',
      callback: refreshFetch,
    })

    const { callReadListFetch: getDataList } = useCRUD({
      readListFetch: fetchData,
    })

    return {
      dataTable,
      tableFields,
      filter,
      data,
      total,
      search,
      onChangePage,
      onChangeFilter,
      OnChangeSort,
      onReset,
    }
  },
})
</script>

<style lang="scss" scoped>
</style>
