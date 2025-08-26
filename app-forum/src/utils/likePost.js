import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import api from "../services/api";

export const likePost = async (postId) => {
    const userToken = await AsyncStorage.getItem("userToken");
    if (!userToken) {
        Alert.alert("Erro", "Você precisa estar logado para curtir posts.");
        return null;
    }
    const response = await api.post(
        `/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${userToken}` } }
    );
    const liked = response.data.liked;

    return liked;
};
