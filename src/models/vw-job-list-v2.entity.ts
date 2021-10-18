import { ViewEntity, ViewColumn, ObjectIdColumn, AfterLoad } from "typeorm";
import Security from 'utility-layer/dist/security'
const security = new Security();

@ViewEntity({
  name: 'vw_job_list_v2',
  expression!: ` SELECT j.id,
  j.user_id,
  j.product_type_id,
  j.product_name,
  j.truck_type,
  j.total_weight AS weight,
  j.truck_amount AS required_truck_amount,
  j.loading_address,
  j.loading_datetime,
  j.loading_contact_name,
  j.loading_contact_phone,
  j.loading_latitude,
  j.loading_longitude,
  j.status,
  j.offered_total AS price,
  j.price_type,
  j.tipper,
  j.is_deleted,
  j.public_as_cgl,
  json_agg(json_build_object('name', s.address_dest, 'dateTime', s.delivery_datetime, 'contactName', s.fullname_dest, 'contactMobileNo', s.phone_dest, 'lat', s.latitude_dest::character varying, 'lng', s.longitude_dest::character varying)) AS shipments,
  j.full_text_search,
  j.created_at,
  j.family
 FROM job j
   LEFT JOIN shipment s ON s.job_id = j.id
GROUP BY j.id, j.user_id, j.product_type_id, j.product_name, j.truck_type, j.total_weight, j.truck_amount, j.loading_address, j.loading_datetime, j.loading_contact_name, j.loading_contact_phone, j.loading_latitude, j.loading_longitude, j.status, j.offered_total, j.price_type, j.tipper, j.is_deleted, j.full_text_search, j.public_as_cgl, j.family, j.created_at;
  `
})
export class VwJobListV2 {

  @ObjectIdColumn({ name: 'id' })
  id!: string

  @ViewColumn({ name: 'user_id' })
  userId?: number

  @ViewColumn({ name: 'product_type_id' })
  productTypeId!: number

  @ViewColumn({ name: 'product_name' })
  productName!: string

  @ViewColumn({ name: 'truck_type' })
  truckType!: number

  @ViewColumn({ name: 'weight' })
  weight!: number

  @ViewColumn({ name: 'required_truck_amount' })
  requiredTruckAmount!: number

  @ViewColumn({ name: 'loading_address' })
  loadingAddress!: string

  @ViewColumn({ name: 'loading_datetime' })
  loadingDatetime!: Date

  @ViewColumn({ name: 'loading_contact_name' })
  loadingContactName!: string

  @ViewColumn({ name: 'loading_contact_phone' })
  loadingContactPhone!: string

  @ViewColumn({ name: 'loading_latitude' })
  loadingLatitude!: string

  @ViewColumn({ name: 'loading_longitude' })
  loadingLongitude!: string

  @ViewColumn({ name: 'status' })
  status!: boolean

  @ViewColumn({ name: 'price' })
  price!: number

  @ViewColumn({ name: 'price_type' })
  priceType!: string

  @ViewColumn({ name: 'tipper' })
  tipper!: boolean

  @ViewColumn({ name: 'is_deleted' })
  isDeleted!: boolean

  @ViewColumn({ name: "public_as_cgl" })
  publicAsCgl!: boolean;

  @ViewColumn({ name: 'shipments' })
  shipments!: Array<{
    name: string,
    dateTime: string,
    contactName: string,
    contactMobileNo: string,
    lat: string,
    lng: string,
  }>

  @ViewColumn({ name: 'full_text_search' })
  fullTextSearch?: string

  @ViewColumn({ name: 'family' })
  family: {
    child?: number[] | null
    parent?: number
  }

  @ViewColumn({ name: 'created_at' })
  createdAt: 'datetime'

  @AfterLoad()
  removeUserId() {
    delete this.userId
  }

  @AfterLoad()
  encodeId() {
    this.id = security.encodeUserId(+this.id);
  }

  @AfterLoad()
  removeFullTextSearch() {
    delete this.fullTextSearch
  }

}
