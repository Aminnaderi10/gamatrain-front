import type { ExperienceDTO } from '@/types'
import type { SearchParameters } from '@/composables/useApiService'

export interface ProfileListParams extends SearchParameters {
  'PagingDto.PageFilter.Size': number
  'PagingDto.PageFilter.Skip': number
  'PagingDto.PageFilter.ReturnTotalRecordsCount': boolean
}

export interface ProfileListItemDTO {
  handle: string
  fullName?: string | null
  avatar?: string | null
  skills?: string[] | null
  userRateLevel?: string | null
  onlineStatus?: OnlineStatus | null
}

export interface ProfileListResponseDTO {
  list: ProfileListItemDTO[]
  totalRecordsCount: number
}

export type OnlineStatus = 'Online' | 'ActiveRecently' | 'OnlineToday' | 'ActiveThisWeek' | 'ActiveThisMonth' | 'ActiveLongTimeAgo' | 'NewUser'

export interface ProfileDTO {
  profileView: number
  avatarUri: string
  registrationDate: string
  onlineStatus: OnlineStatus
  biography: string
  skills: string[]
  currentStatusSentence: string
  experiences: ExperienceDTO[]
  firstName: string
  lastName: string
  userRateLevel: string
}

export type Gender = 'Male' | 'Female' | 'Other'
export type ProfileVisibility = 'Private' | 'Public' | 'ConnectionsOnly'

export interface EditProfileDTO {
  countryId?: number
  stateId?: number
  cityId?: number
  schoolId?: number
  firstName?: string
  lastName?: string
  board?: number
  grade?: number
  group?: number
  walletId?: string
  biography?: string
  skills?: string[]
  currentStatusSentence?: string
  handle?: string
  gender?: Gender
  profileVisibility?: ProfileVisibility
  avatar?: File
}

export interface DeleteProfileDTO {
  username: string
  password: string
}

export interface ChangePasswordDTO {
  oldpass: string
  newpass: string
  repeat_newpass: string
}
