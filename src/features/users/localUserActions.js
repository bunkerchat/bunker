import { emit } from "../../api";

export const ping = () => () => emit("/user/current/ping");
