import { environment } from '../../environments/environment.prod';

export const API_URL: string = environment.apiURL;

export const API_ENDPOINTS = {
  // Authentication
  // user: API_URL + 'get-users',
  user: 'https://jsonplaceholder.typicode.com/users',
  unit: API_URL + 'get-units',
  product: 'https://dummyjson.com/products',
};
