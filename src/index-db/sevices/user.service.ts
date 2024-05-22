import { Injectable } from '@angular/core';
import { EntityStateEnum } from '../enum/idb.enum';
import { IUser } from '../index-db-interfaces/user.interface';
import { BaseService } from './base-data.service';
import { CacheService } from './cache.service';
import { ApiHandlerService } from './http-service/api-handler.service';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseService<IUser> {
  private readonly userRepo: string = 'User'; // Should match the actual table name in your IndexedDB
  private readonly userEndpoint: string = '/api/users'; // Should match the actual API endpoint

  constructor(apiService: ApiHandlerService, cacheService: CacheService) {
    super(apiService, cacheService);
  }

  // Get a list of users
  async getUsers(): Promise<IUser[]> {
    return this.getListAsync(this.userRepo, this.userEndpoint);
  }

  // Add a new user
  async addUser(user: IUser): Promise<void> {
    const response = await this.apiService
      .Post(this.userEndpoint, user)
      .toPromise();
    if (response && response.id) {
      // Assuming the response will have the 'id' if successful
      await this.cacheService.addOrUpdate(this.userRepo, response);
      this.updateCache({
        state: EntityStateEnum.Added,
        table: this.userRepo,
        data: response,
      });
    } else {
      throw new Error('Failed to add user.');
    }
  }

  // Update an existing user
  async updateUser(user: IUser): Promise<void> {
    const response = await this.apiService
      .Put(`${this.userEndpoint}/${user.id}`, user)
      .toPromise();
    if (response) {
      await this.cacheService.addOrUpdate(this.userRepo, user);
      this.updateCache({
        state: EntityStateEnum.Modified,
        table: this.userRepo,
        data: user,
      });
    } else {
      throw new Error('Failed to update user.');
    }
  }

  // Delete a user by ID
  async deleteUser(id: number): Promise<void> {
    const response = await this.apiService
      .Delete(`${this.userEndpoint}/${id}`)
      .toPromise();
    if (response) {
      await this.cacheService.removeAsync(this.userRepo, id);
      this.updateCache({
        state: EntityStateEnum.Deleted,
        table: this.userRepo,
        data: { id } as IUser,
      });
    } else {
      throw new Error('Failed to delete user.');
    }
  }

  // Override the abstract method from BaseService to refresh user data
  protected async refreshData(): Promise<void> {
    // Clear the user data from the cache
    // You can implement logic to refresh the user data, for example:
    // 1. Clear the user data from cache
    // 2. Fetch the latest data from the API
    // 3. Update the cache with the new data
    // 4. Emit an event using `this.refreshSubject` if necessary
    // await this.cacheService.clear(this.userRepo);

    // Fetch the latest data from the API
    const apiData: any = await this.apiService
      .GetAll(this.userEndpoint)
      .toPromise();

    // Check if the API call was successful
    if (apiData && apiData.status) {
      // Update the cache with the new data
      const users = apiData.response;
      await this.cacheService.addBulkAsync(this.userRepo, users);

      // Emit an event using `this.refreshSubject` to inform any observers that the data has been refreshed
      this.refreshSubject.next({
        state: EntityStateEnum.Refreshed,
        table: this.userRepo,
        data: users,
      });
    } else {
      // Optionally handle the failure case, such as retrying the operation or logging an error
      console.error('Failed to refresh user data from the API.');
    }
  }

  // Method to externally trigger a refresh of user data
  async refreshUsers(): Promise<void> {
    await this.refreshData();
  }

  // ...other methods and properties...
}
