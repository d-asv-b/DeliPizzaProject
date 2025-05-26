import BasicModalWindow from "./BasicModal";
import Button from "../general/Button";
import { useState } from "react";
import toast from "react-hot-toast";

type PaymentMethodModalProps = {
    onClose: () => void;
    onSave: (method: CreatePaymentMethodRequest) => Promise<string>;
}

export default function PaymentMethodModal({
    onClose,
    onSave,
}: PaymentMethodModalProps) {
    const [cardNumber, setCardNumber] = useState("");
    const [cardholderName, setCardholderName] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvc, setCvc] = useState("");

    const [errors, setErrors] = useState<{
        cardNumber?: string;
        cardholderName?: string;
        expiry?: string;
        cvc?: string;
    }>({});

    const validateField = (field: string, value: string) => {
        switch (field) {
            case "cardNumber":
                return /^\d{16}$/.test(value) ? "" : "Введите 16-значный номер карты";
            case "cardholderName":
                return /^[A-Za-zА-Яа-яЁё\s]+$/.test(value.trim())
                    ? ""
                    : "Имя должно содержать только буквы";
            case "expiry":
                return /^(0[1-9]|1[0-2])\/\d{2}$/.test(value)
                    ? ""
                    : "Введите срок в формате MM/YY";
            case "cvc":
                return /^\d{3,4}$/.test(value) ? "" : "Введите 3-4 цифры CVC";
            default:
                return "";
        }
    };

    const handleChange = (
        field: keyof typeof errors,
        rawValue: string,
        filter: (val: string) => string
    ) => {
        const value = filter(rawValue);
        switch (field) {
            case "cardNumber":
                setCardNumber(value);
                break;
            case "cardholderName":
                setCardholderName(value);
                break;
            case "expiry":
                setExpiry(value);
                break;
            case "cvc":
                setCvc(value);
                break;
        }
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error || undefined }));
    };

    const handleSave = async () => {
        const newErrors = {
            cardNumber: validateField("cardNumber", cardNumber),
            cardholderName: validateField("cardholderName", cardholderName),
            expiry: validateField("expiry", expiry),
            cvc: validateField("cvc", cvc),
        };

        setErrors(newErrors);

        const isValid = Object.values(newErrors).every((err) => !err);

        if (isValid) {
            const error = await onSave({ cardHolder: cardholderName, cardLast4Numbers: cardNumber.slice(-4), expiryDate: expiry });
            if (error) {
                toast.error(error);
                return;
            }

            toast.success("Метод оплаты добавлен!");
            onClose();
        }
    };

    const inputClass = (hasError?: boolean) =>
        `w-full border rounded-md px-3 py-2 outline-none ${
            hasError ? "border-red-500" : "border-gray-300"
        } focus:ring-2 focus:ring-blue-400 transition`;

    return (
        <BasicModalWindow isOpen={true} onClose={onClose} title="Новая карта">
            <div className="flex flex-col gap-4">
                <div>
                    <input
                        placeholder="Номер карты"
                        value={cardNumber}
                        maxLength={16}
                        onChange={(e) =>
                            handleChange("cardNumber", e.target.value, (val) =>
                                val.replace(/\D/g, "")
                            )
                        }
                        className={inputClass(!!errors.cardNumber)}
                    />
                    {errors.cardNumber && (
                        <p className="text-sm text-red-500 mt-1">{errors.cardNumber}</p>
                    )}
                </div>

                <div>
                    <input
                        placeholder="Имя держателя"
                        value={cardholderName}
                        onChange={(e) =>
                            handleChange("cardholderName", e.target.value, (val) =>
                                val.replace(/[^A-Za-zА-Яа-яЁё\s]/g, "")
                            )
                        }
                        className={inputClass(!!errors.cardholderName)}
                    />
                    {errors.cardholderName && (
                        <p className="text-sm text-red-500 mt-1">
                            {errors.cardholderName}
                        </p>
                    )}
                </div>

                <div className="flex gap-3">
                    <div className="flex-1">
                        <input
                            placeholder="MM/YY"
                            value={expiry}
                            maxLength={5}
                            onChange={(e) =>
                                handleChange("expiry", e.target.value, (val) =>
                                    val.replace(/[^0-9/]/g, "")
                                )
                            }
                            className={inputClass(!!errors.expiry)}
                        />
                        {errors.expiry && (
                            <p className="text-sm text-red-500 mt-1">{errors.expiry}</p>
                        )}
                    </div>
                    <div className="flex-1">
                        <input
                            placeholder="CVC"
                            value={cvc}
                            maxLength={4}
                            onChange={(e) =>
                                handleChange("cvc", e.target.value, (val) =>
                                    val.replace(/\D/g, "")
                                )
                            }
                            className={inputClass(!!errors.cvc)}
                        />
                        {errors.cvc && (
                            <p className="text-sm text-red-500 mt-1">{errors.cvc}</p>
                        )}
                    </div>
                </div>

                <Button
                    onClick={handleSave}
                >
                    Сохранить карту
                </Button>
            </div>
        </BasicModalWindow>
    );
}