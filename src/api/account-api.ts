import { http } from "../utility/http-client"
import type { AccountType } from "./types";

export const getAccount = async () => {
    return await http.get<AccountType>("/admin/account");
};
