<template>
  <v-btn
    v-if="showButton"
    variant="text"
    color="info"
    class="text-h5 text-none px-1"
    :prepend-icon="isFollowing ? 'md:notifications' : 'md:notifications_outlined'"
    :loading="checkingStatus || loadingFollow || loadingUnfollow"
    @click="toggleFollow"
  >
    {{ isFollowing ? 'unfollow' : 'follow' }}
  </v-btn>
</template>

<script setup lang="ts">
interface IFollowButton {
  /** The content author's core user id (`user_` on paper, exam and multimedia details). */
  userId: string | number | null | undefined
}

const props = defineProps<IFollowButton>()

const { isAuthenticated } = useAuth()
const { user } = useUser()
const { follow, unFollow, checkConnectionStatus, loadingFollow, loadingUnfollow } = useConnection()

const authorId = computed(() => Number(props.userId))
const hasAuthor = computed(() => Number.isInteger(authorId.value) && authorId.value > 0)
const isOwnContent = computed(() => isAuthenticated.value && user.value?.coreId === authorId.value)
const showButton = computed(() => hasAuthor.value && !isOwnContent.value)

const isFollowing = ref(false)
// The auth cookie is readable on the server, so a signed-in viewer gets the loading state from the first render
// instead of a "follow" that flips to "unfollow" once the status arrives.
const checkingStatus = ref(isAuthenticated.value && hasAuthor.value)
let statusRequest = 0

const refreshStatus = async () => {
  const request = ++statusRequest

  if (!isAuthenticated.value || !hasAuthor.value) {
    isFollowing.value = false
    checkingStatus.value = false
    return
  }

  checkingStatus.value = true
  const response = await checkConnectionStatus({ ids: [authorId.value], idType: 'CoreId' })
  if (request !== statusRequest) return

  isFollowing.value = response.succeeded && !!response.data?.[0]?.isFollowing
  checkingStatus.value = false
}

// No sign-in check here: a signed-out click gets a 401, and useApiService opens the login dialog for it.
const toggleFollow = async () => {
  const response = isFollowing.value
    ? await unFollow(authorId.value)
    : await follow(authorId.value)

  if (response.succeeded) isFollowing.value = !isFollowing.value
  // A refusal such as "already following" means our state is stale, so re-read it.
  else await refreshStatus()
}

onMounted(refreshStatus)
// Logging in through the dialog keeps the page, and navigating between papers reuses this component.
watch([isAuthenticated, authorId], refreshStatus)
</script>
