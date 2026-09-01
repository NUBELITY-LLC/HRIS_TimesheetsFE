import type { Dictionary } from "@/i18n/dictionaries";

type FieldErrorKey = keyof Dictionary["fieldErrors"];

const BACKEND_MESSAGE_KEYS: Record<string, FieldErrorKey> = {
  "El usuario es obligatorio": "usernameRequired",
  "El usuario excede la longitud permitida": "usernameTooLong",
  "La contrasena es obligatoria": "passwordRequired",
  "La contrasena excede la longitud permitida": "passwordTooLong",
  "El nombre completo es obligatorio": "fullNameRequired",
  "El nombre completo excede los 150 caracteres": "fullNameTooLong",
  "El usuario debe tener al menos 3 caracteres": "userNameTooShort",
  "El usuario excede los 50 caracteres": "userNameTooLong",
  "El usuario solo admite letras, numeros, punto, guion y guion bajo":
    "userNamePattern",
  "El correo no es valido": "emailInvalid",
  "El correo excede los 254 caracteres": "emailTooLong",
  "La contrasena debe tener al menos 8 caracteres": "passwordTooShort",
  "La contrasena excede los 200 caracteres": "passwordTooLong",
  "El rol es obligatorio": "roleRequired",
  "El rol excede los 30 caracteres": "roleTooLong",
  "El puesto excede los 100 caracteres": "jobTitleTooLong",
  "La nueva contrasena es obligatoria": "passwordRequired",
  "La nueva contrasena debe tener al menos 8 caracteres": "newPasswordTooShort",
  "La nueva contrasena excede la longitud permitida": "passwordTooLong",
  "La nueva contrasena debe ser distinta a la actual":
    "newPasswordSameAsCurrent",
  "La contrasena actual es obligatoria": "passwordRequired",
  "La contrasena actual excede la longitud permitida": "passwordTooLong",
  "La contrasena actual debe ser texto": "passwordRequired",
  "La contrasena debe incluir al menos una minuscula": "passwordNeedsLowercase",
  "La contrasena debe incluir al menos una mayuscula": "passwordNeedsUppercase",
  "La contrasena debe incluir al menos un numero": "passwordNeedsNumber",
  "La contrasena debe incluir al menos un simbolo": "passwordNeedsSymbol",
  "La nueva contrasena debe incluir al menos una minuscula": "passwordNeedsLowercase",
  "La nueva contrasena debe incluir al menos una mayuscula": "passwordNeedsUppercase",
  "La nueva contrasena debe incluir al menos un numero": "passwordNeedsNumber",
  "La nueva contrasena debe incluir al menos un simbolo": "passwordNeedsSymbol",
  "La nueva contrasena excede los 200 caracteres": "passwordTooLong",
};

export function translateFieldMessage(message: string, t: Dictionary): string {
  const key = BACKEND_MESSAGE_KEYS[message];
  return key ? t.fieldErrors[key] : message;
}
