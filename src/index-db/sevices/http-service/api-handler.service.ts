import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';

import { IApiBaseActions } from 'src/app/interfaces/api-base-action.interface';

@Injectable({
  providedIn: 'root',
})
export class ApiHandlerService implements IApiBaseActions {
  constructor(private httpClient: HttpClient) {}

  private createParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        httpParams = httpParams.append(key, value as any);
      });
    }
    return httpParams;
  }

  private handleResponse(response: any) {
    // if (response.status === 500) {
    //   // Handle server error
    //   alert(ResponseMessages.serverError);
    // }
    debugger;
    return response; // You might want to handle other status codes as needed
  }

  Get(url: string, params?: any) {
    return this.httpClient
      .get<any>(url, { params: this.createParams(params) })
      .pipe(tap(this.handleResponse));
  }

  GetAll(url: string, params?: any) {
    return this.httpClient
      .get<any>(url, { params: this.createParams(params) })
      .pipe(tap(this.handleResponse));
  }

  Post(url: string, data: any, params?: any) {
    return this.httpClient
      .post<any>(url, data, {
        params: this.createParams(params),
      })
      .pipe(tap(this.handleResponse));
  }

  Put(url: string, data: any, params?: any) {
    return this.httpClient
      .put<any>(url, data, {
        params: this.createParams(params),
      })
      .pipe(tap(this.handleResponse));
  }

  Delete(url: string, params?: any) {
    return this.httpClient
      .delete<any>(url, { params: this.createParams(params) })
      .pipe(tap(this.handleResponse));
  }

  // async GetAllChunks(
  //   url: string,
  //   chunkLoadStrategy: ChunkLoadStrategy
  // ): Promise<T> {
  //   let totalRecords = (
  //     await this.Get<number>(chunkLoadStrategy.countEndPoint).toPromise()
  //   ).response;

  //   if (totalRecords && totalRecords <= chunkLoadStrategy.limit) {
  //     return this.GetAll(url) ?? [];
  //   } else {
  //     let apiCalls: Observable<T[]>[] = [];
  //     for (
  //       let start = 0;
  //       start < (totalRecords || 0);
  //       start += chunkLoadStrategy.limit
  //     ) {
  //       let params = {
  //         limit: chunkLoadStrategy.limit.toString(),
  //         offset: start.toString(),
  //       };
  //       apiCalls.push(this.GetAll(url, params));
  //     }

  //     return forkJoin(apiCalls)
  //       .pipe(
  //         tap(() => {}),
  //         catchError((error) => {
  //           throw new Error(error);
  //         }),
  //         map((responses) => ({
  //           status: true,
  //           response: flatten(responses.map((response) => response.response)),
  //         }))
  //       )
  //       .toPromise();
  //   }
  // }
}
