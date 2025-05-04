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
    return pwd === pwdConfirm;
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

export function validatePasswordReg(password: string): string {
    if (password.length == 0) {
        return "Введите пароль!";
    }
    if (!(checkLength(password) && hasUpperCase(password) && hasLowerCase(password) && hasNumbers(password))) {
        return "Пароль должен удовлетворять всем требованиям.";
    }
    return "";
}

export function validatePasswordAuth(password: string): string {
    if (password.length == 0) {
        return "Введите пароль!";
    }
    else if (password.length < 8) {
        return "Пароль должен быть не короче 8 символов";
    }

    return "";
}

export function validatePasswordConfirm(confirmPassword: string, password: string): string {
    if (confirmPassword.length == 0) {
        return "Повторите пароль!";
    }
    if (validatePasswordReg(password) != "" || password !== confirmPassword) {
        return "Пароли должны удовлетворять всем требованиям.";
    }

    return "";
}