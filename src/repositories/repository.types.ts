export interface JobCreateEntity {
  status?: 'NEW' | 'INPROGRESS' | 'CANCELLED' | 'DONE' | 'EXPIRED' | null
  offeredTotal?: string // number
  createdUser: string
  updatedUser?: string
  userId: number
  truckType: string
  truckAmount: number
  productTypeId: number
  productName: string
  totalWeight: string // number
  tipper: boolean
  priceType: string
  validUntil: Date
  handlingInstruction?: string
  loadingAddress: string
  loadingDatetime: Date
  loadingContactName: string
  loadingContactPhone: string
  loadingLatitude: number
  loadingLongitude: number
  platform?: number
}
export interface JobUpdateEntity {
  offeredTotal?: string // number
  updatedUser?: string
  userId?: number
  truckType?: string
  truckAmount?: number
  productTypeId?: number
  productName?: string
  totalWeight?: string // number
  tipper?: boolean
  priceType?: string
  validUntil?: Date
  handlingInstruction?: string
  loadingAddress?: string
  loadingDatetime?: Date
  loadingContactName?: string
  loadingContactPhone?: string
  loadingLatitude?: number
  loadingLongitude?: number
  isDeleted?: boolean
}

export interface JobFindEntity {
  descending?: boolean
  from?: string
  maxWeight?: number
  minWeight?: number
  owner?: string
  page?: number
  productName?: string
  productType?: Array<number>
  rowsPerPage?: number
  sortBy?: string
  status?: number
  to?: string
  truckAmountMax?: number
  truckAmountMin?: number
  truckType?: Array<number>
  type?: number
  weight?: number
}

export interface ShipmentCreateEntity {
  jobId: number
  addressDest: string
  deliveryDatetime: Date
  fullnameDest: string
  phoneDest: string
  latitudeDest: number
  longitudeDest: number
  createdUser?: string
  updatedUser?: string
}

export interface ShipmentUpdateEntity {
  updatedUser?: string
  isDeleted?: boolean
}

export interface FavoriteCreateEntity {
  userId: number
  jobId: number
  createdAt?: Date
  updatedAt?: Date
  createdUser?: string
  updatedUser?: string
  isDeleted?: boolean
}

export interface JobFullTextSearch {
  fullTextSearch?: string
  page?: number
  rowsPerPage?: number
  sortBy?: string,
  descending?: string
}
