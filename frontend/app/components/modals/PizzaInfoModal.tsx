import type { Pizza } from "~/models/pizza";
import BasicModalWindow from "./BasicModal";
import { useState } from "react";
import Button from "../general/Button";
import { FaPlus, FaMinus } from "react-icons/fa";

type PizzaModalParams = {
    pizzaData: Pizza;
    onClose: () => void;
    onSave: () => void;
};

export default function PizzaInfoModal({ pizzaData, onClose, onSave }: PizzaModalParams) {
    const [removedMainIngredients, setRemovedMainIngredients] = useState<string[]>([]);
    const [selectedAdditionalIngredients, setSelectedAdditionalIngredients] = useState<string[]>([]);

    const toggleMainIngredient = (id: string) => {
        setRemovedMainIngredients((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const toggleAdditionalIngredient = (id: string) => {
        setSelectedAdditionalIngredients((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const ingredientsPrice = pizzaData.additionalIngredients
        .filter((ingr) => selectedAdditionalIngredients.includes(ingr.id))
        .reduce((sum, ingr) => sum + ingr.price, 0);

    return (
        <BasicModalWindow
            title="Добавить в корзину..."
            isOpen={ true }
            onClose={ onClose }
        >
            <div className="flex flex-col">
                <div className="flex flex-col items-center lg:flex-row gap-10">
                    <div className="flex flex-grow h-full">
                        <img src={ pizzaData.iconUrl } className="w-xl lg:w-sm h-full"/>
                    </div>
                    <div className="flex flex-col text-text-secondary max-w-5xl w-full break-words gap-2">
                        <div className="font-bold text-2xl">
                            { pizzaData.name }
                        </div>
                        <p className="flex">
                            { pizzaData.description }
                        </p>
                        <div className="flex flex-col gap-1">
                            <div className="font-semibold">Основные ингредиенты:</div>
                            {
                                pizzaData.mainIngredients.map((ingr) => {
                                    const removed = removedMainIngredients.includes(ingr.id);
                                    return (
                                        <div key={ingr.id} className="flex flex-row gap-2 items-center">
                                            <button
                                                className={`p-1 rounded-lg items-center justify-center ${ removed ? "bg-green-700" : "bg-red-700" }`}
                                                onClick={() => toggleMainIngredient(ingr.id)}
                                            >
                                                { removed ? <FaPlus size={15} /> : <FaMinus size={15} /> }
                                            </button>
                                            <div className="font-semibold font-bubble-sans text-lg">0₽</div>
                                            <div>{ingr.name}</div>
                                        </div>
                                    );
                                })
                            }

                            <div className="font-semibold mt-4">Дополнительные ингредиенты:</div>
                            {
                                pizzaData.additionalIngredients.map((ingr) => {
                                    const selected = selectedAdditionalIngredients.includes(ingr.id);
                                    return (
                                        <div key={ingr.id} className="flex flex-row gap-2 items-center">
                                            <button
                                                className={`p-1 rounded-lg items-center justify-center ${ selected ? "bg-red-700" : "bg-green-700" }`}
                                                onClick={() => toggleAdditionalIngredient(ingr.id)}
                                            >
                                                { selected ? <FaMinus size={15} /> : <FaPlus size={15} /> }
                                            </button>
                                            <div className="font-semibold font-bubble-sans text-lg">{ingr.price}₽</div>
                                            <div>{ingr.name}</div>
                                        </div>
                                    );
                                })
                            }
                        </div>
                        <div className="flex flex-col lg:flex-row items-center gap-5 justify-end">
                            <div className="text-2xl font-bold">
                                Итого: <span className="font-bubble-sans">{pizzaData.basePrice}₽ + {ingredientsPrice}₽ = {pizzaData.basePrice + ingredientsPrice}₽</span>
                            </div>
                            <Button
                                extraClasses="p-4 text-xl w-full lg:w-fit"
                                onClick={ () => onSave }
                            >
                                Добавить в корзину
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </BasicModalWindow>
    )
}