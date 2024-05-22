import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';
import { CacheService } from './cache.service';
import { ApiHandlerService } from './http-service/api-handler.service';

@Injectable({ providedIn: 'root' })
export class DataService {
  // private refreshSubject: Subject<any> = new Subject<any>();
  private refreshSubject: Subject<any> = new Subject();

  constructor(
    private apiService: ApiHandlerService,
    // private cacheService: CacheService<T>
    private cacheService: CacheService // Assuming 'id' is the property name of the primary key in IEntity
  ) {}

  get refreshObserver(): Observable<any> {
    return this.refreshSubject.asObservable();
  }

  async getListAsync(
    repo: string,
    endpoint: string,
    filterDelegate?: (entity: any) => boolean
  ): Promise<any[]> {
    let cacheData = await this.cacheService.getAll(repo, filterDelegate);

    let isCachedDataAvailable = cacheData && cacheData.length > 0;
    if (
      isCachedDataAvailable ||
      (!isCachedDataAvailable && (await this.isStoreLoaded(repo)))
    ) {
      return cacheData;
    }

    // let apiData =
    //   chunkLoadStrategy === undefined
    //     ? await this.apiService.GetAll(endpoint).toPromise()
    //     : await this.apiService.GetAllChunks(endpoint, chunkLoadStrategy);
    let apiData: any = await this.apiService.GetAll(endpoint).toPromise();

    if (apiData?.length > 0) {
      await this.cacheService.addBulkAsync(repo, apiData);
      await this.loadClientDbStore(repo);
      return filterDelegate
        ? await this.cacheService.getAll(repo, filterDelegate)
        : apiData.response;
    } else {
      // console.error('Error in DataService: ', apiData?.response);
      // throw new Error('API Error');
      return null;
    }
  }

  async addUpdateCache(repo: string, data: any) {
    let isStoreLaoded = await this.isStoreLoaded(repo);
    // if (!isStoreLaoded) {
    //   return;
    // }

    if (data?.id > 0) {
      await this.cacheService.updateAsync(repo, data.id, data);
    } else {
      await this.cacheService.addOrUpdate(repo, data);
    }
    // switch (data.id) {
    //   case EntityStateEnum.Added:
    //     await this.cacheService.addOrUpdate(repo, data.data);
    //     break;
    //   case EntityStateEnum.Deleted:
    //     await this.cacheService.removeAsync(repo, data.data.id);
    //     break;
    //   case EntityStateEnum.Modified:
    //     await this.cacheService.updateAsync(repo, data.data.id, data.data);
    //     break;
    // }

    // switch (data.state) {
    //   case EntityStateEnum.Added:
    //     await this.cacheService.addOrUpdate(repo, data.data);
    //     break;
    //   case EntityStateEnum.Deleted:
    //     await this.cacheService.removeAsync(repo, data.data.id); // TypeScript knows T has an 'id'
    //     break;
    //   case EntityStateEnum.Modified:
    //     await this.cacheService.updateAsync(repo, data.data.id, data.data); // TypeScript knows T has an 'id'
    //     break;
    // }

    this.refreshSubject.next(data);
  }

  async deleteCache(repo: string, id: number) {
    await this.cacheService.removeAsync(repo, id);
  }
  // private async isStoreLoaded(storeName: string): Promise<boolean> {
  //   return this.cacheService.isStoreLoaded(storeName);
  // }

  async isStoreLoaded(storeName: string) {
    let record = await this.cacheService.LoadedStores.getById(1);
    if (record && (record as any)[storeName] == true) {
      return true;
    }
    return false;
  }

  private async loadClientDbStore(storeName: string): Promise<void> {
    await this.cacheService.loadClientDbStore(storeName);
  }
}

// export class DataService<T extends IEntity> {
// export class DataService {
//   // private refreshSubject: Subject<IEntitySyncDTO<T>> = new Subject<
//   //   IEntitySyncDTO<T>
//   // >();

//   private refreshSubject: Subject<IEntitySyncDTO> = new Subject();

//   constructor(
//     private apiService: ApiHandlerService,
//     private cacheService: CacheService
//   ) {}

//   // get refreshObserver(): Observable<IEntitySyncDTO> {
//   //   return this.refreshSubject.asObservable();
//   // }

//   get refreshObserver(): Observable<IEntitySyncDTO> {
//     return this.refreshSubject.asObservable();
//   }

//   /**
//    *
//    * @param repo Name of EntityRepo to be used
//    * @param endpoint API Endpoint with API URL
//    * @returns list of data fetched from api or cache
//    */
//   async getListAsync(
//     repo: string,
//     endpoint: string,
//     filterDelegate?: (entity: any) => boolean,
//     chunkLoadStrategy: ChunkLoadStrategy | undefined = undefined
//   ) {
//     // get data from cache first if availble

//     let cacheData = await (this.cacheService as any)[repo].getAll(
//       filterDelegate
//     );

//     // if cache data is available then return the data
//     let isCachedDataAvailable = cacheData?.length > 0;
//     if (
//       isCachedDataAvailable ||
//       (!isCachedDataAvailable && (await this.isStoreLoaded(repo)))
//     ) {
//       return cacheData;
//     }
//     let apiData =
//       chunkLoadStrategy === undefined
//         ? await this.apiService.GetAll(endpoint).toPromise()
//         : await this.apiService.GetAllChunks(endpoint, chunkLoadStrategy);
//     if (apiData?.status) {
//       // if API call was successful and there is any data then add the data to cache
//       if (apiData?.response?.length > 0) {
//         await (this.cacheService as any)[repo].AddBulkAsync(apiData?.response);
//       }
//       await this.loadClientDbStore(repo);
//       if (!!filterDelegate) {
//         return await (this.cacheService as any)[repo].getAll(filterDelegate);
//       }

//       return apiData.response;
//     } else {
//       // TODO
//       // if some error occurs then show a dialog
//       console.error('Error in Data Service: ', apiData?.response);
//     }
//   }

//   async updateCache(data: IEntitySyncDTO) {
//     //if store is not loaded then no need of sync notification
//     if (!(await this.isStoreLoaded(data.Table))) {
//       return;
//     }

//     // add record to cache
//     if (data.State == EntityStateEnum.Added) {
//       await (this.cacheService as any)[data.Table].AddOrEditAsync(data.Entity);
//     }
//     // delete record from cache
//     if (data.State == EntityStateEnum.Deleted) {
//       let entity: any = data.Entity;
//       await (this.cacheService as any)[data.Table].RemoveAsync(entity.Id);
//     }
//     // update record from cache
//     if (data.State == EntityStateEnum.Modified) {
//       let entity: any = data.Entity;
//       await (this.cacheService as any)[data.Table].UpdateAsync(
//         entity.Id,
//         entity
//       );
//     }
//     this.refreshSubject.next(data);
//   }

//   async isStoreLoaded(storeName: string) {
//     let record = await this.cacheService.LoadedStores.getById(1);
//     if (record && (record as any)[storeName] == true) {
//       return true;
//     }
//     return false;
//   }

//   async loadClientDbStore(storeName: string) {
//     let patch = {};
//     (patch as any)[storeName] = true;
//     await this.cacheService.LoadedStores.UpdateAsync(1, { ...patch });
//   }
// }
