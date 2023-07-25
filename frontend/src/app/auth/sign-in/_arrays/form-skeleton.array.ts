export interface FormSkeletonModel {
  codeName: string;
  placeholder: string;
  label: string;
  type: 'text' | 'number' | 'password';
}

export const FormSkeletonArray: FormSkeletonModel[] = [
  {
    codeName: 'username',
    placeholder: 'miejsce na login',
    label: 'Podaj login:',
    type: 'text'
  },
  {
    codeName: 'password',
    placeholder: 'miejsce na haslo',
    label: 'Podaj haslo:',
    type: 'password'
  }
];
