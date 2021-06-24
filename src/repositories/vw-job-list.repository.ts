import { FastifyInstance } from 'fastify';
import { FastifyInstanceToken, getInstanceByToken } from 'fastify-decorators';
import { VwJobList } from '../models';
import { FindManyOptions, Repository } from 'typeorm';

export default class VwJobListRepository {

  private instance: FastifyInstance = getInstanceByToken(FastifyInstanceToken);

  async findById(id: number): Promise<any> {
    const server: any = this.instance;
    const viewJobList: Repository<VwJobList> = server?.db?.vwJobList;
    return viewJobList.findOne(id);
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

}
