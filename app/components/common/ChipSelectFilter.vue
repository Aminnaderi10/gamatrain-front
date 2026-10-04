<template>
  <div
    v-if="inlineOptions"
    class="inline-filter-selector"
    :class="{
      'inline-filter-disabled': disabled,
      'inline-filter-grouped-row': inlineGrouped,
    }"
  >
    <div class="inline-filter-row-content">
      <span class="inline-filter-label">{{ title }}</span>
      <CommonFilterOptionChips
        class="inline-filter-options"
        :style="inlineGrouped
          ? { gridTemplateColumns: `max-content repeat(${inlineItemsPerRow}, max-content)` }
          : undefined"
        :items="items"
        :selected-item="selectedItem"
        :allow-clear="inlineAllowClear"
        :grouped="inlineGrouped"
        :items-per-row="inlineItemsPerRow"
        :leading-spacers="inlineLeadingOptionSlots"
        :disabled="disabled"
        :item-title="itemTitle"
        @select="onFilterUpdate"
      />
    </div>
    <div
      v-if="inlineDividerAfter"
      class="inline-filter-divider"
    />
  </div>
  <!-- Filter panel row (search sidebar and mobile filter sheet) -->
  <v-list-item
    v-else-if="boxed"
    class="search-filter-control text-brandNavy border-b border-surfaceTertiary border-opacity-100"
    :class="{
      'search-filter-selected bg-borderSubtle': selectedItem,
      'search-filter-empty': !selectedItem,
    }"
    min-height="56"
    prepend-gap="8"
    rounded="0"
    :disabled="disabled"
    @click="isShowSelectModal = !isShowSelectModal"
  >
    <template #prepend>
      <!-- Rendered even without an icon so every row's text lines up -->
      <v-avatar
        size="28"
        rounded="0"
        variant="text"
        :class="{ 'pa-1': controlIconPadded }"
      >
        <CommonFilterControlIcon
          v-if="showItemIcon || controlIcon"
          :selected-item="selectedItem"
          :show-item-icon="showItemIcon"
          :icon-src="iconSrc"
          :fallback-icon="fallbackIcon"
          :fallback-icon-padding="fallbackIconPadding"
          :control-icon="controlIcon"
          :icon-size="controlIconPadded ? 20 : null"
        />
      </v-avatar>
    </template>

    <v-list-item-title
      class="search-filter-label"
      :class="selectedItem ? 'font-weight-medium' : 'font-weight-semibold'"
    >
      {{ title }}
    </v-list-item-title>
    <v-list-item-subtitle
      v-if="selectedItem"
      class="search-filter-value font-weight-bold opacity-100"
    >
      {{ selectedItem.title }}
    </v-list-item-subtitle>

    <template #append>
      <v-progress-circular
        v-if="loading"
        indeterminate
        size="16"
        width="2"
        class="mr-2"
      />
      <v-btn
        v-if="showClear && selectedItem"
        class="search-filter-clear-icon mr-1"
        icon
        variant="text"
        density="comfortable"
        size="small"
        color="grey500"
        :aria-label="`Clear ${title}`"
        @click.stop="emit('clear')"
      >
        <v-icon size="18">
          md:cancel
        </v-icon>
      </v-btn>
      <v-icon :color="selectedItem ? 'brandNavy' : 'grey500'">
        md:keyboard_arrow_down
      </v-icon>
    </template>
  </v-list-item>

  <!-- Compact pill (filter bars such as the leader board) -->
  <v-chip
    v-else
    class="text-h5"
    :variant="selectedItem ? 'flat' : 'outlined'"
    :color="selectedItem ? 'borderSubtle' : isShowSelectModal ? 'brandNavy' : 'grey200'"
    size="large"
    :disabled="disabled"
    @click="isShowSelectModal = !isShowSelectModal"
  >
    <v-progress-circular
      v-if="loading"
      indeterminate
      size="16"
      width="2"
      class="mr-2"
    />
    <span :class="selectedItem ? 'text-brandNavy' : 'text-grey700'">
      {{ selectedItem ? selectedItem.title : title }}
    </span>
    <template #append>
      <v-icon
        class="ml-1"
        :color="selectedItem ? 'brandNavy' : 'grey500'"
      >
        md:keyboard_arrow_down
      </v-icon>
    </template>
  </v-chip>

  <search-select-dialog
    v-model:show-dialog="isShowSelectModal"
    :title-modal="title"
    :items="items"
    :selected-item="selectedItem"
    :has-search="hasSearch && !inlineOptions"
    :compact-result-count="boxed"
    :show-item-icon="showItemIcon"
    :icon-src="iconSrc"
    :fallback-icon="fallbackIcon"
    :inline-options="inlineOptions"
    :inline-allow-clear="inlineAllowClear"
    :inline-items-per-row="inlineItemsPerRow"
    :item-title="itemTitle"
    @change-selected-item="onFilterUpdate"
  />
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  hasSearch: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  api: {
    type: [String, null],
    required: true,
  },
  pageFilterSkip: {
    type: Number,
    default: 0,
  },
  pageFilterSize: {
    type: Number,
    default: 1000,
  },
  returnTotalRecordsCount: {
    type: Boolean,
    default: true,
  },
  extraApiParams: {
    type: Object,
    default: () => {},
  },
  selectedItem: {
    type: Object,
    default: () => {},
  },
  staticList: {
    type: Array,
    default: () => [],
  },
  itemFilter: {
    type: Function,
    default: null,
  },
  itemTransform: {
    type: Function,
    default: null,
  },
  itemSort: {
    type: Function,
    default: null,
  },
  listTransform: {
    type: Function,
    default: null,
  },
  showItemIcon: {
    type: Boolean,
    default: false,
  },
  iconSrc: {
    type: Function,
    default: null,
  },
  fallbackIcon: {
    type: String,
    default: 'md:school',
  },
  fallbackIconPadding: {
    type: Number,
    default: 0,
  },
  boxed: {
    type: Boolean,
    default: false,
  },
  showClear: {
    type: Boolean,
    default: false,
  },
  controlIcon: {
    type: String,
    default: '',
  },
  controlIconPadded: {
    type: Boolean,
    default: false,
  },
  inlineOptions: {
    type: Boolean,
    default: false,
  },
  inlineAllowClear: {
    type: Boolean,
    default: false,
  },
  inlineGrouped: {
    type: Boolean,
    default: false,
  },
  inlineItemsPerRow: {
    type: Number,
    default: 3,
  },
  inlineDividerAfter: {
    type: Boolean,
    default: false,
  },
  inlineLeadingOptionSlots: {
    type: Number,
    default: 0,
  },
  itemTitle: {
    type: Function,
    default: null,
  },
})

const emit = defineEmits(['UpdateSelectedItem', 'clear'])

const items = ref([...props.staticList])
const isShowSelectModal = ref(false)
const loading = ref(false)

const onFilterUpdate = (itemSelected) => {
  isShowSelectModal.value = false
  emit('UpdateSelectedItem', itemSelected)
}

const getItems = async (extraIdParam = '') => {
  try {
    loading.value = true
    if (props.api) {
      items.value = []
      const url
        = extraIdParam.toString().length > 0
          ? props.api + '/' + extraIdParam
          : props.api
      const params = {
        ...props.extraApiParams,
      }
      if (props.title == 'School' || props.title == 'Country' || props.title == 'State' || props.title == 'City') {
        params['PagingDto.PageFilter.Skip'] = props.pageFilterSkip
        params['PagingDto.PageFilter.Size'] = props.pageFilterSize
        params['PagingDto.PageFilter.ReturnTotalRecordsCount'] = props.returnTotalRecordsCount
      }

      const response = await useApiService.get(url, params, { public: true })

      if (response.succeeded || response.status == 1) {
        const responseList = response.data.list || response.data
        let transformedList = props.itemTransform
          ? responseList.map(props.itemTransform)
          : responseList
        if (props.listTransform) {
          transformedList = await props.listTransform(transformedList)
        }
        const filteredList = props.itemFilter
          ? transformedList.filter(props.itemFilter)
          : transformedList
        const list = props.itemSort
          ? [...filteredList].sort(props.itemSort)
          : filteredList
        if (props.title == 'School') {
          if (list && list.length > 0) {
            items.value = list.map(s => ({
              title: s.name,
              id: s.id,
            }))
          }
        }
        else {
          items.value = list
        }
      }
    }
  }
  catch (error) {
    console.log('error', error)
  }
  finally {
    loading.value = false
  }
}

const getItemById = (id, filterKey) => {
  if (id === undefined || id === null || id === '') return null

  const searchField = filterKey === 'code' ? 'code' : 'id'

  return items.value.find(item =>
    String(item[searchField]) === String(id),
  ) || null
}

const openSelectModal = () => {
  isShowSelectModal.value = true
}

const openInlineOptionsModal = () => {
  isShowSelectModal.value = true
}

const setStaticItem = (staticItem) => {
  items.value = staticItem
}

const getCurrentItems = () => items.value

defineExpose({
  getItems,
  getItemById,
  getCurrentItems,
  openInlineOptionsModal,
  openSelectModal,
  setStaticItem,
})
</script>

<style scoped>
/* px sizes: the app's 10px root font size makes Vuetify's rem-based list typography too small */
.search-filter-label {
  font-size: 12px;
}

.search-filter-empty .search-filter-label {
  font-size: 16px;
}

.search-filter-value {
  font-size: 14px;
}

.inline-filter-selector {
  --inline-filter-option-width: 72px;
  --inline-filter-option-height: 39px;

  display: flex;
  width: 100%;
  max-width: 1200px;
  min-height: 84px;
  flex: 1 0 100%;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
  padding: 16px 24px;
  margin-top: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-grey300));
  border-radius: 16px;
}

.inline-filter-disabled {
  opacity: var(--v-disabled-opacity);
}

.inline-filter-label {
  margin-right: 72px;
  font-size: 16px;
  font-weight: 650;
  color: rgb(var(--v-theme-brandNavy));
}

.inline-filter-options {
  display: flex;
  flex: 1 1 0;
  align-items: center;
  min-width: 0;
  flex-wrap: wrap;
  gap: 12px;
}

.inline-filter-row-content {
  display: contents;
}

.inline-filter-grouped-row {
  display: block;
  width: max-content;
  max-width: 100%;
  min-height: 0;
  flex: none;
  padding: 0;
  margin: 0;
  border: 0;
  border-radius: 0;
}

.inline-filter-grouped-row .inline-filter-row-content {
  display: grid;
  grid-template-columns: 75px max-content;
  align-items: center;
  column-gap: 72px;
}

.inline-filter-grouped-row .inline-filter-label {
  margin-right: 0;
}

.inline-filter-grouped-row .inline-filter-options {
  flex: none;
  gap: 8px;
}

.inline-filter-divider {
  width: 100%;
  margin: 12px 0;
  border-top: 1px solid rgb(var(--v-theme-borderSubtle));
}

@media only screen and (max-width: 959px) {
  .inline-filter-selector {
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
  }

  .inline-filter-label {
    flex-basis: 100%;
    margin-right: 0;
  }

  .inline-filter-options {
    gap: 12px;
  }

}
</style>
