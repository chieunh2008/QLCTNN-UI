// src/app/auth/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FunctionService } from '../../services/function.service';
import {
  FormBuilder,
  FormGroup, 
  Validators, 
} from '@angular/forms';  
 
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],

})

export class LoginComponent implements OnInit {
  signInForm!: FormGroup;
  signUpForm!: FormGroup;
  loading = false; 
  isSignUp = false;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private functionService: FunctionService
  ) { }


  ngOnInit(): void {
    // Nếu đã có token thì chuyển về trang index
    const token = sessionStorage.getItem('token');
    if (token) {
      this.router.navigate(['/']);
      return;
    }

    this.signInForm = this.fb.group({
      username: [''],
      password: [''],
    });

    this.signUpForm = this.fb.group({
      username: ['', Validators.required],
      fullname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required],
    });
  }


  switchPanel(isSignUp: boolean) {
    this.isSignUp = isSignUp;
  }

  async onSignIn() {
    if (this.signInForm.invalid) return;
    this.loading = true;
    const { username, password } = this.signInForm.value;
    this.loginService.login(username, password).subscribe(res => {
      this.loading = false;
      if (res.meta.error_code === 200) {
        this.snackBar.open(res.meta.error_message, 'Đóng', { duration: 2000 });
        // Token is already stored in tokenService via login method
        // Lưu thông tin user vào localStorage
        const userInfo = res.data;
        localStorage.setItem('user', JSON.stringify(userInfo));
        // Lấy chức năng từ fakeFunction theo userId
        const menuFunctions = this.functionService.getFunctionsByUserId(userInfo.Id);
        localStorage.setItem('menuFunctions', JSON.stringify(menuFunctions));
        this.router.navigate(['/']);
      } else {
        this.snackBar.open('Đang có lỗi xảy ra vui lòng thử lại sau!', 'Đóng', { duration: 2000 });
      }
    });
  }

  // async onSignUp() {
  //   if (this.signUpForm.invalid) return;
  //   this.loading = true;
  //   this.loginService.register(this.signUpForm.value).subscribe(res => {
  //     this.loading = false;
  //     if (res.e === 201) {
  //       this.snackBar.open(res.status_messenger, 'Đóng', { duration: 2000 });
  //       this.isSignUp = false;
  //       this.signUpForm.reset();
  //     } else {
  //       this.snackBar.open(res.status_messenger, 'Đóng', { duration: 2000 });
  //     }
  //   });
  // }
}
