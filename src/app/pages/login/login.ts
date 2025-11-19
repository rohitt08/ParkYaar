import { Component, inject } from '@angular/core';
import { IUserModel, User } from '../../model/user.model';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user'
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {

  loginObj: User = new User();
  userSrv = inject(UserService);
  router = inject(Router);
  showPassword: boolean = false;
  loading: boolean = false;
  errorMessage: string = '';

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

 onLogin() {
  if (!this.loginObj.emailId || !this.loginObj.password) {
    this.errorMessage = 'Please enter username and password';
    return;
  }
  this.loading = true;
  this.errorMessage = '';
  this.userSrv.loginUser(this.loginObj).subscribe(
    (res: IUserModel) => {
      this.loading = false;
      localStorage.setItem("parkUser", JSON.stringify(res))
      this.userSrv.loggedUserData = res;
      this.router.navigateByUrl('/dashboard')
    },
    error=> {
      this.loading = false;
      this.errorMessage = 'Login failed: wrong credentials';
    }
  );
}


}

