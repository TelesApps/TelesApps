import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  get_notifyUser() {
    console.log('API Service: get_notifyUser');
    console.log('API URL:', this.apiUrl);
    // include some data in the req.query
    const data = {
      name: 'Teles Apps',
      email: 'telesapps85@gmail.com',
      message: 'Hello World',
    };
    return this.http.get(`${this.apiUrl}/notify-user`, { params: data, responseType: 'json' });
  }
}
