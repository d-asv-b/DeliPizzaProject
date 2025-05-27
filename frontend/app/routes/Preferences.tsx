import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiLoaderCircle } from "react-icons/bi";
import { FiX } from "react-icons/fi";
import { useNavigate } from "react-router";
import { getFavouriteTags, getPizzaTags, setUserFavouriteTags } from "~/api/pizza";
import Button from "~/components/general/Button";
import { useAuthContext } from "~/contexts/AuthContext";
import type { Tag } from "~/models/pizza";

type TagComponentProps = {
    tag: Tag;
    isFavourite: boolean;
    onClick: () => void;
    removeFromFav: () => void;
};

function TagComponent({ tag, isFavourite, onClick, removeFromFav }: TagComponentProps) {
    return (
        <div
            className="flex flex-row items-center justify-center border-2 border-gray-600 rounded-full px-4 py-1 text-lg cursor-pointer"
        >
            <div onClick={ onClick } className="p-2 items-center">
                { tag.value }
            </div>
            {
                isFavourite
                &&
                <div
                    className="p-1 border-gray-300 border-l-2 text-red-500 hover:text-red-700 active:text-red-800 hover:cursor-pointer items-center"
                    onClick={ removeFromFav }
                >
                    <FiX size={20}/>
                </div>
            }
        </div>
    );
}

export default function UserPizzaPreferences() {
    const navigate = useNavigate();
    const [ favouriteTags, setFavouriteTags ] = useState<Tag[]>([]);
    const [ allTags, setAllTags ] = useState<Tag[]>([]);

    const { user } = useAuthContext();
    useEffect(
        () => {
            if (user === null) {
                toast.error("Вы не авторизованы!");
                navigate("/signIn");
                return;
            }
        }, [user]
    );

    const [ loadingTags, setLoadingTags ] = useState<boolean>(true);
    const [ loadingFavTags, setLoadingFavTags ] = useState<boolean>(true);

    const [ savingFavTags, setSavingFavTags ] = useState<boolean>(false);

    useEffect(
        () => {
            const fetchTags = async () => {
                try {
                    const result = await getPizzaTags();
                    return result;
                }
                catch (error) {
                    if (error instanceof AxiosError && error.response) {
                        if (error.response.data.error) {
                            console.error(error.response.data.error);
                        }
                        else {
                            console.error(error.message);
                        }
                    }
                    else {
                        console.error("Что-то пошло не так :(");
                    }

                    return [];
                }
            }

            const fetchFavTags = async () => {
                try {
                    const result = await getFavouriteTags();
                    return result;
                }
                catch (error) {
                    navigate("/");
                    return [];
                }
            }

            fetchTags()
            .then(
                (val) => {
                    setAllTags(val);
                    setLoadingTags(false);
                }
            );

            fetchFavTags()
            .then(
                (val) => {
                    setFavouriteTags(val);
                    setLoadingFavTags(false);
                }
            );
        }, []
    );


    return (
        <div className="h-full w-full flex justify-center items-center bg-transparent">
            <div className="flex flex-col h-full w-full rounded-none xl:h-5/6 xl:w-5/6 2xl:w-3/4 3xl:w-2/3 xl:rounded-2xl bg-secondary text-text-secondary">
                <div className="flex flex-row p-5">
                    <Button
                        onClick={ () => navigate("/") }
                    >
                        На главную
                    </Button>
                </div>
                <div className="flex flex-col grow px-10 py-5">
                    <div className="text-3xl font-bold">
                        Выберите ваши любимые типы пицц
                    </div>

                    <div className="flex flex-col grow">
                        <div className="flex grow items-center justify-center">
                            {
                                loadingTags && loadingFavTags
                                ?
                                <div className="flex">
                                    <BiLoaderCircle className="text-text-secondary animate-spin" size={50}/>
                                </div>
                                :
                                <div className="flex flex-row flex-wrap items-center gap-2 max-w-2/3 justify-center">
                                    {
                                        allTags?.map(
                                            tag => (
                                                <TagComponent
                                                    key={tag.id}
                                                    tag={tag}
                                                    onClick={
                                                        () => setFavouriteTags([...favouriteTags, tag ])
                                                    }
                                                    removeFromFav={
                                                        () => setFavouriteTags(favouriteTags.filter((fav_tag) => tag.id !== fav_tag.id ))
                                                    }
                                                    isFavourite={ favouriteTags.some(fav_tag => fav_tag.id === tag.id) }
                                                />
                                            )
                                        )
                                    }
                                </div>                                
                            }
                        </div>
                    </div>

                    <div className="flex flex-row place-content-center gap-5 mb-5">
                        <Button
                            extraClasses="py-3 px-15 text-xl font-semibold"
                            onClick={ async () => {
                                try {
                                    const result = await setUserFavouriteTags({ tag_ids: favouriteTags.map(tag => tag.id) });
                                    setFavouriteTags(result);
                                }
                                catch (error) {
                                    if (error instanceof AxiosError && error.response) {
                                        if (error.response.data.error) {
                                            toast.error(error.response.data.error);
                                        }
                                        else {
                                            toast.error(error.message);
                                        }
                                    }
                                    else {
                                        toast.error("Что-то пошло не так :(");
                                    }
                                }
                            } }
                        >
                            {
                                savingFavTags
                                ?
                                <div className="flex">
                                    <BiLoaderCircle className="text-text-secondary animate-spin" size={50}/>
                                </div>
                                :
                                "Сохранить"
                            }
                        </Button>

                        <Button
                            extraClasses="py-3 px-15 text-xl font-semibold bg-red-500 hover:bg-red-700 active:bg-red-800"
                            onClick={ () => { setFavouriteTags([]) } }
                        >
                            Сбросить
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}