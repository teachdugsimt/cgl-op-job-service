import { FastifyInstance } from 'fastify';
import { FastifyInstanceToken, getInstanceByToken } from 'fastify-decorators';
import { Favorite } from '../models';
import { FindManyOptions, Repository } from 'typeorm';
import { FavoriteCreateEntity } from './repository.types';

export default class FavoriteRepository {

  private instance: FastifyInstance = getInstanceByToken(FastifyInstanceToken);

  async add(data: FavoriteCreateEntity): Promise<any> {
    const server: any = this.instance;
    const favoriteRepository: Repository<Favorite> = server?.db?.favorite;
    return favoriteRepository.save(favoriteRepository.create(data));
  }

  async findById(id: number): Promise<any> {
    const server: any = this.instance;
    const favoriteRepository: Repository<Favorite> = server?.db?.favorite;
    return favoriteRepository.findOne(id);
  }

  async find(options: FindManyOptions): Promise<any> {
    const server: any = this.instance;
    const favoriteRepository: Repository<Favorite> = server?.db?.favorite;
    return favoriteRepository.find(options);
  }

  async findAndCount(filter: FindManyOptions): Promise<any> {
    const server: any = this.instance
    const favoriteRepository: Repository<Favorite> = server?.db?.favorite;
    return favoriteRepository.findAndCount(filter);
  }

  async update(id: number, data: Partial<Favorite>): Promise<any> {
    const server: any = this.instance
    const favoriteRepository: Repository<Favorite> = server?.db?.favorite;

    let favoriteToUpdate = await this.findById(id);
    favoriteToUpdate = { ...favoriteToUpdate, ...data };

    return favoriteRepository.save(favoriteRepository.create(favoriteToUpdate));
  }

  async delete(options: Partial<Favorite>): Promise<any> {
    const server: any = this.instance
    const favoriteRepository: Repository<Favorite> = server?.db?.favorite;
    return favoriteRepository.delete(options);
  }

}
