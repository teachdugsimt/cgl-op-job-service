import { FastifyInstance } from 'fastify';
import { FastifyInstanceToken, getInstanceByToken } from 'fastify-decorators';
import { Shipment } from '../models';
import { FindManyOptions, getConnection, Repository } from 'typeorm';
import { ShipmentCreateEntity } from './repository.types';

export default class ShipmentRepository {

  private instance: FastifyInstance = getInstanceByToken(FastifyInstanceToken);

  async add(data: ShipmentCreateEntity): Promise<any> {
    const server: any = this.instance;
    const shipmentRepository: Repository<Shipment> = server?.db?.shipments;
    return shipmentRepository.save(data);
  }

  async findById(id: number): Promise<any> {
    const server: any = this.instance;
    const shipmentRepository: Repository<Shipment> = server?.db?.shipments;
    return shipmentRepository.findOne(id);
  }

  async find(options: FindManyOptions): Promise<any> {
    const server: any = this.instance;
    const shipmentRepository: Repository<Shipment> = server?.db?.shipments;
    return shipmentRepository.find(options);
  }

  async findAndCount(filter: FindManyOptions): Promise<any> {
    const server: any = this.instance
    const shipmentRepository: Repository<Shipment> = server?.db?.shipments;
    return shipmentRepository.findAndCount(filter);
  }

  async bulkInsert(data: ShipmentCreateEntity[]): Promise<any> {
    const server: any = this.instance;
    const shipmentRepository: Repository<Shipment[]> = server?.db?.shipments;
    return shipmentRepository.save(data);
  }

  async delete(options: any): Promise<any> {
    const server: any = this.instance;
    const shipmentRepository: Repository<Shipment> = server?.db?.shipments;
    return shipmentRepository.delete(options);
  }

}
