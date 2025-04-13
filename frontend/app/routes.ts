import { 
    type RouteConfig,
    index,
    route
} from "@react-router/dev/routes";

export default [
    index("routes/Main.tsx"),

    route("signup", "routes/signUp.tsx"),
    route("signin", "routes/signIn.tsx"),
    route("account", "routes/accountSettings.tsx"),

    route("cart", "routes/cart.tsx"),

] satisfies RouteConfig;
