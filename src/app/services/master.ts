import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseModel } from '../model/user.model';
import { UserService } from './user';

@Injectable({
  providedIn: 'root',
})
export class Master {
  
  UserSrv = inject(UserService);
  constructor(private http: HttpClient) {}

  // getSitesByClientID(): Observable<ResponseModel> {
    // const clientId = this.UserSrv.loggedUserData.extraId;
    // return this.http.get('https://api.freeprojectapi.com/api/SmartParking/GetSitesByClientId?id=1')
  }
// }
 
