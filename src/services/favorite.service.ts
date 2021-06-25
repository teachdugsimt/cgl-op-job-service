import { Service, Initializer, Destructor } from 'fastify-decorators';
import VwFavoriteJobRepository from '../repositories/vw-favorite-job.repository';
import FavoriteRepository from '../repositories/favorite.repository';
import date from 'date-and-time';
import Utility from 'utility-layer/dist/security';

const vwFavoriteJobRepository = new VwFavoriteJobRepository();
const favoriteRepository = new FavoriteRepository();
const utility = new Utility();

@Service()
export default class JobService {

  public dateFormat: string = 'DD-MM-YYYY HH:mm'
  public dateFormatWithMs: string = 'DD-MM-YYYY HH:mm:ss'

  @Initializer()
  async init(): Promise<void> { }

  async getFavoriteJob(userId: string, desc: boolean, page: number, rowsPerPage: number): Promise<any> {
    let numbOfPage: number;
    let numbOfLimit: number;
    if (rowsPerPage) {
      numbOfLimit = +rowsPerPage;
    } else {
      numbOfLimit = 10;
    }
    if (page) {
      numbOfPage = +page === 1 ? 0 : (+page - 1) * numbOfLimit;
    } else {
      numbOfPage = 0;
    }

    const favorites = await vwFavoriteJobRepository.findAndCount({
      where: { userId: userId },
      order: {
        createdAt: desc ? 'DESC' : 'ASC'
      },
      take: numbOfLimit,
      skip: numbOfPage,
    })

    const jobMapping = favorites[0]?.map((favorite: any) => {
      return {
        id: utility.encodeUserId(favorite.id),
        productTypeId: favorite.productTypeId,
        productName: favorite.productName,
        truckType: favorite.truckType,
        weight: Math.round(favorite.weight * 100) / 100,
        requiredTruckAmount: favorite.truckAmount,
        from: {
          name: favorite.loadingAddress,
          dateTime: date.isValid(favorite.loadingDatetime) ? date.format(new Date(favorite.loadingDatetime), this.dateFormat) : null,
          contactName: favorite.loadingContactName,
          contactMobileNo: favorite.loadingContactPhone,
          lat: favorite.loadingLatitude.toString(),
          lng: favorite.loadingLongitude.toString(),
        },
        to: favorite.shipments?.map((shipment: any) => ({
          ...shipment,
          dateTime: date.format(new Date(shipment.dateTime), this.dateFormat)
        })),
        owner: {
          ...favorite.owner,
          userId: utility.encodeUserId(favorite.owner.id)
        },
        status: favorite.status,
        quotations: [],
        price: Math.round(favorite.price * 100) / 100,
        priceType: favorite.priceType,
        tipper: favorite.tipper
      }
    });

    return {
      data: jobMapping || [],
      count: favorites[1] || 0,
    }
  }

  async addOrRemove(jobId: string, userId: string): Promise<any> {
    const decodeUserId = utility.decodeUserId(userId);
    const decodeJobId = utility.decodeUserId(jobId);

    const favoriteData = await favoriteRepository.find({ where: { jobId: decodeJobId }, take: 1 });

    if (favoriteData?.length) {
      if (favoriteData[0].isDeleted) {
        return favoriteRepository.update(favoriteData[0].id, { isDeleted: false, });
      }
      return favoriteRepository.update(favoriteData[0].id, { isDeleted: true });
    }

    return favoriteRepository.add({
      userId: decodeUserId,
      jobId: decodeJobId,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdUser: decodeUserId,
      updatedUser: decodeUserId,
    });
  }

  @Destructor()
  async destroy(): Promise<void> { }
}
