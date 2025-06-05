import { AbstractControl, ValidatorFn } from '@angular/forms';

export function passwordsMatchValidator(controlName: string, matchingControlName: string): ValidatorFn {
  return (formGroup: AbstractControl): { [key: string]: any } | null => {
    const passwordControl = formGroup.get(controlName);
    const confirmPasswordControl = formGroup.get(matchingControlName);

    if (!passwordControl || !confirmPasswordControl) {
      return null; // Si alguno de los controles no existe, retorna null
    }

    if (confirmPasswordControl.errors && !confirmPasswordControl.errors['passwordsNotMatch']) {
      return null; // Si otro validador ha encontrado un error en confirmPasswordControl, no sobrescribir ese error
    }

    if (!passwordControl.value || !confirmPasswordControl.value) {
      confirmPasswordControl.setErrors({ required: true });
      return { required: true };
    }

    if (passwordControl.value !== confirmPasswordControl.value) {
      confirmPasswordControl.setErrors({ passwordsNotMatch: true });
      return { passwordsNotMatch: true };
    } else {
      confirmPasswordControl.setErrors(null);
    }

    return null;
  };
}
