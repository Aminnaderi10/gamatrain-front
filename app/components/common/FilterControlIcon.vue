<template>
  <span class="filter-control-icon-content">
    <v-img
      v-if="resolvedIcon.type === 'image'"
      :src="resolvedIcon.src"
      :alt="resolvedIcon.alt"
      :class="resolvedIcon.className"
      contain
      @error="handleImageError"
    />
    <v-icon
      v-else
      :icon="resolvedIcon.icon"
      :class="resolvedIcon.className"
      :size="resolvedIcon.size || 28"
    />
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
  fallbackIconPadding: {
    type: Number,
    default: 0,
  },
  controlIcon: {
    type: String,
    default: '',
  },
})

const getIconSrc = item => props.iconSrc?.(item) || item.icon
const { hasIconFailed, markIconFailed } = useIconFallback()
const selectedIconSrc = computed(() => props.selectedItem
  ? getIconSrc(props.selectedItem)
  : '')

const fallbackIconSize = computed(() => 28 - (props.fallbackIconPadding * 2))

const resolvedIcon = computed(() => {
  if (props.showItemIcon && props.selectedItem?.icon && !hasIconFailed(selectedIconSrc.value)) {
    return {
      type: 'image',
      src: selectedIconSrc.value,
      alt: props.selectedItem.title,
      className: '',
      selectedImage: true,
    }
  }

  if (props.showItemIcon && props.selectedItem?.contentIcon) {
    return {
      type: 'icon',
      icon: undefined,
      className: `${props.selectedItem.contentIcon} search-filter-content-icon text-brandNavy`,
      selectedImage: false,
    }
  }

  return {
    type: 'icon',
    icon: props.controlIcon || props.fallbackIcon,
    className: 'filter-control-material-icon',
    size: props.controlIcon ? 28 : fallbackIconSize.value,
    selectedImage: false,
  }
})

const handleImageError = () => {
  if (resolvedIcon.value.selectedImage) markIconFailed(resolvedIcon.value.src)
}
</script>

<style scoped>
.filter-control-icon-content {
  display: contents;
}

.filter-control-material-icon {
  color: rgb(var(--v-theme-brandNavy));
  background: transparent !important;
}
</style>
