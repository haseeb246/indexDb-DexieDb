import { Dexie } from 'dexie';
import { IFilterDelegate } from '../index-db-interfaces/idb.interface';

export class DexieCrudService<T, Tkey> {
  dbSet: Dexie.Table<T, Tkey>;

  constructor(dbSet: Dexie.Table<T, Tkey>) {
    this.dbSet = dbSet;
  }

  getAll(filterDelegate: IFilterDelegate | undefined = undefined) {
    if (!!filterDelegate) {
      return filterDelegate(this.dbSet).toArray();
    }
    return this.dbSet.toArray();
  }

  async AddBulkAsync(items: T[]) {
    const batchSize = 1000;
    let processed = 0;

    while (processed < items.length) {
      const batch = items.slice(processed, processed + batchSize);
      await this.dbSet.bulkPut(batch);
      processed += batchSize;
    }
  }

  getById(id: Tkey) {
    return this.dbSet.get(id);
  }
  async AddAsync(item: T): Promise<void> {
    await this.dbSet.add(item);
  }

  async AddOrEditAsync(item: T): Promise<void> {
    await this.dbSet.put(item);
  }

  async UpdateAsync(id: Tkey, changes: Partial<T>): Promise<void> {
    await this.dbSet.update(id, changes);
  }

  async RemoveAsync(id: Tkey): Promise<void> {
    await this.dbSet.delete(id);
  }

  async RemoveRangeAsync(ids: Tkey[]): Promise<void> {
    await this.dbSet.bulkDelete(ids);
  }

  ////////////////////////////
  // Find by index
  findByIndex(indexName: string, value: any) {
    return this.dbSet.where(indexName).equals(value).toArray();
  }

  // Find by criteria
  findByCriteria(criteria: { [key: string]: any }) {
    let collection = this.dbSet.toCollection();

    Object.keys(criteria).forEach((key) => {
      collection = collection.filter(
        (item) => (item as any)[key] === criteria[key]
      );
    });

    return collection.toArray();
  }

  // Perform a transaction (Consider implementing this in a higher-level service where access to the Dexie instance is available)
  static async transaction(
    db: Dexie,
    tableNames: string[],
    mode: 'readonly' | 'readwrite',
    operation: () => Promise<void>
  ) {
    return db.transaction(mode, tableNames, operation);
  }

  // Bulk add with a more efficient method
  async addBulk(items: T[]) {
    return this.dbSet.bulkAdd(items);
  }

  // Count items
  count() {
    return this.dbSet.count();
  }

  // Clear all items from the table
  clear() {
    return this.dbSet.clear();
  }

  // More efficient bulk update
  async updateBulk(items: { id: Tkey; changes: Partial<T> }[]) {
    const ops = items.map((item) => this.dbSet.update(item.id, item.changes));
    await Promise.all(ops);
  }

  // Utility for efficiently handling large arrays in chunks
  async processInChunks(
    items: T[],
    processFunction: (items: T[]) => Promise<void>,
    chunkSize: number = 500
  ) {
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      await processFunction(chunk);
    }
  }

  // Perform a transaction with multiple operations
  // async transaction<T>(
  //   operation: (
  //     table: Dexie.Table<T, TKey>,
  //     otherTables: { [name: string]: Dexie.Table<any, any> }
  //   ) => Promise<T>,
  //   otherTableNames: string[] = []
  // ): Promise<T> {
  //   return this.dbSet.Dexie.transaction(
  //     'rw',
  //     [this.dbSet.name, ...otherTableNames],
  //     async () => {
  //       const otherTables = otherTableNames.reduce((acc, name) => {
  //         acc[name] = this.dbSet.dexie.table(name);
  //         return acc;
  //       }, {});

  //       return operation(this.dbSet, otherTables);
  //     }
  //   );
  // }
}
