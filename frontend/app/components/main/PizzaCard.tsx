import type { Pizza } from "~/models/pizza";

export default function PizzaCard({ pizza }: {pizza: Pizza}) {
    function addToCart() {
        // TODO
    }

    return (
        <div className="flex flex-row rounded-xl p-5 min-h sm:min-h-44 bg-secondary text-text-secondary">
            <div className="p-5 items-center">
                <img
                    className="min-w-20 min-h-20" 
                    src={pizza.iconUrl.length != 0 ? pizza.iconUrl : undefined}
                ></img>
            </div>
            <div className="flex flex-col flex-grow">
                <div className="text-xl font-bold">
                    {pizza.name}
                </div>

                <div className="line-clamp-3 text-ellipsis py-0.5 min-h-15">
                    {pizza.description}
                </div>

                <div className="flex flex-row w-full items-center align-middle justify-between">
                    <div className="text-xl font-bold font-bounded">
                        {pizza.basePrice}₽
                    </div>
                    <div>
                        <button
                            className="rounded-xl p-3 font-bounded cursor-pointer bg-primary text-text-primary hover:bg-primary/85"
                            onClick={addToCart}
                        >
                            В корзину
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}