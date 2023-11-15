import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  lat:any= 34.74056
  lon:any= 10.76028

  constructor(public http: HttpClient) {}

  getWeatherData(): Observable<any> {

    let apiId = '7f56317c7aee1e60c731391d37a80bc1';
    // let queryString = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,hourly,alerts&appid=${apiId}`;
    // let queryString = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,hourly,alerts&appid=${apiId}`;
    let queryString = `https://api.openweathermap.org/data/2.5/forecast?lat=${this.lat}&lon=${this.lon}&appid=${apiId}`;
    return this.http.get(queryString);
  }
  getWeatherDataCurrent(): Observable<any> {

    let apiId = '7f56317c7aee1e60c731391d37a80bc1';
    let queryString = `https://api.openweathermap.org/data/2.5/weather?lat=${this.lat}&lon=${this.lon}&appid=${apiId}`;
    return this.http.get(queryString);
  }
}
