import { Observable } from 'rxjs';

export interface IApiBaseActions {
  Get(url: string, params?: any): Observable<any>;

  GetAll(url: string, params?: any): Observable<any>;

  Post(url: string, data: any, params?: any): Observable<any>;

  Delete(url: string, data?: any, params?: any): Observable<any>;

  Put(url: string, data: any, params?: any): Observable<any>;
}

export interface IApiBaseResponse {
  success?: boolean;
  status: boolean;
  response: any;
  message: string;
}
