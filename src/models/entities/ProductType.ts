import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("product_type_pkey", ["id"], { unique: true })
@Entity("product_type", { schema: "public" })
export class ProductType {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name_en", length: 255 })
  nameEn: string;

  @Column("character varying", { name: "name_th", length: 255 })
  nameTh: string;

  @Column("character varying", { name: "image", length: 255 })
  image: string;
}
