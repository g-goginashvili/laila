import { http } from "../utility/http-client"

export const adminSignUp = async (
    values: Record<string, string>,
) => {
    return await http.post<{ uid: string }>(
        "/auth/admin-sign-up",
        {
            name: values.name,
            surname: values.surname,
            email: values.email,
            phoneNumber: values.phoneNumber,
            orgName: values.orgName,
            address: values.address,
            password: values.password,
            singleLocation: values.numberOfStores !== "multiple",
        }
    );
};
