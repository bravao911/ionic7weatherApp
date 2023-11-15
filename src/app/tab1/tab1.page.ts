import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';
import * as moment from 'moment';
import { LocalNotifications } from '@capacitor/local-notifications';
import { debounceTime, distinctUntilChanged, forkJoin, switchMap } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  res;
  resCurrent;
  cityFilter: any = { name: '' };
  cities: any[] = [];

  constructor(public api: ApiService) { }

  ngOnInit(): void {
    this.getWeatherData();
    this.getWeatherDataCurrent();
    LocalNotifications.checkPermissions().then(status => {
      console.log(status.display)
      LocalNotifications.requestPermissions().then(per => {
        console.log(per.display)
      })
    })
  }

  getWeatherData() {
    this.api.getWeatherData().subscribe((response) => {
      this.res = response;
    });
  }
  getWeatherDataCurrent() {
    this.api.getWeatherDataCurrent().subscribe((response) => {
      this.resCurrent = response;
      const formattedTemp = (this.resCurrent?.main.temp / 10).toFixed(0);
      LocalNotifications.schedule({
        notifications: [
          {
            title: "Good day !",
            body: 'Current temp is ' + formattedTemp,
            id: 1,
            //schedule: { at: new Date(Date.now() + 1000 * 5) },
            sound: null,
            attachments: null,
            actionTypeId: "",
            extra: null,
          }
        ],
      });
    });
  }

  doRefresh(event) {
    console.log('Ion-refresh running...');
    this.api.getWeatherData().subscribe((response) => {
      this.res = response;
      console.log(this.res);
      console.log('done reloading weather data');
      event.target.complete();
    });
    this.api.getWeatherDataCurrent().subscribe((response) => {
      this.resCurrent = response;
      console.log(this.resCurrent);
      console.log('done reloading weather current data');
      event.target.complete();
    });
  }
  // format day 
  days(a) {
    const timestamp = a * 1000 || 0;

    return moment(timestamp).format('ddd h:mm a')
  }

  from_now(a) {
    // Check if a is a valid timestamp (in seconds), and convert it to milliseconds if needed
    const timestamp = a * 1000 || 0;
    return moment(timestamp).fromNow();
  }

  searchCities(event: any) {
    const apiUrl = 'https://api.openweathermap.org/geo/1.0/direct';
    const apiKey = '7f56317c7aee1e60c731391d37a80bc1';

    if (event.detail.value === '') {
      this.cities = [];
      return;
    }

    this.api.http
      .get(`${apiUrl}?q=${event.detail.value}&limit=5&appid=${apiKey}`)
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((data: any) => data)
      )
      .subscribe((data: any) => {
        this.cities.push(data);
      });
  }

  getResults() {
    // Handle getting results on "Enter" key press
    // You may want to adjust this based on your requirements
    if (this.cities.length > 0) {
      const selectedCity = this.cities[0]; // Assuming you want the first result
      this.select_city(selectedCity);
    }
  }

  select_city(city: any) {
    console.log('Before API requests');
    this.api.lat = city.lat;
    this.api.lon = city.lon;

    forkJoin([
      this.api.getWeatherData(),
      this.api.getWeatherDataCurrent()
    ]).subscribe(([weatherData, currentWeatherData]) => {
      console.log('API requests completed');
      this.res = weatherData;
      this.resCurrent = currentWeatherData;
    });

    this.cities = [];
  }


  clearSearch($event) {
    console.log($event)
    if ($event.detail.value === '') {
      this.cities = [];
      return;
    }
  }

  getLocction(){
    Geolocation.getCurrentPosition().then(res=>{
      res.coords
      this.api.lat = res.coords.latitude;
      this.api.lon = res.coords.longitude;
  
      forkJoin([
        this.api.getWeatherData(),
        this.api.getWeatherDataCurrent()
      ]).subscribe(([weatherData, currentWeatherData]) => {
        console.log('API requests completed');
        this.res = weatherData;
        this.resCurrent = currentWeatherData;
      });
  
      this.cities = [];
    })
  }


}
