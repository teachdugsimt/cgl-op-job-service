import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("shipment", { schema: "public" })
export class Shipment {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("integer", { name: "job_id" })
  jobId: number;

  // @Column("smallint", { name: "status" })
  // status: number;

  @Column("enum", {
    name: "status",
    nullable: true,
    enum: ['NEW', 'INPROGRESS', 'CANCELLED', 'DONE', 'EXPIRED'],
    default: 'NEW'
  })
  status: 'NEW' | 'INPROGRESS' | 'CANCELLED' | 'DONE' | 'EXPIRED' | null;

  @Column("character varying", {
    name: "address_org",
    nullable: true,
    length: 256,
  })
  addressOrg: string | null;

  @Column("character varying", { name: "address_dest", length: 256 })
  addressDest: string;

  @Column("double precision", {
    name: "longitude_org",
    nullable: true,
    precision: 53,
  })
  longitudeOrg: number | null;

  @Column("double precision", {
    name: "latitude_org",
    nullable: true,
    precision: 53,
  })
  latitudeOrg: number | null;

  @Column("double precision", { name: "longitude_dest", precision: 53 })
  longitudeDest: number;

  @Column("double precision", { name: "latitude_dest", precision: 53 })
  latitudeDest: number;

  @Column("character varying", {
    name: "fullname_org",
    nullable: true,
    length: 256,
  })
  fullnameOrg: string | null;

  @Column("character varying", { name: "fullname_dest", length: 256 })
  fullnameDest: string;

  @Column("character varying", {
    name: "phone_org",
    nullable: true,
    length: 20,
  })
  phoneOrg: string | null;

  @Column("character varying", { name: "phone_dest", length: 20 })
  phoneDest: string;

  @Column("timestamp without time zone", {
    name: "time_from_pickup_org",
    nullable: true,
  })
  timeFromPickupOrg: Date | null;

  @Column("timestamp without time zone", {
    name: "time_to_pickup_org",
    nullable: true,
  })
  timeToPickupOrg: Date | null;

  @Column("timestamp without time zone", {
    name: "time_from_delivery_org",
    nullable: true,
  })
  timeFromDeliveryOrg: Date | null;

  @Column("timestamp without time zone", {
    name: "time_to_delivery_org",
    nullable: true,
  })
  timeToDeliveryOrg: Date | null;

  @Column("integer", { name: "version", default: () => "0" })
  version: number;

  @Column("timestamp without time zone", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @Column("timestamp without time zone", {
    name: "updated_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date | null;

  @Column("character varying", {
    name: "created_user",
    nullable: true,
    length: 254,
    default: () => "NULL::character varying",
  })
  createdUser: string | null;

  @Column("character varying", {
    name: "updated_user",
    nullable: true,
    length: 254,
    default: () => "NULL::character varying",
  })
  updatedUser: string | null;

  @Column("boolean", { name: "is_deleted", default: () => "false" })
  isDeleted: boolean;

  @Column("character varying", {
    name: "request_number",
    nullable: true,
    length: 256,
    default: () => "NULL::character varying",
  })
  requestNumber: string | null;

  @Column("character varying", {
    name: "product_name",
    nullable: true,
    length: 256,
    default: () => "''",
  })
  productName: string | null;

  @Column("integer", {
    name: "product_type_id",
    nullable: true,
    default: () => "0",
  })
  productTypeId: number | null;

  @Column("integer", { name: "quantity", nullable: true, default: () => "0" })
  quantity: number | null;

  @Column("integer", { name: "unit", nullable: true, default: () => "0" })
  unit: number | null;

  @Column("character varying", {
    name: "size_of_cargo",
    nullable: true,
    length: 256,
    default: () => "0",
  })
  sizeOfCargo: string | null;

  @Column("character varying", {
    name: "photo",
    nullable: true,
    length: 512,
    default: () => "NULL::character varying",
  })
  photo: string | null;

  @Column("character varying", {
    name: "handling_instruction",
    nullable: true,
    length: 512,
    default: () => "NULL::character varying",
  })
  handlingInstruction: string | null;

  @Column("integer", {
    name: "truck_sharing",
    nullable: true,
    default: () => "0",
  })
  truckSharing: number | null;

  @Column("integer", {
    name: "payment_tran_fee",
    nullable: true,
    default: () => "0",
  })
  paymentTranFee: number | null;

  @Column("integer", {
    name: "type_of_truck",
    nullable: true,
    default: () => "0",
  })
  typeOfTruck: number | null;

  @Column("character varying", {
    name: "estimate_distance",
    nullable: true,
    length: 30,
  })
  estimateDistance: string | null;

  @Column("character varying", {
    name: "estimate_time",
    nullable: true,
    length: 30,
  })
  estimateTime: string | null;

  @Column("numeric", {
    name: "price",
    nullable: true,
    precision: 12,
    scale: 2,
    default: () => "NULL::numeric",
  })
  price: string | null;

  @Column("timestamp without time zone", {
    name: "delivery_datetime",
    nullable: true,
  })
  deliveryDatetime: Date | null;

  @Column("double precision", {
    name: "total_weight",
    nullable: true,
    precision: 53,
    default: () => "0",
  })
  totalWeight: number | null;

  @Column("character varying", {
    name: "province_dest",
    nullable: true,
    length: 255,
    default: () => "NULL::character varying",
  })
  provinceDest: string | null;

  @Column("character varying", {
    name: "district_dest",
    nullable: true,
    length: 255,
    default: () => "NULL::character varying",
  })
  districtDest: string | null;

  @Column("character varying", {
    name: "address_dest_en",
    nullable: true,
    length: 256,
  })
  addressDestEn: string | null;

  @Column("character varying", {
    name: "address_dest_th",
    nullable: true,
    length: 256,
  })
  addressDestTh: string | null;

  @Column("integer", { name: "province_dest_id", nullable: true })
  provinceDestId: number | null;

  @Column("integer", { name: "district_dest_id", nullable: true })
  districtDestId: number | null;
}
