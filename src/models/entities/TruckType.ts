import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("truck_type_pkey", ["id"], { unique: true })
@Entity("truck_type", { schema: "public" })
export class TruckType {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "group_id" })
  groupId: number;

  @Column("character varying", { name: "name_en", length: 255 })
  nameEn: string;

  @Column("character varying", { name: "name_th", length: 255 })
  nameTh: string;

  @Column("character varying", { name: "image", nullable: true, length: 255 })
  image: string | null;
}
