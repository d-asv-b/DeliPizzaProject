import { 
    type RouteConfig,
    index,
    route
} from "@react-router/dev/routes";

export default [
    index("routes/main.tsx"),

    route("signup", "routes/signUp.tsx"),
    route("signin", "routes/signUp.tsx"),
    route("account", "route/accountSettings.tsx"),

    route("cart", "route/cart.tsx"),

] satisfies RouteConfig;
