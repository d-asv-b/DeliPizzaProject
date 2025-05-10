import { 
    type RouteConfig,
    index,
    route
} from "@react-router/dev/routes";

export default [
    index("routes/Main.tsx"),

    route("signup", "routes/SignUp.tsx"),
    route("signin", "routes/SignIn.tsx"),
    route("account/*", "routes/AccountSettings.tsx"),

    route("cart", "routes/Cart.tsx"),

] satisfies RouteConfig;
