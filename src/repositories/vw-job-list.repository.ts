import { FastifyInstance } from 'fastify';
import { FastifyInstanceToken, getInstanceByToken } from 'fastify-decorators';
import { VwJobList } from '../models';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { JobFullTextSearch } from './repository.types';

export default class VwJobListRepository {

  private instance: FastifyInstance = getInstanceByToken(FastifyInstanceToken);

  async findById(id: number, options?: FindOneOptions): Promise<any> {
    const server: any = this.instance;
    const viewJobList: Repository<VwJobList> = server?.db?.vwJobList;
    return viewJobList.findOne(id, options);
  }

  async find(options: FindManyOptions): Promise<any> {
    const server: any = this.instance;
    const viewJobList: Repository<VwJobList> = server?.db?.vwJobList;
    return viewJobList.find(options);
  }

  async findAndCount(filter: FindManyOptions): Promise<any> {
    const server: any = this.instance
    const viewJobList: Repository<VwJobList> = server?.db?.vwJobList;
    return viewJobList.findAndCount(filter);
  }

  async fullTextSearch(data: JobFullTextSearch): Promise<any> {
    const server: any = this.instance
    const viewJobList: Repository<VwJobList> = server?.db?.vwJobList;
    return viewJobList.createQueryBuilder()
      .select()
      .where('full_text_search @@ to_tsquery(:query)', {
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
