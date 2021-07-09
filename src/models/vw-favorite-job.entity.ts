import { ViewEntity, ViewColumn, ObjectIdColumn } from "typeorm";

@ViewEntity({
  name: 'vw_favorite_job',
  expression!: `SELECT
	j.id,
	f.user_id,
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
	JSON_BUILD_OBJECT('id', usr.id, 'fullName', usr.fullname, 'email', usr.email, 'mobileNo', usr.phone_number, 'avatar', JSON_BUILD_OBJECT('object', usr.avatar)) AS owner,
	JSON_AGG(JSON_BUILD_OBJECT('name', s.address_dest, 'dateTime', s.delivery_datetime, 'contactName', s.fullname_dest, 'contactMobileNo', s.phone_dest, 'lat', s.latitude_dest::VARCHAR, 'lng', s.longitude_dest::VARCHAR)) AS shipments,
	f.updated_at AS created_at
FROM
	job j
	LEFT JOIN shipment s ON s.job_id = j.id
	LEFT JOIN favorite f ON f.job_id = j.id
	LEFT JOIN dblink('myserver'::text, 'SELECT id,email,fullname,phone_number,avatar FROM user_profile' ::text) usr (
		id integer,
		email text,
		fullname text,
		phone_number text,
		avatar text) ON usr.id = j.user_id
WHERE 
	f.is_deleted = FALSE
GROUP BY j.id,
	j.user_id,
	j.product_type_id,
	j.product_name,
	j.truck_type,
	j.total_weight,
	j.truck_amount,
	j.loading_address,
	j.loading_datetime,
	j.loading_contact_name,
	j.loading_contact_phone,
	j.loading_latitude,
	j.loading_longitude,
	j.status,
	j.offered_total,
	j.price_type,
	j.tipper,
	j.is_deleted,
	j.full_text_search,
	usr.id,
	usr.email,
	usr.fullname,
	usr.phone_number,
	usr.avatar,
	f.updated_at,
	f.user_id;
  `,
})
export class VwFavoriteJob {

  @ObjectIdColumn({ name: 'id' })
  id!: number

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
