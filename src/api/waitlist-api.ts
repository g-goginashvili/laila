import { http } from "../utility/http-client"

export const joinWaitlist = async (email: string) => {
    return await http.post<{ message: string }>("/waitlist", { email });
};
