import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import api from "../services/api";

export const fetchPosts = async ({ searchTerm }) => {
    try {
        const response = await api.get(`/posts?q=${searchTerm}`);

        let initialUserLikes = {};
        try {
            const likesResponse = await api.get(`/users/likes`, {
                headers: {
                    Authorization: `Bearer ${await AsyncStorage.getItem(
                        "userToken"
                    )}`,
                },
            });
            likesResponse.data.forEach((like) => {
                initialUserLikes[like.post_id] = true;
            });
        } catch (likesError) {
            console.error(
                "Erro ao buscar likes do usuário para inicialização:",
                likesError.response?.data || likesError.message
            );
        }

        return { initialUserLikes, posts: response.data };
    } catch (error) {
        console.error(
            "Erro ao buscar posts:",
            error.response?.data || error.message
        );
        Alert.alert("Erro", "Não foi possível carregar os posts.");

        return null;
    }
};
