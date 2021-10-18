
export interface JobListFilter {
  descending?: boolean | undefined
  page?: number | string
  rowsPerPage?: number | string
  sortBy?: string | undefined
  type?: number
  realPage?: number
  realTake?: number
  searchText?: string | undefined | null
  where?: any
  status?: string | null
  loadingDate?: string | null
}



export interface JobFindEntity {
  id: string
  productTypeId: number
  productName: string | null
  truckType: string
  weight: string | null
  requiredTruckAmount: number | null
  from?: {
    name: string | null
    dateTime: string | null
    contactName: string | null
    contactMobileNo: string | null
    lat: number | null
    lng: number | null
  }
  to?: to[]
  status: "NEW" | "INPROGRESS" | "CANCELLED" | "DONE" | "EXPIRED"
  price: string | null
  priceType: "PER_TRIP" | "PER_TON" | string
  tipper: boolean
  isDeleted: boolean
  publicAsCgl: boolean
  family: {
    parent: number | null
    child: number[]
  } | null
  createdAt: string | null
}

interface to {
  name: string | null
  dateTime: string | null
  contactName: string | null
  contactMobileNo: string | null
  lat: string | null
  lng: string | null
}

export interface SearchResult {
  "id": string
  "productTypeId": number
  "productName": string
  "truckType": string
  "weight": string
  "requiredTruckAmount": number
  "loadingAddress": string
  "loadingDatetime": string
  "loadingContactName": string
  "loadingContactPhone": string
  "loadingLatitude": number
  "loadingLongitude": number
  "status": "NEW" | "INPROGRESS" | "CANCELLED" | "DONE" | "EXPIRED"
  "price": string
  "priceType":  "PER_TRIP" | "PER_TON" | string
  "tipper": boolean
  "isDeleted": boolean
  "publicAsCgl": boolean
  "shipments": to[]
  "family": {
    parent: number | null
    child: number[]
  } | null
  "createdAt": string | null
}
