import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("truck_type_group_pkey", ["id"], { unique: true })
@Entity("truck_type_group", { schema: "public" })
export class TruckTypeGroup {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name_en", length: 255 })
  nameEn: string;

  @Column("character varying", { name: "name_th", length: 255 })
  nameTh: string;
}
