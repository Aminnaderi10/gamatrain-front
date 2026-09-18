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
      <div
        class="inline-filter-options"
        :style="inlineGrouped
          ? { gridTemplateColumns: `max-content repeat(${inlineItemsPerRow}, max-content)` }
          : undefined"
      >
        <span
          v-for="slot in inlineLeadingOptionSlots"
          :key="`inline-option-spacer-${slot}`"
          class="inline-filter-option-spacer"
          aria-hidden="true"
        />
      <v-btn
        v-if="inlineAllowClear"
        variant="outlined"
        class="inline-filter-option"
        :class="{ 'inline-filter-option-selected': !selectedItem }"
        :style="inlineGrouped ? { gridColumn: 1, gridRow: 1 } : undefined"
        :disabled="disabled"
        @click="onFilterUpdate(null)"
      >
        All
      </v-btn>
        <v-btn
          v-for="(item, itemIndex) in items"
          :key="item.id"
          variant="outlined"
          class="inline-filter-option"
          :class="{
            'inline-filter-option-selected': selectedItem?.id == item.id,
            'inline-filter-option-multi-digit': isMultiDigitInlineOption(item),
          }"
          :style="inlineGrouped
            ? {
              gridColumn: (itemIndex % inlineItemsPerRow) + (inlineAllowClear ? 2 : 1),
              gridRow: Math.floor(itemIndex / inlineItemsPerRow) + 1,
            }
            : undefined"
          :disabled="disabled"
          @click="onFilterUpdate(item)"
        >
          {{ getInlineItemTitle(item) }}
        </v-btn>
      </div>
    </div>
    <div
      v-if="inlineDividerAfter"
      class="inline-filter-divider"
    />
  </div>
  <v-btn
    v-else
    :class="[
      'text-h5',
      { 'open-style-btn': isShowSelectModal || (selectedItem && selectedVariant !== 'dependent-green') },
      { 'dependent-selected-btn': selectedItem && selectedVariant === 'dependent-green' },
      { 'search-filter-empty': !selectedItem },
      { 'search-filter-control': boxed },
      { 'search-filter-has-icon': showItemIcon || controlIcon },
    ]"
    variant="outlined"
    :rounded="boxed ? 'lg' : 'xl'"
    value="board"
    color="grey200"
    :disabled="disabled"
    :loading="loading"
    @click="isShowSelectModal = !isShowSelectModal"
  >
    <span
      v-if="showItemIcon || controlIcon"
      class="search-filter-icon text-brandNavy mr-2"
      :class="{ 'search-filter-icon-padded pa-1': controlIconPadded }"
    >
      <CommonFilterControlIcon
        :selected-item="selectedItem"
        :show-item-icon="showItemIcon"
        :icon-src="iconSrc"
        :fallback-icon="fallbackIcon"
        :fallback-icon-padding="fallbackIconPadding"
        :control-icon="controlIcon"
      />
    </span>
    <span
      v-if="boxed"
      class="search-filter-copy text-grey700"
    >
      <span class="search-filter-label">{{ title }}</span>
      <span
        v-if="selectedItem"
        class="search-filter-value"
      >{{ selectedItem.title }}</span>
    </span>
    <span
      v-else
      class="text-grey700"
    >{{ selectedItem ? selectedItem.title : title }}</span>
    <template #append>
      <v-icon
        v-if="showClear && selectedItem"
        class="search-filter-clear-icon mr-1"
        color="grey500"
        size="18"
        role="button"
        tabindex="0"
        :aria-label="`Clear ${title}`"
        @click.stop="emit('clear')"
        @keydown.enter.stop.prevent="emit('clear')"
        @keydown.space.stop.prevent="emit('clear')"
      >
        md:cancel
      </v-icon>
      <v-icon
        class="mt-1"
        color="grey500"
      >
        md:keyboard_arrow_down
      </v-icon>
    </template>
  </v-btn>

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
  selectedVariant: {
    type: String,
    default: '',
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
const getInlineItemTitle = item => props.itemTitle?.(item) || item.title
const isMultiDigitInlineOption = item =>
  /^\d{2,}$/.test(String(getInlineItemTitle(item)).trim())

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
  if (!id) return null

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

<style>
.search-filter-control {
  min-width: 152px;
  height: 52px !important;
  justify-content: space-between;
  padding-inline: 16px;
  color: rgb(var(--v-theme-brandNavy));
  background: rgb(var(--v-theme-grey25));
  border-color: rgb(var(--v-theme-borderSubtle)) !important;
  border-radius: 12px !important;
  transition: background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

.search-filter-control:hover {
  background: rgb(var(--v-theme-surfaceSecondary));
  border-color: rgb(var(--v-theme-academicGoldHover)) !important;
}

.search-filter-control:focus-visible {
  box-shadow: 0 0 0 3px rgba(var(--v-theme-academicGold), 0.28);
}

.search-filter-icon {
  box-sizing: border-box;
  display: inline-flex;
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
}

.search-filter-icon .v-img {
  width: 100%;
  height: 100%;
}

.search-filter-content-icon {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  line-height: 1;
}

.search-filter-icon-padded .v-icon {
  width: 100%;
  height: 100%;
  min-width: 0;
  font-size: 20px !important;
}

.search-filter-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}

.search-filter-label {
  font-size: 12px;
  font-weight: 500;
  color: rgba(var(--v-theme-brandNavy), 0.68);
}

.search-filter-empty .search-filter-label {
  font-size: 16px;
  font-weight: 600;
  color: rgb(var(--v-theme-brandNavy));
}

.search-filter-value {
  max-width: 120px;
  overflow: hidden;
  font-size: 14px;
  font-weight: 650;
  color: rgb(var(--v-theme-brandNavy));
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-filter-control .v-btn__content {
  flex: 1;
  justify-content: flex-start;
  overflow: hidden;
}

.search-filter-control .v-btn__content > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.open-style-btn {
  background-color: rgb(var(--v-theme-grey25));
  border: 1px solid rgb(var(--v-theme-brandNavy));
}

.open-style-btn:not(.search-filter-empty) {
  color: rgb(var(--v-theme-brandNavy)) !important;
  background-color: rgb(var(--v-theme-borderSubtle)) !important;
  border-color: transparent !important;
}

.open-style-btn:not(.search-filter-empty) .search-filter-label {
  color: rgb(var(--v-theme-brandNavy)) !important;
}

.open-style-btn:not(.search-filter-empty) .search-filter-value,
.open-style-btn:not(.search-filter-empty) .v-icon,
.open-style-btn:not(.search-filter-empty) .search-filter-content-icon {
  color: rgb(var(--v-theme-brandNavy)) !important;
}

.dependent-selected-btn {
  color: rgb(var(--v-theme-brandNavy)) !important;
  background-color: rgb(var(--v-theme-borderSubtle)) !important;
  border-color: transparent !important;
}

.dependent-selected-btn .search-filter-label {
  color: rgb(var(--v-theme-brandNavy)) !important;
}

.dependent-selected-btn .search-filter-value,
.dependent-selected-btn .v-icon,
.dependent-selected-btn .search-filter-content-icon {
  color: rgb(var(--v-theme-brandNavy)) !important;
}

.v-btn .search-filter-clear-icon {
  color: rgb(var(--v-theme-grey500)) !important;
}

.open-style-btn:not(.search-filter-empty) .search-filter-clear-icon,
.dependent-selected-btn .search-filter-clear-icon {
  color: rgb(var(--v-theme-grey500)) !important;
}

.v-btn .search-filter-clear-icon:hover {
  color: rgb(var(--v-theme-errorStrong)) !important;
}

.v-btn:has(.search-filter-clear-icon:hover) {
  --v-hover-opacity: 0;
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

.inline-filter-option {
  width: auto;
  min-width: 0;
  max-width: none;
  height: auto !important;
  padding: 8px 12px !important;
  border-radius: 12px !important;
  font-size: 14px;
  line-height: 20px;
  color: rgb(var(--v-theme-brandNavy));
  background: rgb(var(--v-theme-grey25));
  border-color: rgb(var(--v-theme-borderSubtle)) !important;
  transition: background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

.inline-filter-option-multi-digit {
  padding-inline: 8px !important;
}

.inline-filter-option-selected {
  color: rgb(var(--v-theme-white)) !important;
  background: rgb(var(--v-theme-brandNavy)) !important;
  border-color: rgb(var(--v-theme-brandNavy)) !important;
  box-shadow: 0 1px 2px rgba(var(--v-theme-brandNavy), 0.16);
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

.inline-filter-option-spacer {
  width: var(--inline-filter-option-width);
  min-width: var(--inline-filter-option-width);
  height: var(--inline-filter-option-height);
  flex: 0 0 var(--inline-filter-option-width);
}
</style>
