import debounce from "lodash.debounce";
import { useEffect, useState } from "react";

type ValidatorFn = (value: string, values?: Record<string, string>) => string;

interface InputFieldConfig {
    initialValue: string;
    validateFunc: ValidatorFn;
}

type FormConfig = Record<string, InputFieldConfig>;

export default function useForm(config: FormConfig) {
    let [ values, setValues ] = useState<Record<string, string>>(
        Object.fromEntries(
            Object.entries(config).map(
                ([fieldName, fieldConfig]) => [ fieldName, fieldConfig.initialValue ]
            )
        )
    );
    
    let [ errors, setErrors ] = useState<Record<string, string>>({});
    let [ wasTouched, setWasTouched ] = useState<Record<string, boolean>>({});

    useEffect(
        () => {
            let debouncedValidate = debounce(() => {
                let newErrors: Record<string, string> = {};

                for (const fieldName in config) {
                    if (wasTouched[fieldName]) {
                        let error = config[fieldName].validateFunc(values[fieldName], values);
                        
                        if (error) {
                            newErrors[fieldName] = error;
                        }
                    }
                }

                setErrors(newErrors);
            }, 500);

            debouncedValidate();

            return () => debouncedValidate.cancel();
        }, [ values, wasTouched ]
    );

    const handleFieldChange = (fieldName: string) => (value: string) => {
        setValues((oldValues) => ( {...oldValues, [fieldName]: value} ));
        setWasTouched((oldValues) => ( { ...oldValues, [fieldName]: true } ));
    };

    const validateForm = (): boolean => {
        let newErrors: Record<string, string> = {};

        for (let key in config) {
            let error = config[key].validateFunc(values[key], values);
            wasTouched[key] = true;

            if (error) {
                newErrors[key] = error;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    return {
        values,
        errors,
        handleFieldChange,
        validateForm
    };
}
