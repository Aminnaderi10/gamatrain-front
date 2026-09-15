<template>
  <span class="filter-control-icon-content">
    <v-img
      v-if="resolvedIcon.type === 'image'"
      :src="resolvedIcon.src"
      :alt="resolvedIcon.alt"
      :class="resolvedIcon.className"
      :style="resolvedIcon.style"
      contain
      @error="handleImageError"
    />
    <v-icon
      v-else
      :icon="resolvedIcon.icon"
      :class="resolvedIcon.className"
      :style="resolvedIcon.style"
      size="28"
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
})

const getIconSrc = item => props.iconSrc?.(item) || item.icon
const { hasIconFailed, markIconFailed } = useIconFallback()
const selectedIconSrc = computed(() => props.selectedItem
  ? getIconSrc(props.selectedItem)
  : '')

const fallbackImageStyle = computed(() => props.fallbackIconPadding
  ? {
      width: `${28 - (props.fallbackIconPadding * 2)}px`,
      height: `${28 - (props.fallbackIconPadding * 2)}px`,
    }
  : undefined)

const resolvedIcon = computed(() => {
  if (props.showItemIcon && props.selectedItem?.icon && !hasIconFailed(selectedIconSrc.value)) {
    return {
      type: 'image',
      src: selectedIconSrc.value,
      alt: props.selectedItem.title,
      className: '',
      style: undefined,
      selectedImage: true,
    }
  }

  if (props.showItemIcon && props.selectedItem?.contentIcon) {
    return {
      type: 'icon',
      icon: undefined,
      className: `${props.selectedItem.contentIcon} search-filter-content-icon`,
      style: { color: props.selectedItem.color },
      selectedImage: false,
    }
  }

  if (props.controlIconSrc) {
    return {
      type: 'image',
      src: props.controlIconSrc,
      alt: '',
      className: '',
      style: undefined,
      selectedImage: false,
    }
  }

  const fallbackImageSrc = !props.selectedItem && props.emptyFallbackIconSrc
    ? props.emptyFallbackIconSrc
    : props.fallbackIconSrc

  if (fallbackImageSrc) {
    return {
      type: 'image',
      src: fallbackImageSrc,
      alt: '',
      className: 'search-filter-fallback-image',
      style: fallbackImageStyle.value,
      selectedImage: false,
    }
  }

  return {
    type: 'icon',
    icon: props.controlIcon || props.fallbackIcon,
    className: '',
    style: undefined,
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
</style>
