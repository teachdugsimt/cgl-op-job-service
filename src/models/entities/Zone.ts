import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("working_zone_pkey", ["id"], { unique: true })
@Entity("zone", { schema: "public" })
export class Zone {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name_en", length: 255 })
  nameEn: string;

  @Column("character varying", { name: "name_th", length: 255 })
  nameTh: string;
}
