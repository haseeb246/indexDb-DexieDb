import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { IUnit } from '../index-db-interfaces/unit.interface';
import { LoadedStores } from '../model/loaded.store';
import { UserDto } from '../model/user.model';
import { DexieCrudService } from './dexie-crud.service';
import { AppDatabase } from './init.idb.service';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  User!: DexieCrudService<UserDto, string>;
  Unit!: DexieCrudService<IUnit, string>;
  LoadedStores!: DexieCrudService<LoadedStores, number>;
  constructor(private appDatabase: AppDatabase) {
    this.User = new DexieCrudService<UserDto, string>(appDatabase.User);
    this.Unit = new DexieCrudService<IUnit, string>(appDatabase.Unit);
    this.LoadedStores = new DexieCrudService<LoadedStores, number>(
      appDatabase.LoadedStores
    );
  }

  // Retrieve all entities from the specified repository/table, optionally applying a filter.
  async getAll(
    repo: string,
    filterDelegate?: (entity: any) => boolean
  ): Promise<any[]> {
    const table = this.getTable(repo);
    if (filterDelegate) {
      return table.filter(filterDelegate).toArray();
    } else {
      return table.toArray();
    }
  }

  // Add or update an entity in the specified repository/table.
  async addOrUpdate(repo: string, entity: any): Promise<void> {
    const table = this.getTable(repo);
    await table.put(entity);
  }

  // Update an entity in the specified repository/table.
  // async updateAsync(
  //   repo: string,
  //   id: TKey,
  //   changes: Partial<T>
  // ): Promise<number> {
  //   const table = this.getTable(repo);
  //   return await table.update(id, changes);
  // }

  async updateAsync(
    repo: string,
    id: number,
    changes: Partial<any>
  ): Promise<number> {
    const table = this.getTable(repo);
    return await table.update(id, changes);
  }

  // Remove an entity by id from the specified repository/table.
  async removeAsync(repo: string, id: number): Promise<void> {
    const table = this.getTable(repo);
    await table.delete(id);
  }

  // Check if a specific store is loaded.
  async isStoreLoaded(storeName: string): Promise<boolean> {
    // Implementation might vary based on how "store loaded" status is tracked.
    // This is a placeholder for your logic.
    return true;
  }

  // Mark a client DB store as loaded.
  async loadClientDbStore(storeName: string): Promise<void> {
    // Placeholder for your logic to mark a store as loaded.
  }

  // Add a bulk of entities to the specified repository/table.
  async addBulkAsync(repo: string, items: any[]): Promise<void> {
    const table = this.getTable(repo);
    await table.bulkAdd(items);
  }

  // Helper to get a Dexie table dynamically based on the repository name.
  private getTable(repo: string): Dexie.Table<any, number> {
    const table = (this.appDatabase as any)[repo];
    if (!table) {
      throw new Error(`Table ${repo} does not exist in the database.`);
    }
    return table as Dexie.Table<any, number>;
  }
}
// export class CacheService {
//   private servicesCache: Map<string, any> = new Map();
//   private appDatabase: AppDatabase; // Store a reference to AppDatabase

//   User!: DexieCrudService<IUser, string>;
//   Unit!: DexieCrudService<IUnit, string>;
//   LoadedStores!: DexieCrudService<LoadedStores, number>;

//   constructor(appDatabase: AppDatabase) {
//     // Store the reference to AppDatabase
//     this.appDatabase = appDatabase;

//     this.User = new DexieCrudService<IUser, string>(appDatabase.User);
//     this.Unit = new DexieCrudService<IUnit, string>(appDatabase.Unit);
//     this.LoadedStores = new DexieCrudService<LoadedStores, number>(
//       appDatabase.LoadedStores
//     );
//   }

//   getService<T, TKey>(tableName: keyof AppDatabase): DexieCrudService<T, TKey> {
//     if (!this.servicesCache.has(tableName as string)) {
//       const tableInstance: Dexie.Table<T, TKey> = this.appDatabase[
//         tableName
//       ] as Dexie.Table<T, TKey>;
//       if (!tableInstance) {
//         throw new Error(`Table ${tableName} does not exist in the database.`);
//       }
//       const service = new DexieCrudService<T, TKey>(tableInstance);
//       this.servicesCache.set(tableName as string, service);
//       return service;
//     }
//     return this.servicesCache.get(tableName as string);
//   }
// }

// getService<T, TKey>(tableName: keyof AppDatabase): DexieCrudService<T, TKey> {
//   if (!this.servicesCache.has(tableName as string)) {
//     const tableInstance = this.appDatabase[tableName];
//     if (!tableInstance) {
//       throw new Error(`Table ${tableName} does not exist in the database.`);
//     }
//     const service = new DexieCrudService<T, TKey>(tableInstance);
//     this.servicesCache.set(tableName as string, service);
//     return service;
//   }
//   return this.servicesCache.get(tableName as string);
// }
