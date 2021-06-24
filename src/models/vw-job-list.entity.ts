import { ViewEntity, ViewColumn, ObjectIdColumn } from "typeorm";

@ViewEntity({
  expression!: `SELECT
	j.id AS id,
	j.product_type_id AS product_type_id,
	j.product_name AS product_name,
	j.truck_type AS truck_type,
	j.total_weight AS weight,
	j.truck_amount AS required_truck_amount,
	j.loading_address AS loading_address,
	j.loading_datetime AS loading_datetime,
	j.loading_contact_name AS loading_contact_name,
	j.loading_contact_phone AS loading_contact_phone,
	j.loading_latitude AS loading_latitude,
	j.loading_longitude AS loading_longitude,
	j.status AS status,
	j.offered_total AS price,
	j.price_type AS price_type,
	j.tipper AS tipper,
	JSON_BUILD_OBJECT('id', usr.id, 'fullName', usr.fullname, 'email', usr.email, 'mobileNo', usr.phone_number, 'avatar', JSON_BUILD_OBJECT('object', usr.avatar)) AS owner,
	JSON_AGG(JSON_BUILD_OBJECT('name', s.address_dest, 'dateTime', s.delivery_datetime, 'contactName', s.fullname_dest, 'contactMobileNo', s.phone_dest, 'lat', s.latitude_dest::VARCHAR, 'lng', s.longitude_dest::VARCHAR)) AS shipments
FROM
	job j
	LEFT JOIN shipment s ON s.job_id = j.id
	LEFT JOIN dblink('myserver'::text, 'SELECT id,email,fullname,phone_number,avatar FROM user_profile' ::text) usr (
		id integer,
		email text,
		fullname text,
		phone_number text,
		avatar text) ON usr.id = j.uesr_id
GROUP BY j.id,
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
	usr.id,
	usr.email,
	usr.fullname,
	usr.phone_number,
	usr.avatar;
  `
})
export class VwJobList {

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

}
