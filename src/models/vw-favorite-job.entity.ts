import { ViewEntity, ViewColumn, ObjectIdColumn } from "typeorm";

@ViewEntity({
  name: 'vw_favorite_job',
  expression!: `SELECT
  vw.id,
  vw.user_id,
  vw.product_type_id,
  vw.product_name,
  vw.truck_type,
  vw.weight,
  vw.required_truck_amount,
  vw.loading_address,
  vw.loading_datetime,
  vw.loading_contact_name,
  vw.loading_contact_phone,
  vw.loading_latitude,
  vw.loading_longitude,
  vw.status,
  vw.price,
  vw.price_type,
  vw.tipper,
  vw.is_deleted,
  vw.owner,
  vw.shipments,
  f.updated_at AS created_at
FROM
  favorite f
  LEFT JOIN vw_job_list vw ON vw.id = f.job_id
WHERE
  f.is_deleted = FALSE;
  `,
})
export class VwFavoriteJob {

  @ObjectIdColumn({ name: 'id' })
  id!: number

  @ViewColumn({ name: 'product_type_id' })
  productTypeId!: number

  @ViewColumn({ name: 'product_name' })
  productName!: number

  @ViewColumn({ name: 'truck_type' })
  truckType!: number

  @ViewColumn({ name: 'weight' })
  weight!: number

  @ViewColumn({ name: 'required_truck_amount' })
  requiredTruckAmount!: number

  @ViewColumn({ name: 'loading_address' })
  loadingAddress!: number

  @ViewColumn({ name: 'loading_datetime' })
  loadingDatetime!: Date

  @ViewColumn({ name: 'loading_contact_name' })
  loadingContactName!: number

  @ViewColumn({ name: 'loading_contact_phone' })
  loadingContactPhone!: number

  @ViewColumn({ name: 'loading_latitude' })
  loadingLatitude!: number

  @ViewColumn({ name: 'loading_longitude' })
  loadingLongitude!: number

  @ViewColumn({ name: 'status' })
  status!: number

  @ViewColumn({ name: 'price' })
  price!: number

  @ViewColumn({ name: 'price_type' })
  priceType!: number

  @ViewColumn({ name: 'tipper' })
  tipper!: boolean

  @ViewColumn({ name: 'is_deleted' })
  isDeleted!: boolean

  @ViewColumn({ name: 'owner' })
  owner!: {
    id: number
    fullName: string
    email: string
    mobileNo: string
    avatar: {
      object: string
    }
  }

  @ViewColumn({ name: 'shipments' })
  shipments!: Array<{
    name: string,
    dateTime: string,
    contactName: string,
    contactMobileNo: string,
    lat: string,
    lng: string,
  }>

  @ViewColumn({ name: 'user_id' })
  userId!: number

  @ViewColumn({ name: 'created_at' })
  createdAt: Date | null;

}
