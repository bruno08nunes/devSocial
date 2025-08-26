import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import api from "../services/api";

export const favoritePost = async (postId) => {
    try {
        const userToken = await AsyncStorage.getItem("userToken");
        if (!userToken) {
            Alert.alert(
                "Erro",
                "Você precisa estar logado para favoritar posts."
            );
            return null;
        }
        const response = await api.post(
            `/posts/${postId}/favorite`,
            {},
            { headers: { Authorization: `Bearer ${userToken}` } }
        );
        Alert.alert("Sucesso", response.data.message);
        return response;
    } catch (error) {
        console.error(
            "Erro ao favoritar/desfavoritar:",
            error.response?.data || error.message
        );
        Alert.alert(
            "Erro",
            error.response?.data?.message ||
                "Não foi possível processar o favorito."
        );
        if (error.response?.status === 401 || error.response?.status === 403) {
            return null;
        }
    }
};
