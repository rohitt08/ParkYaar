import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IUserModel, User } from '../model/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  loggedUserData: IUserModel | undefined;
  constructor(private http: HttpClient) {

    const loggeddata = localStorage.getItem('parkUser');
    if(loggeddata != null) {
      this.loggedUserData = JSON.parse(loggeddata);
    }
  }


  loginUser(obj: User): Observable<IUserModel> {
    return this.http.post<IUserModel> ("https://api.freeprojectapi.com/api/SmartParking/login",obj)
  }

  updateProfile(profile: Partial<IUserModel>) {
    if (!this.loggedUserData) return null;
    this.loggedUserData = { ...this.loggedUserData, ...profile } as IUserModel;
    try {
      localStorage.setItem('parkUser', JSON.stringify(this.loggedUserData));
    } catch (e) {}
    return this.loggedUserData;
  }
}
