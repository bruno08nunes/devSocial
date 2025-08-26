import AsyncStorage from "@react-native-async-storage/async-storage";

export const getUserData = async () => {
    try {
        const userDataString = await AsyncStorage.getItem("userData");
        if (userDataString) {
            const userData = JSON.parse(userDataString);
            return userData;
        }
        throw new Error();
    } catch (error) {
        console.error(
            "Erro ao carregar dados do usuário do AsyncStorage:",
            error
        );
    }
};
