import { useRef, useState, useEffect } from "react";
import BasicModalWindow from "./BasicModal";
import {
    YMaps,
    Map,
    Placemark,
    Button as YButton,
    GeolocationControl
} from "@iminside/react-yandex-maps";
import type { DeliveryAddress, GeocodeResolveAddressRequest } from "~/models/addresses";
import Button from "../general/Button";
import { resolveAddressByCoords } from "~/api/addresses";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

type InputFieldProps = {
    title?: string;
    placeholder: string;
    value: string;
    maxLength?: number;
    required?: boolean;
    additionalClassNames?: string;
    as?: "input" | "textarea";
    type?: string;
    textareaRows?: number;
    onChange: (val: string) => void;
};

function AddressInputField({ title: label, placeholder, value, maxLength, required = false, additionalClassNames: className = "",  as = "input", type = "text", textareaRows: rows = 4, onChange }: InputFieldProps) {
    const [ touched, setTouched] = useState(false);
    const [ error, setError ] = useState("");

    const isOnlyNumbers = type === "number";

    const handleBlur = () => {
        setTouched(true);
        
        if (required && !value) {
            setError("Обязательное поле")
        }
    };

    const handleChange = (val: string) => {
        if (isOnlyNumbers) {
            const numOnly = /^\d*$/;
            if (numOnly.test(val)) {
                onChange(val);
                if (setError) setError("");
            } else {
                if (setError) setError("Допустимы только цифры");
            }
        } else {
            onChange(val);
        }
    };

    const showError = touched && error;
    const baseClasses = `w-full p-2 rounded border outline-none transition resize-none bg-input text-text-input ${ showError ? "border-red-500" : "border-gray-300 focus:border-blue-500" }`;
    const lengthInfo = maxLength ? `${value.length} / ${maxLength}` : "";

    return (
        <div className={`flex flex-col gap-1 ${ className }`}>
            { label && (
                <label className="text-sm font-medium text-gray-700">
                    { label }: { required && <span className="text-red-500">*</span> }
                </label>
            ) }

            <div className="relative">
                { as === "textarea" ? (
                    <textarea
                        className={ baseClasses + "resize-none pr-14" }
                        placeholder={ placeholder }
                        value={ value }
                        maxLength={ maxLength }
                        onChange={ (e) => handleChange(e.target.value) }
                        onBlur={ handleBlur }
                        rows={ rows }
                    />
                ) : (
                    <input
                        type="text"
                        className={ baseClasses + " pr-20" }
                        placeholder={ placeholder }
                        value={ value }
                        maxLength={ maxLength }
                        onChange={ (e) => handleChange(e.target.value) }
                        onBlur={ handleBlur }
                    />
                ) }

                { maxLength && (
                    <div
                        className={ `absolute text-sm text-gray-400 ${as === "textarea" ? "bottom-1.5 right-2" : "top-1/2 right-2 -translate-y-1/2"}` }
                    >
                        { lengthInfo }
                    </div>
                ) }
            </div>

            { showError && <p className="text-sm text-red-500">{ error }</p> }
        </div>
    );
}

type DeliveryAddressModalProps = {
    address?: DeliveryAddress;
    onClose: () => void;
    onSave: (address: DeliveryAddress) => Promise<string>;
};

export default function DeliveryAddressModal({
    address = {} as DeliveryAddress,
    onClose,
    onSave,
}: DeliveryAddressModalProps) {
    const [city, setCity] = useState(address.city || "");
    const [street, setStreet] = useState(address.street || "");
    const [buildingNumber, setBuilding] = useState(address.buildingNumber || "");
    const [apartmentNumber, setApartment] = useState(address.apartmentNumber || "");
    const [entranceNumber, setEntrance] = useState(address.entranceNumber || "");
    const [intercom, setIntercom] = useState(address.intercom || "");
    const [comment, setComment] = useState(address.comment || "");
    const [coords, setCoords] = useState<[number, number]>(address.coordinates ? (address.coordinates.split(" ").map(Number) as [number, number]) : [55.751574, 37.573856]); // Это координаты центра Москвы

    const resolveAddressBtnRef = useRef<any>(null);
    const clickHandlerRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (resolveAddressBtnRef.current) {
            if (clickHandlerRef.current) {
                resolveAddressBtnRef.current.events.remove('click', clickHandlerRef.current);
            }           

            const handler = async () => {
                if (!coords) {
                    toast.error("Сначала выберите точку на карте.");
                    return;
                }

                try {
                    const resolvedAddress = await resolveAddressByCoords({
                        lat: coords[0],
                        lon: coords[1]
                    } as GeocodeResolveAddressRequest);

                    setCity(resolvedAddress.city);
                    setStreet(resolvedAddress.street);
                    setBuilding(resolvedAddress.buildingNumber);
                } catch (error) {
                    if (error instanceof AxiosError && error.response) {
                        toast.error(error.response.data.error);
                    } else {
                        toast.error("Произошла ошибка...");
                    }
                }
            };

            resolveAddressBtnRef.current.events.add('click', handler);
            clickHandlerRef.current = handler;
        }
    }, [coords]);

    const handleMapClick = (e: any) => {
        const newCoords: [number, number] = e.get("coords");
        setCoords(newCoords);
    };

    const handleSubmit = async () => {
        if (!city || !street || !buildingNumber) {
            toast.error("Заполните обязательные поля!");
            return;
        }
        else if (isNaN(+apartmentNumber) || isNaN(+entranceNumber) || isNaN(+intercom)) {
            toast.error("Квартира/подъезд/домофон должны быть числами!");
            return;
        }

        const error = await onSave({ city, street, buildingNumber, apartmentNumber, entranceNumber, intercom, comment, coordinates: coords.join(" ") });
        if (error) {
            toast.error(error);
            return;
        }

        toast.success("Адрес доставки добавлен!");
        onClose();
    };

    return (
        <BasicModalWindow isOpen={ true } onClose={ onClose } title="Новый адрес доставки">
            <div className="flex flex-col gap-3 w-full px-2 py-1 justify-center">
                <AddressInputField
                    title="Введите город"
                    required={ true }
                    placeholder="Город..."
                    value={ city }
                    onChange={ (val) => setCity(val) }
                />

                <AddressInputField
                    title="Введите улицу"
                    required={ true }
                    placeholder="Улица..."
                    value={ street }
                    onChange={ (val) => setStreet(val) }
                />

                <div className="flex flex-col md:flex-row gap-1">
                    <AddressInputField
                        title="Введите дом"
                        required={ true }
                        placeholder="Дом/строение..."
                        value={ buildingNumber }
                        onChange={ (val) => setBuilding(val) }
                    />

                    <AddressInputField
                        title="Введите квартиру"
                        placeholder="Кваритра/офис..."
                        value={ apartmentNumber }
                        type="number"
                        onChange={ (val) => setApartment(val) }
                    />

                    <AddressInputField
                        title="Введите подъезд"
                        placeholder="Подъезд..."
                        value={ entranceNumber }
                        maxLength={ 5 }
                        type="number"
                        onChange={ (val) => setEntrance(val) }
                    />

                    <AddressInputField
                        title="Введите домофон"
                        placeholder="Домофон..."
                        value={ intercom }
                        maxLength={ 5 }
                        type="number"
                        onChange={ (val) => setIntercom(val) }
                    />
                </div>

                <AddressInputField
                    title="Введите какие-либо комментарии"
                    placeholder="Комментарий..."
                    value={ comment }
                    as="textarea"
                    maxLength={ 128 }
                    onChange={ (val) => setComment(val) }
                />

                <div className="h-64 w-full mt-2 rounded overflow-hidden border">
                    <YMaps>
                        <Map
                            defaultState={{ center: coords, zoom: 15, controls: [] }}
                            width="100%"
                            height="100%"
                            onClick={ handleMapClick }
                        >
                            <Placemark geometry={ coords }/>
                            <YButton
                                options={{ maxWidth: 256 }}
                                data={
                                    {
                                        content: "Определить адрес"
                                    }
                                }
                                instanceRef={ (ref) => {
                                    resolveAddressBtnRef.current = ref;
                                } }
                            />
                            <GeolocationControl options={{ float: "left" }} />
                        </Map>
                    </YMaps>
                </div>

                <Button
                    onClick={ handleSubmit }
                >
                    Сохранить адрес
                </Button>
            </div>
        </BasicModalWindow>
    );
}
