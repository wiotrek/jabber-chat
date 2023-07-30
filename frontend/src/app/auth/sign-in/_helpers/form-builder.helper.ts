import { FormBuilder, FormGroup, Validators } from "@angular/forms";

export const FormBuilderHelper = (fb: FormBuilder): FormGroup => fb.group({
  username: [
    '',
    Validators.compose([
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(255)
    ])
  ],
  password: [
    '',
    Validators.compose([
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(255)
    ])
  ]
})
