import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormBuilderHelper } from './_helpers/form-builder.helper';
import { FormSkeletonArray } from './_arrays/form-skeleton.array';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {

  jabberForm: FormGroup = {} as FormGroup;

  formSkeleton = FormSkeletonArray;

  constructor(
    private formBuilder: FormBuilder
  ) {}


  ngOnInit(): void {
    this.jabberForm = FormBuilderHelper(this.formBuilder);
  }
}
