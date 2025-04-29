export function checkLength(pwd: string) {
    return pwd.length > 8;
}

export function hasUpperCase(pwd: string): boolean {
    return /[A-Z]/.test(pwd);
}

export function hasLowerCase(pwd: string): boolean {
    return /[a-z]/.test(pwd);
}

export function hasNumbers(pwd: string): boolean {
    return /[0-9]/.test(pwd);
}

export function pwdAreEqual(pwd: string, pwdConfirm: string): boolean {
    return pwd !== pwdConfirm;
}

export function validateName(name: string): string {
    if (!name.trim()) {
        return "Введите имя!";
    }

    return "";
}

export function validateEmail(email: string): string {
    if (!email.trim()) {
        return "Введите почту!";
    }

    const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegExp.test(email)) {
        return "Неверный формат почты";
    }

    return "";
}

export function validatePhone(phone: string): string {
    if (!phone.trim()) {
        return "Введите номер телефона!";
    }

    const phoneRegExp = /^\+?[0-9]{7,15}$/;
    if (!phoneRegExp.test(phone)) {
        return "Неверный формат телефона.";
    }

    return "";
}

export function validatePassword(password: string): string {
    if (password.length < 6) return "Пароль должен содержать минимум 6 символов.";
    return "";
}

export function validatePasswordConfirm(password: string, confirmPassword: string): string {
    if (password !== confirmPassword) {
        return "Пароли не совпадают.";
    }

    return "";
}