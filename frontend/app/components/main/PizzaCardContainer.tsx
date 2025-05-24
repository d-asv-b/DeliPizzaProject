import PizzaCard from "./PizzaCard";
import { usePizzaList } from "~/contexts/PizzaListContext";
import { BiLoaderCircle } from "react-icons/bi";

export default function PizzaCardContainer() {
    const { isLoading, pizzaList } = usePizzaList();

    return (
        <main
            className="
                flex
                h-full
                w-full
                overflow-y-auto
                md:px-20
                sm:px-0
                py-1
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-track]:my-3
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:my-3
                [&::-webkit-scrollbar-thumb]:bg-scrollbar
            "
        >
            {
                isLoading ?
                <div className="mx-auto my-auto p-10 rounded-md bg-secondary">
                    <div className="animate-spin">
                        <BiLoaderCircle className="text-text-secondary" size={50}/>
                    </div>
                </div>
                :
                pizzaList && pizzaList.length ?
                <div className="grid w-full sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-1 justify-center align-top max-h-1/12">
                    {
                        pizzaList.map(pizza => (
                            <PizzaCard pizza={pizza} />
                        ))
                    }
                </div>
                :
                <div className="w-full text-center p-10 rounded-md my-auto bg-secondary text-text-secondary">
                    Похоже, что ничего не нашлось. Проверьте свое подключение к интернету или попробуйте позже
                </div>
            }
        </main>
    )
}