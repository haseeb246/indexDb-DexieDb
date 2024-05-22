import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { EntityStateEnum } from '../enum/idb.enum';
import { IEntity, IEntitySyncDTO } from '../index-db-interfaces/idb.interface';
import { CacheService } from './cache.service';
import { ApiHandlerService } from './http-service/api-handler.service';

@Injectable({
  providedIn: 'root',
})
export abstract class BaseService<T extends IEntity> {
  protected refreshSubject = new Subject<IEntitySyncDTO<T>>();

  constructor(
    protected apiService: ApiHandlerService,
    protected cacheService: CacheService
  ) {}

  get refreshObserver(): Observable<IEntitySyncDTO<T>> {
    return this.refreshSubject.asObservable();
  }

  protected async loadClientDbStore(storeName: string): Promise<void> {
    // Logic to mark the store as loaded, e.g. update a flag in IndexedDB
  }

  protected async isStoreLoaded(storeName: string): Promise<boolean> {
    // Check if the store is loaded
    // This method would typically check some flag in IndexedDB to see if the data has been loaded
    return true; // Simplified return value for this example
  }

  // Fetches a list from the cache or the API if not available
  protected async getListAsync(
    repo: string,
    endpoint: string,
    filterDelegate?: (entity: T) => boolean
  ): Promise<T[]> {
    let cacheData = await this.cacheService.getAll(repo, filterDelegate);

    if (cacheData.length > 0) {
      return cacheData; // Data was found in the cache
    }

    // Data not in cache, fetch from API
    const apiData: any = await this.apiService.GetAll(endpoint).toPromise();

    if (apiData?.status) {
      const entities = apiData.response;
      await this.cacheService.addBulkAsync(repo, entities); // Assume this method exists to add data in bulk to cache
      debugger;
      this.refreshSubject.next({
        state: EntityStateEnum.Loaded,
        data: entities,
      } as any);
      return entities;
    } else {
      throw new Error(`API call to ${endpoint} failed.`);
    }
  }

  // Update the local cache and inform listeners
  protected updateCache(data: IEntitySyncDTO<T>): void {
    this.refreshSubject.next(data);
    // Additional logic to update the local cache with data could go here
  }

  // Abstract methods that subclasses need to implement
  // abstract add(entity: T): Promise<void>;
  // abstract edit(entity: T): Promise<void>;
  // abstract delete(id: number): Promise<void>;
  // More abstract methods for CRUD operations can be added as needed
}
