import PizzaCard from "./PizzaCard";
import { usePizzaList } from "~/contexts/PizzaListContext";

export default function PizzaCardContainer() {
    const { isLoading, pizzaList } = usePizzaList();

    return (
        <div
            className="
                grid
                h-full
                w-full
                sm:grid-cols-1
                lg:grid-cols-2
                xl:grid-cols-3
                justify-center
                overflow-y-auto
                gap-1
                md:px-20
                sm:px-0
                py-1
                bg-main
                bg-[url('/img/pizza-pattern.svg')]
                bg-repeat
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-track]:my-3
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:my-3
                [&::-webkit-scrollbar-thumb]:bg-scrollbar
            "
        >
            {!isLoading &&
                (
                    pizzaList.map(pizza => (
                        <PizzaCard pizza={pizza} />
                    ))
                )
            }
        </div>
    )
}