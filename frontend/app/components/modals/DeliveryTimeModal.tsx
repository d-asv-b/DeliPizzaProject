import { useEffect, useState } from "react";
import BasicModalWindow from "./BasicModal";
import {
    format,
    addMinutes,
    setHours,
    setMinutes,
    addDays,
    startOfDay,
    isBefore,
    getHours,
    getMinutes,
    setSeconds,
    setMilliseconds,
} from "date-fns";
import Button from "../general/Button";

interface DeliveryTimeModalProps {
    onSave: (selectedDay: "today" | "tomorrow", selectedDate: string) => void;
    onClose: () => void;
}

export default function DeliveryTimeModal({ onSave, onClose }: DeliveryTimeModalProps) {
    const [day, setDay] = useState<"today" | "tomorrow">("today");
    const [timeOptions, setTimeOptions] = useState<Date[]>([]);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    useEffect(() => {
        generateAvailableTimes();
    }, [day]);

    const generateAvailableTimes = () => {
        const now = new Date();

        let referenceDate = startOfDay(now);
        if (day === "tomorrow") {
            referenceDate = addDays(startOfDay(now), 1);
        }

        const times: Date[] = [];
        let startTime: Date;

        if (day === "today") {
            let currentMinutes = getMinutes(now);
            let roundedMinutes = 0;

            if (currentMinutes === 0) {
                roundedMinutes = 0;
            } else if (currentMinutes <= 30) {
                roundedMinutes = 30;
            } else {
                roundedMinutes = 0;
                now.setHours(getHours(now) + 1);
            }

            startTime = setMinutes(setHours(now, getHours(now)), roundedMinutes);
            startTime = addMinutes(startTime, 30);

            const nineAmToday = setMinutes(setHours(startOfDay(now), 9), 0);
            if (isBefore(startTime, nineAmToday)) {
                startTime = nineAmToday;
            }

        } 
        else {
            startTime = setMinutes(setHours(referenceDate, 9), 0);
        }

        const endOfDayLimit = setMinutes(setHours(referenceDate, 22), 0);

        let currentTime = setMilliseconds(setSeconds(startTime, 0), 0);

        while (isBefore(currentTime, endOfDayLimit) || currentTime.getTime() === endOfDayLimit.getTime()) {
            times.push(currentTime);
            currentTime = addMinutes(currentTime, 30);
        }

        setTimeOptions(times);
        if (times.length > 0) {
            setSelectedTime(format(times[0], "HH:mm"));
        } else {
            setSelectedTime(null);
        }
    };

    const handleSave = () => {
        if (selectedTime) {
            onSave(day, selectedTime);
        }
    };

    return (
        <BasicModalWindow
            title="Выберите время доставки"
            isOpen={true}
            onClose={onClose}
        >
            <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex flex-row">
                    <button
                        className={`p-4 rounded-l-full w-32 ${
                            day === "today" ? "bg-header shadow-md text-text-secondary" : "bg-secondary"
                        }`}
                        onClick={() => setDay("today")}
                    >
                        Сегодня
                    </button>
                    <div className="h-full w-0.5 bg-gray-600"/>
                    <button
                        className={`p-4 rounded-r-full w-32 ${
                            day === "tomorrow" ? "bg-header shadow-md text-text-secondary" : "bg-secondary"
                        }`}
                        onClick={() => setDay("tomorrow")}
                    >
                        Завтра
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    {timeOptions.map((t) => (
                        <button
                            key={t.toISOString()}
                            className={`py-2 px-20 font-semibold text-lg rounded border ${
                                selectedTime === format(t.getTime(), "HH:mm")
                                    ? "bg-blue-500 text-secondary"
                                    : "bg-secondary"
                            }`}
                            onClick={() => setSelectedTime(format(t, "HH:mm"))}
                        >
                            {format(t, "HH:mm")}
                        </button>
                    ))}
                </div>

                <Button
                    extraClasses="w-full py-4 text-2xl"
                    onClick={handleSave}
                    isDisabled={!selectedTime}
                >
                    Сохранить
                </Button>
            </div>
        </BasicModalWindow>
    );
}
