import Header from "~/components/main/Header";
import PizzaCardContainer from "~/components/main/PizzaCardContainer";

export default function Main() {
    return (
        <div className="flex flex-col h-full w-full">
            <div>
                <Header/>
            </div>
            <div className="flex flex-grow min-h-0 justify-center">
                <PizzaCardContainer/>
            </div>
        </div>
    )
}