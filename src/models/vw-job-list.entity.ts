import { ViewEntity, ViewColumn, ObjectIdColumn, AfterLoad } from "typeorm";

@ViewEntity({
  name: 'vw_job_list',
  expression!: `SELECT
	j.id AS id,
	j.user_id AS user_id,
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
	j.is_deleted AS is_deleted,
	JSON_BUILD_OBJECT('id', usr.id, 'fullName', usr.fullname, 'email', usr.email, 'mobileNo', usr.phone_number, 'avatar', JSON_BUILD_OBJECT('object', usr.avatar)) AS owner,
	JSON_AGG(JSON_BUILD_OBJECT('name', s.address_dest, 'dateTime', s.delivery_datetime, 'contactName', s.fullname_dest, 'contactMobileNo', s.phone_dest, 'lat', s.latitude_dest::VARCHAR, 'lng', s.longitude_dest::VARCHAR)) AS shipments,
	j.full_text_search AS full_text_search,
	vwtrip.trips AS trips,
	(CASE WHEN vwbook.id IS NOT NULL THEN (JSON_AGG(JSON_BUILD_OBJECT('fullname', vwbook.fullname, 'avatar', vwbook.avatar, 'truck', vwbook.truck, 'booking_datetime', vwbook.booking_datetime))) ELSE NULL END) AS quotations
FROM
	job j
	LEFT JOIN shipment s ON s.job_id = j.id
	LEFT JOIN dblink('myserver'::text, 'SELECT id,email,fullname,phone_number,avatar FROM user_profile' ::text) usr (
		id integer,
		email text,
		fullname text,
		phone_number text,
		avatar text) ON usr.id = j.user_id
	LEFT JOIN dblink('bookserver'::text, 'SELECT job_id, trips FROM vw_trip_with_truck_detail' ::text) vwtrip (
		job_id integer,
		trips JSONB) ON vwtrip.job_id = j.id
	LEFT JOIN dblink('bookserver'::text, 'SELECT id, job_id, fullname, avatar, truck, booking_datetime FROM vw_booking' ::text) vwbook (
		id INTEGER,
		job_id integer,
		fullname VARCHAR,
		avatar JSONB,
		truck JSONB,
		booking_datetime TIMESTAMP) ON vwbook.job_id = j.id
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
	vwtrip.trips,
	vwbook.id;
  `
})
export class VwJobList {

  @ObjectIdColumn({ name: 'id' })
  id!: number

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

  @ViewColumn({ name: 'full_text_search' })
  fullTextSearch?: string

  @ViewColumn({ name: 'trips' })
  trips!: Array<{
    id: number,
    truckId: number,
    weight: number,
    price: number,
    priceType: string,
    status: string,
    bookingId: number,
    truckType: string,
    stallHeight: string,
    createdAt: Date,
    updatedAt: Date,
    approveStatus: string,
    phoneNumber: string,
    registrationNumber: Array<string>,
    workingZones?: Array<{
      region: number,
      province: number
    }>,
    owner: {
      id: number
      fullName: string
      email: string
      mobileNo: string
      avatar: {
        object: string
      }
    },
    tipper: boolean
  }>

  @ViewColumn({ name: 'quotations' })
  quotations!: Array<{
    id: string
    fullName: string
    bookingDatetime: Date
    avatar: {
      object: string
    }
    truck: {
      id: number
      owner: {
        id: number
        fullName: string
        email: string
        mobileNo: string
        avatar: {
          object: string
        }
      }
      tipper: boolean
      workingZones?: Array<{
        region: number
        province: number
      }>
      createdAt: Date
      updatedAt: Date
      truckType: string
      stallHeight: string
      truckPhotos: {
        back: string
        left: string
      }
      approveStatus: string
      registrationNumber: Array<string>
      loadingWeight: number
    }
  }>

  @AfterLoad()
  removeUserId() {
    delete this.userId
  }

  @AfterLoad()
  removeFullTextSearch() {
    delete this.fullTextSearch
  }

}
