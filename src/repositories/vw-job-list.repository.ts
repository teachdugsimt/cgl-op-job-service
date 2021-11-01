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

  async findAndCountV2(filter: FindManyOptions): Promise<any> {
    const {
      address,
      totalWeight,
      productName,
      productTypeId,
      truckType,
      status,
      truckAmount,
      isDeleted,
      loadingDatetime
    }: any = filter.where
    const orderBy: any = filter.order

    const server: any = this.instance
    const viewJobList: Repository<VwJobList> = server?.db?.vwJobList;
    const vwJobListQueryBuilder = viewJobList.createQueryBuilder();
    vwJobListQueryBuilder.where('id IS NOT NULL');
    if (isDeleted != undefined || isDeleted != null)
      vwJobListQueryBuilder.andWhere('is_deleted = :isDeleted', { isDeleted });
    if (address) vwJobListQueryBuilder.andWhere(`to_tsvector('simple', loading_address || shipments) @@ :address::tsquery`, { address: `${address}:*` })
    if (totalWeight) vwJobListQueryBuilder.andWhere('weight BETWEEN :min AND :max', { min: totalWeight[0], max: totalWeight[1] })
    if (productName) vwJobListQueryBuilder.andWhere('product_name = :productName', { productName })
    if (productTypeId) vwJobListQueryBuilder.andWhere('product_type_id = ANY (:productTypeId)', { productTypeId })
    if (truckType) vwJobListQueryBuilder.andWhere('truck_type = ANY (:truckType)', { truckType })
    if (status) vwJobListQueryBuilder.andWhere('status = :status', { status })
    if (truckAmount) vwJobListQueryBuilder.andWhere('required_truck_amount BETWEEN :min AND :max', { min: truckAmount[0], max: truckAmount[1] })
    if (loadingDatetime) vwJobListQueryBuilder.andWhere('loading_datetime >= :timer', { timer: loadingDatetime })
    return vwJobListQueryBuilder
      .orderBy(orderBy)
      .take(filter.take)
      .skip(filter.skip)
      .getManyAndCount();
  }

  async fullTextSearch(data: JobFullTextSearch, optionsFilter?: string | null): Promise<any> {
    const server: any = this.instance
    const viewJobList: Repository<VwJobList> = server?.db?.vwJobList;
    return viewJobList.createQueryBuilder()
      .select()
      .where(`${optionsFilter || ''} full_text_search @@ to_tsquery(:query)`, {
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
