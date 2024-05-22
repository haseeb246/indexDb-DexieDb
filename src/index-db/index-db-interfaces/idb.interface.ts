import Dexie, { Collection } from 'dexie';
import { EntityStateEnum } from '../enum/idb.enum';

// Entity and Sync DTO Interfaces
export interface IEntity {
  id: number;
}

export interface ITableSchema {
  name: string;
  schema: string;
}

export interface IDexieTableSchema {
  name: string;
  primKey: { src: string };
  indexes: { src: string }[];
}

export interface IFilterDelegate {
  (dbSet: Dexie.Table): Collection;
}

export interface IEntitySyncDTO<T extends IEntity> {
  table: any;
  // entity: T;
  data?: T;
  state?: EntityStateEnum;
}

export interface IEntitySync extends IEntity {
  table: string;
  data?: any;
  state?: EntityStateEnum;
}

// export interface IEntitySyncDTO {
//   Table: any;
//   Entity: any;
//   State: EntityStateEnum;
// }

// Repository Interface
export interface IRepository<T extends IEntity> {
  getAll(filterDelegate?: (entity: T) => boolean): Promise<T[]>;
  addBulkAsync(entities: T[]): Promise<void>;
  addOrEditAsync(entity: T): Promise<void>;
  removeAsync(id: string | number): Promise<void>;
  updateAsync(id: string | number, entity: Partial<T>): Promise<void>;
}

// Cache Service Interface
export interface ICacheService {
  loadedStores: IRepository<any>; // Adjust for more specificity if possible
  [repoName: string]: IRepository<IEntity>;
}

// API Handler Service Interface
export interface IApiHandlerService {
  getAll(endpoint: string): Promise<any>; // Adjust return type based on actual API structure
  getAllChunks(endpoint: string, strategy: ChunkLoadStrategy): Promise<any>;
}

export type ChunkLoadStrategy = 'strategy1' | 'strategy2' | any; // Define according to your actual strategy
