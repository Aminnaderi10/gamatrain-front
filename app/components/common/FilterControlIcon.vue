<template>
  <span class="filter-control-icon-content">
    <v-img
      v-if="showItemIcon && selectedItem?.icon && !selectedIconFailed"
      :src="getIconSrc(selectedItem)"
      :alt="selectedItem.title"
      contain
      @error="selectedIconFailed = true"
    />
    <span
      v-else-if="showItemIcon && selectedItem?.contentIcon"
      :class="`${selectedItem.contentIcon} search-filter-content-icon`"
      :style="{ color: selectedItem.color }"
    />
    <span
      v-else-if="controlIconSvg"
      class="search-filter-inline-svg-icon"
    >
      <svg
        width="28"
        height="28"
        :viewBox="controlIconSvg.viewBox"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          v-for="path in controlIconSvg.paths"
          :key="path"
          :d="path"
          fill="currentColor"
          stroke="currentColor"
          :stroke-width="controlIconSvg.strokeWidth"
          stroke-linejoin="round"
          paint-order="stroke fill"
        />
      </svg>
    </span>
    <span
      v-else-if="controlIconSrc"
      class="search-filter-svg-icon"
      :style="{
        maskImage: `url(${controlIconSrc})`,
        WebkitMaskImage: `url(${controlIconSrc})`,
      }"
    />
    <img
      v-else-if="emptyFallbackIconSrc || fallbackIconSrc"
      :src="!selectedItem && emptyFallbackIconSrc ? emptyFallbackIconSrc : fallbackIconSrc"
      alt=""
      class="search-filter-fallback-image"
      :style="fallbackIconPadding
        ? {
          width: `${28 - (fallbackIconPadding * 2)}px`,
          height: `${28 - (fallbackIconPadding * 2)}px`,
        }
        : undefined"
    >
    <v-icon
      v-else
      size="28"
    >{{ controlIcon || fallbackIcon }}</v-icon>
  </span>
</template>

<script setup>
const props = defineProps({
  selectedItem: {
    type: Object,
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
  fallbackIconSrc: {
    type: String,
    default: '',
  },
  emptyFallbackIconSrc: {
    type: String,
    default: '',
  },
  fallbackIconPadding: {
    type: Number,
    default: 0,
  },
  controlIcon: {
    type: String,
    default: '',
  },
  controlIconSrc: {
    type: String,
    default: '',
  },
  controlIconSvg: {
    type: Object,
    default: null,
  },
})

const selectedIconFailed = ref(false)

watch(
  () => props.selectedItem?.icon,
  () => {
    selectedIconFailed.value = false
  },
)

const getIconSrc = item => props.iconSrc?.(item) || item.icon
</script>

<style scoped>
.filter-control-icon-content {
  display: contents;
}
</style>
