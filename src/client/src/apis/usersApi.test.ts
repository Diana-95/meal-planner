import { User } from "../types/types"
import { loginUser, registerUser, updateUser } from "./usersApi"
import { axiosInstanceAuth } from "./utils";

jest.mock('./utils');
describe(' users API', () => {
    const userExample: User = {
        id: 0,
        username: "diana",
        email: "diapant@mail.com"
    } satisfies User;

    test('registerUser', async () => {
        (axiosInstanceAuth.post as jest.Mock).mockReturnValue({data:{ rowID: 1 }});
        const actualResponse = await registerUser(userExample.username, userExample.email, 'password');
        expect(actualResponse).toEqual(actualResponse);
    });

    test('login user', async () => {
        (axiosInstanceAuth.post as jest.Mock).mockReturnValue({data: userExample});
        const actualResponse = await loginUser(userExample.username, 'password');
        expect(actualResponse).toEqual(userExample);
        
    });

    test('update user info', async () => {
        (axiosInstanceAuth.put as jest.Mock).mockReturnValue({data:{ success: true }});
        const actualResponse = await updateUser(userExample.username, userExample.email, 'password');
        expect(actualResponse).toEqual({success: true});
    });

    
})