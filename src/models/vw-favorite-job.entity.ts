import { ViewEntity, ViewColumn } from "typeorm";
import { VwJobList } from "./vw-job-list.entity";

@ViewEntity({
  name: 'vw_favorite_job',
  expression!: `SELECT
    vw.*,
    f.updated_at AS created_at
  FROM
    favorite f
    LEFT JOIN vw_job_list vw ON vw.id = f.job_id
  WHERE
    f.is_deleted = FALSE;
  `,
})
export class VwFavoriteJob extends VwJobList {

  @ViewColumn({ name: 'user_id' })
  userId!: number

  @ViewColumn({ name: 'created_at' })
  createdAt: Date | null;

}
