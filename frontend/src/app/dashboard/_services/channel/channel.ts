import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';


const API_URL = environment.API_URL;
@Service()
export class Channel {
  private readonly http = inject(HttpClient);

  getChannels(): Observable<any> {
    return this.http.get('channels');
  }
}
