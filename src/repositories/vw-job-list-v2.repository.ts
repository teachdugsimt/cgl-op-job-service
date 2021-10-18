import { FastifyInstance } from 'fastify';
import { FastifyInstanceToken, getInstanceByToken } from 'fastify-decorators';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { VwJobListV2 } from '../models'

export default class JobListV2Repository {

  private instance: FastifyInstance = getInstanceByToken(FastifyInstanceToken);

  async findAndCount(options: FindManyOptions): Promise<any> {
    const server: any = this.instance
    const joblist2Repository: Repository<VwJobListV2> = server?.db?.vwJobListV2;
    return joblist2Repository.findAndCount(options)
  }
  async findOne(options: FindOneOptions): Promise<any> {
    const server: any = this.instance
    const joblist2Repository: Repository<VwJobListV2> = server?.db?.vwJobListV2;
    return joblist2Repository.findOne(options)
  }

  async fullTextSearch(data: JobFullTextSearch): Promise<any> {
    const server: any = this.instance
    const viewJobList: Repository<VwJobListV2> = server?.db?.vwJobListV2;
    return viewJobList.createQueryBuilder()
      .select()
      .where(`(family is null or family ->> 'parent' is null) and full_text_search @@ to_tsquery(:query)`, {
        query: data.fullTextSearch
      })
      .orderBy({
        ...(data?.sortBy ? { [data.sortBy]: data.descending } : undefined),
        ['ts_rank(full_text_search, to_tsquery(:query))']: 'DESC'
      })
      .take(data.rowsPerPage)
      .skip(data.page)
      .getManyAndCount();
  }


}

export interface JobFullTextSearch {
  fullTextSearch?: string
  page?: number
  rowsPerPage?: number
  sortBy?: string,
  descending?: string
}


export interface FilterQueryTranspotation {
  fullTextSearch?: string
  page?: number
  rowsPerPage?: number
  sortBy?: string,
  descending?: string
}
